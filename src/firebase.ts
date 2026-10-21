import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { SecurityAlert, DetectionRecord, RealTimePhoto } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;

export const FIRESTORE_CONSOLE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline check: please verify connection.');
    }
  }
}
testConnection();

export interface CustomerDoc {
  id: string;
  name: string;
  status: string;
  loyaltyTier: string;
  faceConfidence: number;
  lastZone: string;
  lastActiveProduct: string;
  totalItemsPicked: number;
  totalCartValue: number;
  registeredAt: string;
}

export interface ProductDoc {
  id: string;
  name: string;
  category: string;
  price: number;
  aisle: string;
  shelfZone: string;
  stockLevel: number;
  skuBarcode: string;
  confidence: number;
}

export async function saveCustomerToFirestore(customer: CustomerDoc): Promise<void> {
  const path = `customers/${customer.id}`;
  try {
    await setDoc(doc(db, 'customers', customer.id), customer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveProductToFirestore(product: ProductDoc): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveAlertToFirestore(alert: SecurityAlert): Promise<void> {
  const path = `alerts/${alert.id}`;
  try {
    await setDoc(doc(db, 'alerts', alert.id), alert);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveDetectionToFirestore(detection: DetectionRecord): Promise<void> {
  const path = `detections/${detection.id}`;
  try {
    await setDoc(doc(db, 'detections', detection.id), detection);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function savePhotoToFirestore(photo: RealTimePhoto): Promise<void> {
  const path = `photos/${photo.id}`;
  try {
    // Only save essential attributes to stay well within limits
    const payload = {
      id: photo.id,
      timestamp: photo.timestamp,
      timeEpoch: photo.timeEpoch,
      camera: photo.camera,
      location: photo.location,
      customerId: photo.customerId,
      customerConfidence: photo.customerConfidence,
      productId: photo.productId,
      productName: photo.productName,
      productPrice: photo.productPrice,
      productCategory: photo.productCategory,
      productConfidence: photo.productConfidence,
      eventStatus: photo.eventStatus,
      threatSeverity: photo.threatSeverity,
      imageUrl: photo.imageUrl.slice(0, 50000), // bounded
    };
    await setDoc(doc(db, 'photos', photo.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAllCustomers(): Promise<CustomerDoc[]> {
  try {
    const snap = await getDocs(collection(db, 'customers'));
    return snap.docs.map((d) => d.data() as CustomerDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'customers');
    return [];
  }
}

export async function fetchAllProducts(): Promise<ProductDoc[]> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    return snap.docs.map((d) => d.data() as ProductDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
    return [];
  }
}

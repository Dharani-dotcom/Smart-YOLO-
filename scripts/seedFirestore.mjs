import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const rawConfig = fs.readFileSync('./firebase-applet-config.json', 'utf-8');
const firebaseConfig = JSON.parse(rawConfig);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const customers = [
  {
    id: 'HUMAN-1042',
    name: 'Marcus Vance',
    status: 'Active Shopper',
    loyaltyTier: 'Gold Executive',
    faceConfidence: 99.4,
    lastZone: 'Organic Fruits & Greens Aisle',
    lastActiveProduct: 'PRD-8821',
    totalItemsPicked: 3,
    totalCartValue: 24.50,
    registeredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'HUMAN-5519',
    name: 'Robert Langdon',
    status: 'Active Shopper',
    loyaltyTier: 'Silver Member',
    faceConfidence: 98.8,
    lastZone: 'Breakfast Aisle 3 (Shelves)',
    lastActiveProduct: 'PRD-7714',
    totalItemsPicked: 2,
    totalCartValue: 14.80,
    registeredAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'HUMAN-3910',
    name: 'Sarah Jenkins',
    status: 'Active Shopper',
    loyaltyTier: 'Standard',
    faceConfidence: 99.0,
    lastZone: 'Refrigerated Cases Aisle 4',
    lastActiveProduct: 'PRD-3301',
    totalItemsPicked: 4,
    totalCartValue: 31.20,
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'HUMAN-7712',
    name: 'Chloe Bennett',
    status: 'Active Shopper',
    loyaltyTier: 'Standard',
    faceConfidence: 97.6,
    lastZone: 'Bakery Shelves & Bread Pod',
    lastActiveProduct: 'PRD-5520',
    totalItemsPicked: 1,
    totalCartValue: 5.25,
    registeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'HUMAN-9041',
    name: 'Elena Rostova',
    status: 'VIP Gold',
    loyaltyTier: 'Platinum VIP',
    faceConfidence: 99.1,
    lastZone: 'Central Food Floor & Island',
    lastActiveProduct: 'PRD-1290',
    totalItemsPicked: 5,
    totalCartValue: 89.40,
    registeredAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'HUMAN-2180',
    name: 'David Miller',
    status: 'Checked Out',
    loyaltyTier: 'Gold Patron',
    faceConfidence: 99.3,
    lastZone: 'Self-Checkout Lane 04',
    lastActiveProduct: 'PRD-4019',
    totalItemsPicked: 6,
    totalCartValue: 62.15,
    registeredAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: 'HUMAN-6620',
    name: 'Maya Lin',
    status: 'Active Shopper',
    loyaltyTier: 'Club Member',
    faceConfidence: 98.9,
    lastZone: 'Entrance Gate & Trolleys',
    lastActiveProduct: 'PRD-9902',
    totalItemsPicked: 0,
    totalCartValue: 0.00,
    registeredAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'HUMAN-4418',
    name: 'Liam Gallagher',
    status: 'Active Shopper',
    loyaltyTier: 'Standard',
    faceConfidence: 98.4,
    lastZone: 'Walk-In Freezer Aisle 7',
    lastActiveProduct: 'PRD-6102',
    totalItemsPicked: 2,
    totalCartValue: 11.98,
    registeredAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
];

const products = [
  {
    id: 'PRD-8821',
    name: 'Organic Hass Avocados (4pk)',
    category: 'Produce',
    price: 4.99,
    aisle: 'Aisle 1 - Produce',
    shelfZone: 'Island B4',
    stockLevel: 42,
    skuBarcode: '078512882109',
    confidence: 99.2,
  },
  {
    id: 'PRD-7714',
    name: 'Artisan Honey Almond Granola',
    category: 'Breakfast Cereals',
    price: 6.49,
    aisle: 'Aisle 3 - Breakfast',
    shelfZone: 'Shelf Row 3',
    stockLevel: 28,
    skuBarcode: '034211771402',
    confidence: 98.5,
  },
  {
    id: 'PRD-3301',
    name: 'Organic Almond Milk 64oz',
    category: 'Dairy & Plant Milk',
    price: 3.89,
    aisle: 'Aisle 4 - Refrigerated',
    shelfZone: 'Chiller Bay 2',
    stockLevel: 35,
    skuBarcode: '099182330118',
    confidence: 99.1,
  },
  {
    id: 'PRD-5520',
    name: 'Artisan Sourdough Boule',
    category: 'Bakery & Bread',
    price: 5.25,
    aisle: 'Bakery Counter',
    shelfZone: 'Wood Rack A',
    stockLevel: 16,
    skuBarcode: '088716552033',
    confidence: 98.0,
  },
  {
    id: 'PRD-1290',
    name: 'Colavita Extra Virgin Olive Oil 1L',
    category: 'Oils & Condiments',
    price: 18.99,
    aisle: 'Aisle 5 - Gourmet Imports',
    shelfZone: 'Endcap 5A',
    stockLevel: 22,
    skuBarcode: '011234129087',
    confidence: 99.3,
  },
  {
    id: 'PRD-4019',
    name: 'Lavazza Espresso Ground Coffee',
    category: 'Coffee & Tea',
    price: 11.50,
    aisle: 'Aisle 2 - Hot Beverages',
    shelfZone: 'Shelf Row 2',
    stockLevel: 31,
    skuBarcode: '055419401924',
    confidence: 99.3,
  },
  {
    id: 'PRD-9902',
    name: 'Supermarket Savings Club Pass',
    category: 'Membership & Loyalty',
    price: 0.00,
    aisle: 'Entrance Portal',
    shelfZone: 'Turnstile Kiosk',
    stockLevel: 999,
    skuBarcode: '000000990211',
    confidence: 99.7,
  },
  {
    id: 'PRD-6102',
    name: "Ben & Jerry's Half Baked Pint",
    category: 'Frozen Desserts',
    price: 5.99,
    aisle: 'Aisle 7 - Frozen',
    shelfZone: 'Freezer Unit 3',
    stockLevel: 25,
    skuBarcode: '044910610255',
    confidence: 98.7,
  },
];

const alerts = [
  {
    id: 'alt-01',
    timestamp: '10:42:18 AM',
    timeEpoch: Date.now() - 120000,
    camera: 'Supermarket Cam 01: Produce & Fruits',
    title: 'Product Picked: Organic Hass Avocados (4pk)',
    description: 'Shopper #HUMAN-1042 lifted item #PRD-8821 ($4.99) from organic produce display. Face square locked.',
    severity: 'normal',
    customerId: 'HUMAN-1042',
    productId: 'PRD-8821',
    confidence: 99.4,
    location: 'Organic Produce & Greens',
    reviewed: false,
    threatDetected: false,
  },
  {
    id: 'alt-02',
    timestamp: '10:39:05 AM',
    timeEpoch: Date.now() - 315000,
    camera: 'Supermarket Cam 02: Cereal & Shelves',
    title: 'Product Picked: Artisan Honey Almond Granola',
    description: 'Shopper #HUMAN-5519 reached for cereal box #PRD-7714 ($6.49). Bounding square tracked into cart.',
    severity: 'normal',
    customerId: 'HUMAN-5519',
    productId: 'PRD-7714',
    confidence: 98.8,
    location: 'Breakfast Aisle 3 (Shelves)',
    reviewed: true,
    threatDetected: false,
  },
  {
    id: 'alt-03',
    timestamp: '10:31:40 AM',
    timeEpoch: Date.now() - 760000,
    camera: 'Supermarket Cam 05: Grocery Concourse Floor',
    title: 'VIP Patron #HUMAN-9041 Picked Colavita Olive Oil',
    description: 'Face biometric confirmed VIP Gold member. High-value olive oil #PRD-1290 ($18.99) selected.',
    severity: 'info',
    customerId: 'HUMAN-9041',
    productId: 'PRD-1290',
    confidence: 99.1,
    location: 'Central Food Floor & Island',
    reviewed: true,
    threatDetected: false,
  },
  {
    id: 'alt-04',
    timestamp: '10:24:12 AM',
    timeEpoch: Date.now() - 1200000,
    camera: 'Supermarket Cam 06: Self-Checkout POS Lane',
    title: 'Checkout Scanned: Lavazza Coffee Beans',
    description: 'Shopper #HUMAN-2180 scanned coffee #PRD-4019 at register terminal. EAS tag cleared.',
    severity: 'normal',
    customerId: 'HUMAN-2180',
    productId: 'PRD-4019',
    confidence: 99.3,
    location: 'Self-Checkout Lane 04',
    reviewed: true,
    threatDetected: false,
  },
];

const detections = [
  {
    id: 'DET-8819',
    timestamp: '10:42:18 AM',
    camera: 'Supermarket Cam 01',
    category: 'Product Interaction',
    customerId: 'HUMAN-1042',
    productId: 'PRD-8821',
    confidence: 99.4,
    status: 'Nominal',
    actionTaken: 'Product square locked; price $4.99 registered into session cart',
    zone: 'Organic Produce & Greens',
  },
  {
    id: 'DET-8818',
    timestamp: '10:39:05 AM',
    camera: 'Supermarket Cam 02',
    category: 'Product Interaction',
    customerId: 'HUMAN-5519',
    productId: 'PRD-7714',
    confidence: 98.8,
    status: 'Nominal',
    actionTaken: 'Item lifted from breakfast shelf 3; added to basket record',
    zone: 'Breakfast Aisle 3 (Shelves)',
  },
  {
    id: 'DET-8817',
    timestamp: '10:31:40 AM',
    camera: 'Supermarket Cam 05',
    category: 'VIP Customer',
    customerId: 'HUMAN-9041',
    productId: 'PRD-1290',
    confidence: 99.1,
    status: 'Nominal',
    actionTaken: 'VIP loyalty match verified; premium olive oil tracked',
    zone: 'Central Food Floor & Island',
  },
  {
    id: 'DET-8816',
    timestamp: '10:24:12 AM',
    camera: 'Supermarket Cam 06',
    category: 'Checkout Clearance',
    customerId: 'HUMAN-2180',
    productId: 'PRD-4019',
    confidence: 99.3,
    status: 'Nominal',
    actionTaken: 'Self-checkout barcode matched with physical item in hand',
    zone: 'Self-Checkout Lane 04',
  },
  {
    id: 'DET-8815',
    timestamp: '10:15:30 AM',
    camera: 'Supermarket Cam 07',
    category: 'Customer Entry',
    customerId: 'HUMAN-6620',
    productId: 'PRD-9902',
    confidence: 98.9,
    status: 'Nominal',
    actionTaken: 'Entrance turnstile open; customer ID verified',
    zone: 'Entrance Gate & Trolleys',
  },
];

async function seed() {
  console.log('Seeding Customers...');
  for (const c of customers) {
    await setDoc(doc(db, 'customers', c.id), c);
    console.log(`Saved customer: ${c.id} (${c.name})`);
  }

  console.log('Seeding Products...');
  for (const p of products) {
    await setDoc(doc(db, 'products', p.id), p);
    console.log(`Saved product: ${p.id} (${p.name})`);
  }

  console.log('Seeding Alerts...');
  for (const a of alerts) {
    await setDoc(doc(db, 'alerts', a.id), a);
    console.log(`Saved alert: ${a.id} (Customer ${a.customerId}, Product ${a.productId})`);
  }

  console.log('Seeding Detections...');
  for (const d of detections) {
    await setDoc(doc(db, 'detections', d.id), d);
    console.log(`Saved detection: ${d.id} (Customer ${d.customerId}, Product ${d.productId})`);
  }

  console.log('Successfully seeded database with customer IDs and product IDs!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

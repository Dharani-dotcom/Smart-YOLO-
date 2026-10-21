import { useState, useEffect } from 'react';
import {
  Sliders,
  Bell,
  Shield,
  Video,
  HardDrive,
  Check,
  Save,
  Users,
  Package,
  Plus,
  RefreshCw,
  ExternalLink,
  Search,
  Database
} from 'lucide-react';
import { SystemSettingsState } from '../types';
import {
  saveCustomerToFirestore,
  saveProductToFirestore,
  fetchAllCustomers,
  fetchAllProducts,
  CustomerDoc,
  ProductDoc,
  FIRESTORE_CONSOLE_URL,
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID
} from '../firebase';

interface SystemSettingsViewProps {
  settings: SystemSettingsState;
  onUpdateSettings: (newSettings: SystemSettingsState) => void;
}

export function SystemSettingsView({
  settings,
  onUpdateSettings,
}: SystemSettingsViewProps) {
  const [localSettings, setLocalSettings] = useState<SystemSettingsState>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Firestore DB Explorer State
  const [activeDbTab, setActiveDbTab] = useState<'customers' | 'products'>('customers');
  const [customers, setCustomers] = useState<CustomerDoc[]>([]);
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDb, setLoadingDb] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Quick Add Form
  const [isAddingData, setIsAddingData] = useState(false);
  const [newCustId, setNewCustId] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustStatus, setNewCustStatus] = useState('Active Shopper');
  const [newCustTier, setNewCustTier] = useState('Silver Member');
  const [newCustZone, setNewCustZone] = useState('Produce Aisle 1');

  const [newProdId, setNewProdId] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Supermarket Grocery');
  const [newProdPrice, setNewProdPrice] = useState('4.99');
  const [newProdAisle, setNewProdAisle] = useState('Aisle 2');

  const loadDatabaseData = async () => {
    setLoadingDb(true);
    try {
      const [fetchedCustomers, fetchedProducts] = await Promise.all([
        fetchAllCustomers(),
        fetchAllProducts(),
      ]);
      setCustomers(fetchedCustomers);
      setProducts(fetchedProducts);
    } catch (err) {
      console.warn('Error fetching Firestore data:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSyncAllMockData = async () => {
    setSyncStatus('Synchronizing all App Customer IDs and Product IDs to Firebase...');
    try {
      // Re-seed all supermarket items
      const sampleCustomers: CustomerDoc[] = [
        {
          id: 'HUMAN-1042',
          name: 'Marcus Vance',
          status: 'Active Shopper',
          loyaltyTier: 'Gold Executive',
          faceConfidence: 99.4,
          lastZone: 'Organic Fruits & Greens Aisle',
          lastActiveProduct: 'PRD-8821',
          totalItemsPicked: 3,
          totalCartValue: 24.5,
          registeredAt: new Date().toISOString(),
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
          totalCartValue: 14.8,
          registeredAt: new Date().toISOString(),
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
          totalCartValue: 31.2,
          registeredAt: new Date().toISOString(),
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
          registeredAt: new Date().toISOString(),
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
          totalCartValue: 89.4,
          registeredAt: new Date().toISOString(),
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
          registeredAt: new Date().toISOString(),
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
          totalCartValue: 0.0,
          registeredAt: new Date().toISOString(),
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
          registeredAt: new Date().toISOString(),
        },
      ];

      const sampleProducts: ProductDoc[] = [
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
          price: 11.5,
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
          price: 0.0,
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

      for (const c of sampleCustomers) {
        await saveCustomerToFirestore(c);
      }
      for (const p of sampleProducts) {
        await saveProductToFirestore(p);
      }

      await loadDatabaseData();
      setSyncStatus('Successfully pushed all Customer & Product IDs to Firebase Firestore!');
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setSyncStatus('Sync encountered an error. Check console.');
    }
  };

  const handleAddNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustId.trim() || !newCustName.trim()) return;

    const formattedId = newCustId.trim().toUpperCase().replace(/\s+/g, '-');
    const customerDoc: CustomerDoc = {
      id: formattedId,
      name: newCustName.trim(),
      status: newCustStatus,
      loyaltyTier: newCustTier,
      faceConfidence: 98.7,
      lastZone: newCustZone,
      lastActiveProduct: 'PRD-8821',
      totalItemsPicked: 1,
      totalCartValue: 12.5,
      registeredAt: new Date().toISOString(),
    };

    setSyncStatus(`Adding Customer ID #${formattedId} to Firebase...`);
    try {
      await saveCustomerToFirestore(customerDoc);
      setNewCustId('');
      setNewCustName('');
      setIsAddingData(false);
      await loadDatabaseData();
      setSyncStatus(`Customer #${formattedId} added successfully to Firebase!`);
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSyncStatus('Failed to write customer document.');
    }
  };

  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdId.trim() || !newProdName.trim()) return;

    const formattedId = newProdId.trim().toUpperCase().replace(/\s+/g, '-');
    const prodDoc: ProductDoc = {
      id: formattedId,
      name: newProdName.trim(),
      category: newProdCategory,
      price: parseFloat(newProdPrice) || 3.99,
      aisle: newProdAisle,
      shelfZone: 'Display Section A',
      stockLevel: 50,
      skuBarcode: `SKU-${Date.now().toString().slice(-6)}`,
      confidence: 99.0,
    };

    setSyncStatus(`Adding Product ID #${formattedId} to Firebase...`);
    try {
      await saveProductToFirestore(prodDoc);
      setNewProdId('');
      setNewProdName('');
      setIsAddingData(false);
      await loadDatabaseData();
      setSyncStatus(`Product #${formattedId} added successfully to Firebase!`);
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSyncStatus('Failed to write product document.');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastZone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-5xl bg-slate-50/80">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Firebase Database</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure surveillance parameters and manage live Firestore database records (Customer IDs & Product IDs)
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Security parameters successfully committed to edge gateway controllers.</span>
        </div>
      )}

      {/* Group 1: Firebase Firestore Cloud Database (Primary Focus) */}
      <div className="p-5 rounded-xl bg-white border border-cyan-200 shadow-xs space-y-4 bg-linear-to-b from-white to-cyan-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Database className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Firebase Firestore Cloud Database</h2>
              <div className="text-[11px] text-slate-500">
                Connected to project: <span className="font-semibold text-slate-700">{FIREBASE_PROJECT_ID}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Connected
            </span>

            <a
              href={FIRESTORE_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <span>Console Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Console Link & DB Credential Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono space-y-1.5 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-bold">Firestore Config</div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Project ID:</span>
              <span className="text-amber-300 font-bold">{FIREBASE_PROJECT_ID}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database ID:</span>
              <span className="text-cyan-300 font-bold truncate max-w-[200px]" title={FIRESTORE_DATABASE_ID}>
                {FIRESTORE_DATABASE_ID}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Database Collections</div>
              <div className="text-xs text-slate-700 mt-1 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-semibold">/customers</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-semibold">/products</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-semibold">/alerts</span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-semibold">/detections</span>
                <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-800 font-mono font-semibold">/photos</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncAllMockData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Sync / Push App Data</span>
              </button>
              <button
                onClick={() => setIsAddingData(!isAddingData)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-600" />
                <span>{isAddingData ? 'Hide Add Form' : 'Add Custom ID'}</span>
              </button>
            </div>
          </div>
        </div>

        {syncStatus && (
          <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-medium text-cyan-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Add custom ID form modal/section */}
        {isAddingData && (
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Insert New Record to Firestore Database
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveDbTab('customers')}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    activeDbTab === 'customers' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  Customer ID (cu sid)
                </button>
                <button
                  onClick={() => setActiveDbTab('products')}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    activeDbTab === 'products' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  Product ID (product id)
                </button>
              </div>
            </div>

            {activeDbTab === 'customers' ? (
              <form onSubmit={handleAddNewCustomer} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Customer ID (cu sid)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HUMAN-8832"
                    value={newCustId}
                    onChange={(e) => setNewCustId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Shopper Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Cole"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Zone / Aisle</label>
                  <input
                    type="text"
                    placeholder="e.g. Bakery Section Aisle 2"
                    value={newCustZone}
                    onChange={(e) => setNewCustZone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingData(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs"
                  >
                    Save Customer to Firestore
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddNewProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product ID (product id)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRD-9055"
                    value={newProdId}
                    onChange={(e) => setNewProdId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greek Yogurt 32oz"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="4.99"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingData(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs"
                  >
                    Save Product to Firestore
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Database Explorer Tabs & Table */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveDbTab('customers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  activeDbTab === 'customers'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-cyan-600" />
                <span>Customers in DB ({customers.length})</span>
              </button>
              <button
                onClick={() => setActiveDbTab('products')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  activeDbTab === 'products'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span>Products in DB ({products.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter IDs or names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500 w-48"
                />
              </div>

              <button
                onClick={loadDatabaseData}
                disabled={loadingDb}
                title="Refresh database records"
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? 'animate-spin text-cyan-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table display */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            {activeDbTab === 'customers' ? (
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Customer ID (cu sid)</th>
                      <th className="py-2.5 px-3">Shopper Name</th>
                      <th className="py-2.5 px-3">Loyalty Tier</th>
                      <th className="py-2.5 px-3">Current Zone</th>
                      <th className="py-2.5 px-3">Active Product ID</th>
                      <th className="py-2.5 px-3 text-right">Items Picked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                          {loadingDb ? 'Loading records from Firestore...' : 'No customer records found. Click "Re-Sync / Push App Data" above.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-cyan-700">
                            <span className="px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200">
                              #{cust.id}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{cust.name}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-600">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                              {cust.loyaltyTier || 'Standard'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-600">{cust.lastZone}</td>
                          <td className="py-2.5 px-3 text-amber-700 font-bold">
                            {cust.lastActiveProduct ? `#${cust.lastActiveProduct}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-sans font-bold text-slate-800">
                            {cust.totalItemsPicked || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Product ID (product id)</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Aisle / Shelf</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                          {loadingDb ? 'Loading records from Firestore...' : 'No product records found. Click "Re-Sync / Push App Data" above.'}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-amber-700">
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
                              #{prod.id}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{prod.name}</td>
                          <td className="py-2.5 px-3 font-sans text-slate-600">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                              {prod.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-600">{prod.aisle}</td>
                          <td className="py-2.5 px-3 text-right font-sans font-bold text-emerald-700">
                            ${typeof prod.price === 'number' ? prod.price.toFixed(2) : prod.price}
                          </td>
                          <td className="py-2.5 px-3 text-right font-sans text-slate-600">{prod.stockLevel || 30}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group 2: AI Detection & Vision Engine */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Sliders className="w-4 h-4 text-cyan-600" />
          <h2 className="text-sm font-bold text-slate-900">Neural Detection Parameters</h2>
        </div>

        {/* AI Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-700 font-semibold">
              Biometric Match Confidence Threshold
            </label>
            <span className="font-mono font-bold text-cyan-700">
              {localSettings.aiConfidenceThreshold}%
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="98"
            step="1"
            value={localSettings.aiConfidenceThreshold}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                aiConfidenceThreshold: Number(e.target.value),
              })
            }
            className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>60% (High Recall)</span>
            <span>98% (High Precision)</span>
          </div>
        </div>

        {/* Loitering Threshold */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-700 font-semibold">
              Loitering Dwell Trigger Time
            </label>
            <span className="font-mono font-bold text-cyan-700">
              {localSettings.loiteringThresholdSeconds}s
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="600"
            step="15"
            value={localSettings.loiteringThresholdSeconds}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                loiteringThresholdSeconds: Number(e.target.value),
              })
            }
            className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>30s (Rapid Alert)</span>
            <span>600s (Extended Browse)</span>
          </div>
        </div>

        {/* Toggle Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">Auto-Flag Loitering</div>
              <div className="text-[11px] text-slate-500">Raise warning on stationary target</div>
            </div>
            <button
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  autoFlagLoitering: !localSettings.autoFlagLoitering,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative ${
                localSettings.autoFlagLoitering ? 'bg-cyan-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  localSettings.autoFlagLoitering ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">Facial Bounding Squares</div>
              <div className="text-[11px] text-slate-500">Project customer identifier boxes</div>
            </div>
            <button
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  facialRecognitionActive: !localSettings.facialRecognitionActive,
                })
              }
              className={`w-11 h-6 rounded-full transition-colors relative ${
                localSettings.facialRecognitionActive ? 'bg-cyan-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  localSettings.facialRecognitionActive ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Group 3: Audio & Alert Notifications */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Bell className="w-4 h-4 text-cyan-600" />
          <h2 className="text-sm font-bold text-slate-900">Audio Telemetry & Notifications</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900">Audible Surveillance Alert Chime</div>
            <div className="text-[11px] text-slate-500">
              Plays acoustic frequency tone when priority warning or threat event occurs
            </div>
          </div>
          <button
            onClick={() =>
              setLocalSettings({
                ...localSettings,
                alertSoundEnabled: !localSettings.alertSoundEnabled,
              })
            }
            className={`w-11 h-6 rounded-full transition-colors relative ${
              localSettings.alertSoundEnabled ? 'bg-cyan-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                localSettings.alertSoundEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Group 4: Video Streaming & Hardware */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Video className="w-4 h-4 text-cyan-600" />
          <h2 className="text-sm font-bold text-slate-900">Camera Resolution & Compression</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Stream Quality</label>
            <select
              value={localSettings.recordingResolution}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, recordingResolution: e.target.value as any })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="1080p">1080p Full HD (Recommended)</option>
              <option value="1440p">1440p 2K Ultra HD</option>
              <option value="4K">4K UHD High Density</option>
              <option value="720p">720p Low Bandwidth</option>
            </select>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1.5">Storage Retention Period</label>
            <select
              value={localSettings.retentionDays}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, retentionDays: Number(e.target.value) })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value={7}>7 Days (GDPR Compliance)</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days (Standard Audit)</option>
              <option value={90}>90 Days (Enterprise)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { PRODUCTS, STORE_INFO, DEFAULT_HERO_SLIDES } from './src/data/products.js';
import { Product, StoreInfo, HeroSlideItem } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// High body limits for compressed images and base64 assets
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistence Data File
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'azal_db.json');

interface DatabaseSchema {
  products: Product[];
  heroSlides: HeroSlideItem[];
  storeInfo: StoreInfo;
  appointments: Array<{
    id: string;
    fullName: string;
    phone: string;
    serviceType: string;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
    createdAt: string;
    status: string;
  }>;
  orders: Array<{
    id: string;
    customerName: string;
    phone: string;
    address: string;
    city: string;
    items: Array<unknown>;
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    notes?: string;
    createdAt: string;
    status: string;
  }>;
  updatedAt: string;
}

// Initialize database with default data if not exists
function getInitialData(): DatabaseSchema {
  return {
    products: PRODUCTS,
    heroSlides: DEFAULT_HERO_SLIDES,
    storeInfo: STORE_INFO,
    appointments: [],
    orders: [],
    updatedAt: new Date().toISOString()
  };
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return {
          products: data.products,
          heroSlides: Array.isArray(data.heroSlides) && data.heroSlides.length > 0 ? data.heroSlides : DEFAULT_HERO_SLIDES,
          storeInfo: data.storeInfo ? { ...STORE_INFO, ...data.storeInfo } : STORE_INFO,
          appointments: Array.isArray(data.appointments) ? data.appointments : [],
          orders: Array.isArray(data.orders) ? data.orders : [],
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.error('Error reading database file, using fallback defaults:', err);
  }
  const initial = getInitialData();
  writeDb(initial);
  return initial;
}

function writeDb(data: DatabaseSchema): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
}

// ----------------------------------------------------
// API ROUTES (Always placed before Vite middleware)
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Fetch all public & store data (Called by all visitors & admin)
app.get('/api/data', (req, res) => {
  try {
    const db = readDb();
    res.json({
      success: true,
      products: db.products,
      heroSlides: db.heroSlides,
      storeInfo: db.storeInfo,
      updatedAt: db.updatedAt
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to read data' });
  }
});

// 3. Sync all data (Bulk save products, slides, store info)
app.post('/api/sync-all', (req, res) => {
  try {
    const { products, heroSlides, storeInfo } = req.body;
    const db = readDb();
    if (Array.isArray(products)) db.products = products;
    if (Array.isArray(heroSlides)) db.heroSlides = heroSlides;
    if (storeInfo && typeof storeInfo === 'object') db.storeInfo = { ...db.storeInfo, ...storeInfo };
    db.updatedAt = new Date().toISOString();

    const success = writeDb(db);
    if (success) {
      res.json({ success: true, message: 'All data synchronized and saved permanently on server', updatedAt: db.updatedAt });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database file' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to sync data' });
  }
});

// 4. Update or Add a single product
app.post('/api/products', (req, res) => {
  try {
    const product: Product = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ success: false, error: 'Invalid product data' });
    }

    const db = readDb();
    const existingIndex = db.products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      db.products[existingIndex] = product;
    } else {
      db.products.unshift(product);
    }
    db.updatedAt = new Date().toISOString();
    writeDb(db);

    res.json({ success: true, product, message: 'Product saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save product' });
  }
});

// 5. Delete a product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDb();
    db.products = db.products.filter(p => p.id !== id);
    db.updatedAt = new Date().toISOString();
    writeDb(db);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

// 6. Update Hero Slides
app.post('/api/hero-slides', (req, res) => {
  try {
    const { heroSlides } = req.body;
    if (!Array.isArray(heroSlides)) {
      return res.status(400).json({ success: false, error: 'Invalid slides payload' });
    }
    const db = readDb();
    db.heroSlides = heroSlides;
    db.updatedAt = new Date().toISOString();
    writeDb(db);

    res.json({ success: true, heroSlides: db.heroSlides, message: 'Hero slides updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update hero slides' });
  }
});

// 7. Update Store Info
app.post('/api/store-info', (req, res) => {
  try {
    const { storeInfo } = req.body;
    if (!storeInfo) {
      return res.status(400).json({ success: false, error: 'Invalid store info payload' });
    }
    const db = readDb();
    db.storeInfo = { ...db.storeInfo, ...storeInfo };
    db.updatedAt = new Date().toISOString();
    writeDb(db);

    res.json({ success: true, storeInfo: db.storeInfo, message: 'Store info updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update store info' });
  }
});

// 8. Appointments (Bookings)
app.get('/api/appointments', (req, res) => {
  try {
    const db = readDb();
    res.json({ success: true, appointments: db.appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    const appointment = req.body;
    const db = readDb();
    const newAppointment = {
      id: `apt-${Date.now()}`,
      fullName: appointment.fullName || 'عميل',
      phone: appointment.phone || '',
      serviceType: appointment.serviceType || 'فحص نظر',
      preferredDate: appointment.preferredDate || new Date().toISOString().split('T')[0],
      preferredTime: appointment.preferredTime || '',
      notes: appointment.notes || '',
      createdAt: new Date().toISOString(),
      status: 'جديد'
    };
    db.appointments.unshift(newAppointment);
    writeDb(db);

    res.json({ success: true, appointment: newAppointment, message: 'Appointment booked successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to book appointment' });
  }
});

// 9. Orders
app.get('/api/orders', (req, res) => {
  try {
    const db = readDb();
    res.json({ success: true, orders: db.orders });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    const db = readDb();
    const newOrder = {
      id: `ord-${Date.now()}`,
      customerName: orderData.customerName || 'عميل',
      phone: orderData.phone || '',
      address: orderData.address || '',
      city: orderData.city || 'تعز',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      currency: orderData.currency || 'YER',
      paymentMethod: orderData.paymentMethod || 'الدفع عند الاستلام',
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      status: 'قيد المراجعة'
    };
    db.orders.unshift(newOrder);
    writeDb(db);

    res.json({ success: true, order: newOrder, message: 'Order created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// 10. Reset data to initial defaults
app.post('/api/reset-data', (req, res) => {
  try {
    const initial = getInitialData();
    writeDb(initial);
    res.json({
      success: true,
      products: initial.products,
      heroSlides: initial.heroSlides,
      storeInfo: initial.storeInfo,
      message: 'Data reset to defaults successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reset data' });
  }
});

// ----------------------------------------------------
// Frontend Serving & Vite Integration
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Azal Optics Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

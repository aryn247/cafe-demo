import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints

// 1. Menu API
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await db.getMenu();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve menu items.' });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await db.updateMenuItem(id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Menu item not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const newItem = await db.addMenuItem(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item.' });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.deleteMenuItem(id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Menu item not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
});

// 2. Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = await db.addOrder(req.body);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await db.updateOrderStatus(id, status);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Order not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// 3. Reservations API
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await db.getReservations();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve reservations.' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const newRes = await db.addReservation(req.body);
    res.status(201).json(newRes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reservation.' });
  }
});

// Production: Serve Frontend Static Assets
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route to serve the built index.html (SPA Fallback)
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AromaBlend Backend] Server is running on port ${PORT}`);
});

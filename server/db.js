import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

// Helper to read database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON database:', error);
    return { menu: [], orders: [], reservations: [] };
  }
}

// Helper to write database
async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing JSON database:', error);
    return false;
  }
}

export const db = {
  // Menu operations
  async getMenu() {
    const data = await readDB();
    return data.menu;
  },

  async updateMenuItem(id, updates) {
    const data = await readDB();
    const index = data.menu.findIndex(item => item.id === id);
    if (index > -1) {
      data.menu[index] = { ...data.menu[index], ...updates };
      await writeDB(data);
      return data.menu[index];
    }
    return null;
  },

  async addMenuItem(item) {
    const data = await readDB();
    data.menu.push(item);
    await writeDB(data);
    return item;
  },

  async deleteMenuItem(id) {
    const data = await readDB();
    const initialLength = data.menu.length;
    data.menu = data.menu.filter(item => item.id !== id);
    if (data.menu.length < initialLength) {
      await writeDB(data);
      return true;
    }
    return false;
  },

  // Orders operations
  async getOrders() {
    const data = await readDB();
    return data.orders;
  },

  async addOrder(order) {
    const data = await readDB();
    const newOrder = {
      id: 'ord-' + Date.now(),
      status: 'pending',
      timestamp: new Date().toISOString(),
      ...order
    };
    data.orders.push(newOrder);
    await writeDB(data);
    return newOrder;
  },

  async updateOrderStatus(id, status) {
    const data = await readDB();
    const index = data.orders.findIndex(ord => ord.id === id);
    if (index > -1) {
      data.orders[index].status = status;
      await writeDB(data);
      return data.orders[index];
    }
    return null;
  },

  // Reservations operations
  async getReservations() {
    const data = await readDB();
    return data.reservations;
  },

  async addReservation(res) {
    const data = await readDB();
    const newRes = {
      id: 'res-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...res
    };
    data.reservations.push(newRes);
    await writeDB(data);
    return newRes;
  }
};

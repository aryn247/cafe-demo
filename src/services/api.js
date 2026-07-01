const API_BASE = '/api';

export const api = {
  // Menu Methods
  async getMenu() {
    const res = await fetch(`${API_BASE}/menu`);
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  async updateMenuItem(id, updates) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return res.json();
  },

  async addMenuItem(item) {
    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to add menu item');
    return res.json();
  },

  async deleteMenuItem(id) {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete menu item');
    return res.json();
  },

  // Orders Methods
  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async placeOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Failed to place order');
    return res.json();
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Reservations Methods
  async getReservations() {
    const res = await fetch(`${API_BASE}/reservations`);
    if (!res.ok) throw new Error('Failed to fetch reservations');
    return res.json();
  },

  async addReservation(resData) {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resData)
    });
    if (!res.ok) throw new Error('Failed to add reservation');
    return res.json();
  }
};

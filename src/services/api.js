const API_BASE = 'http://localhost:5000/api';

export const api = {
  // ─── ORDERS ───────────────────────────────────────────
  getOrders: async () => {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  getOrder: async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  addOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  updateOrderNGOStatus: async (id, action) => {
    const res = await fetch(`${API_BASE}/orders/${id}/ngo-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Failed to update NGO status');
    return res.json();
  },

  clearOrders: async () => {
    const res = await fetch(`${API_BASE}/orders`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear orders');
    return res.json();
  },

  // ─── AUTH ────────────────────────────────────────────
  login: async (name, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  signup: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Signup failed');
    }
    return res.json();
  },

  googleAuth: async (googleData) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Google Auth failed');
    }
    return res.json();
  },

  updateUser: async (id, userData) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  // ─── VOLUNTEERS ───────────────────────────────────────
  getVolunteers: async () => {
    const res = await fetch(`${API_BASE}/volunteers`);
    if (!res.ok) throw new Error('Failed to fetch volunteers');
    return res.json();
  },

  addVolunteer: async (data) => {
    const res = await fetch(`${API_BASE}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add volunteer');
    return res.json();
  }
};

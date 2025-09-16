// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchOrders = () => fetch(`${API_BASE_URL}/orders`).then(res => res.json());
export const fetchClients = () => fetch(`${API_BASE_URL}/clients`).then(res => res.json());
export const fetchItems = () => fetch(`${API_BASE_URL}/items`).then(res => res.json());
export const fetchAddressesByClientId = (clientId) => fetch(`${API_BASE_URL}/clients/${clientId}/addresses`).then(res => res.json());
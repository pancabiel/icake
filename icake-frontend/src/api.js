// src/api.js
export const API_BASE_URL = "http://192.168.1.17:8080/api";

export const fetchOrders = () => fetch(`${API_BASE_URL}/orders`).then(res => res.json());
export const fetchClients = () => fetch(`${API_BASE_URL}/clients`).then(res => res.json());
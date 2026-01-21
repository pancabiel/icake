// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchOrders = () => fetch(`${API_BASE_URL}/orders`).then(res => res.json());
export const fetchClients = () => fetch(`${API_BASE_URL}/clients`).then(res => res.json());
export const fetchItems = () => fetch(`${API_BASE_URL}/items`).then(res => res.json());
export const fetchAddressesByClientId = (clientId) => fetch(`${API_BASE_URL}/clients/${clientId}/addresses`).then(res => res.json());

export async function createOrder(values) {
   const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         client: {
            id: values.clientId.id
         },
         address: {
            id: values.addressId.id
         },
         date: values.date,
         items: values.items.map(item => ({
            item: { id: item.productId },
            quantity: item.quantity
         }))
      }),
   });

   if (!res.ok) {
      throw new Error(`Failed to create order: ${res.status}`);
   }

   return res.json();
}
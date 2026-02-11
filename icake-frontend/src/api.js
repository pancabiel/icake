// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchCities = () => fetch(`${API_BASE_URL}/cities`).then(res => res.json());
export const fetchOrders = () => fetch(`${API_BASE_URL}/orders`).then(res => res.json());
export const fetchClients = () => fetch(`${API_BASE_URL}/clients`).then(res => res.json());
export const fetchItems = () => fetch(`${API_BASE_URL}/items`).then(res => res.json());
export const fetchAddressesByClientId = (clientId) => fetch(`${API_BASE_URL}/clients/${clientId}/addresses`).then(res => res.json());

export async function createOrder(values) {
   // Build client object: send id for existing, name for new
   const client = values.client.type === "new"
      ? { name: values.client.name }
      : { id: values.client.id };

   // Build address object: send id for existing, full data for new
   const address = values.address.type === "new"
      ? {
         zipCode: values.address.zipCode,
         street: values.address.street,
         number: values.address.number,
         complement: values.address.complement,
         city: values.address.city
      }
      : { id: values.address.id };

   const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         client,
         address,
         dateTime: values.dateTime,
         items: values.items.map(item => ({
            item: { id: item.productId },
            quantity: item.quantity,
            note: item.note
         }))
      }),
   });

   if (!res.ok) {
      throw new Error(`Failed to create order: ${res.status}`);
   }

   return res.json();
}

export const createAddress = (clientId, addressDTO) => fetch(`${API_BASE_URL}/clients/${clientId}/addresses`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(addressDTO),
});
// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Auth helpers ────────────────────────────────────────────────────────────────

export function getToken() {
   return localStorage.getItem("token");
}

export async function login(email, password) {
   const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
   });

   if (!res.ok) {
      throw new Error("Credenciais inválidas");
   }

   const data = await res.json();
   localStorage.setItem("token", data.token);
   return data;
}

export function logout() {
   localStorage.removeItem("token");
   window.location.href = "/login";
}

// ── Authenticated fetch wrapper ─────────────────────────────────────────────────

async function apiFetch(url, options = {}) {
   const token = getToken();
   const headers = { ...options.headers };

   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const res = await fetch(url, { ...options, headers });

   if (res.status === 401) {
      logout();
      throw new Error("Sessão expirada");
   }

   return res;
}

// ── API functions ───────────────────────────────────────────────────────────────

export const fetchCities = () => apiFetch(`${API_BASE_URL}/cities`).then(res => res.json());
export const fetchOrders = (status) => {
   const url = status ? `${API_BASE_URL}/orders?status=${status}` : `${API_BASE_URL}/orders`;
   return apiFetch(url).then(res => res.json());
};
export const fetchOrderById = (id) => apiFetch(`${API_BASE_URL}/orders/${id}`).then(res => res.json());
export const fetchClients = () => apiFetch(`${API_BASE_URL}/clients`).then(res => res.json());
export const fetchItems = () => apiFetch(`${API_BASE_URL}/items`).then(res => res.json());
export const fetchAddressesByClientId = (clientId) => apiFetch(`${API_BASE_URL}/clients/${clientId}/addresses`).then(res => res.json());

export const deleteOrder = (id) => apiFetch(`${API_BASE_URL}/orders/${id}`, {
   method: "DELETE",
}).then(res => {
   if (!res.ok) throw new Error(`Failed to delete order: ${res.status}`);
});

export const concludeOrder = (id) => apiFetch(`${API_BASE_URL}/orders/${id}/conclude`, {
   method: "PATCH",
}).then(res => {
   if (!res.ok) throw new Error(`Failed to conclude order: ${res.status}`);
});

export const unconcludeOrder = (id) => apiFetch(`${API_BASE_URL}/orders/${id}/unconclude`, {
   method: "PATCH",
}).then(res => {
   if (!res.ok) throw new Error(`Failed to unconclude order: ${res.status}`);
});

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

   const res = await apiFetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         client,
         address,
         dateTime: values.dateTime,
         items: values.items,
      }),
   });

   if (!res.ok) {
      throw new Error(`Failed to create order: ${res.status}`);
   }

   return res.json();
}

export const createAddress = (clientId, addressDTO) => apiFetch(`${API_BASE_URL}/clients/${clientId}/addresses`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(addressDTO),
});

export const createItem = (data) => apiFetch(`${API_BASE_URL}/items`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(data),
}).then(res => {
   if (!res.ok) throw new Error(`Failed to create item: ${res.status}`);
   return res.json();
});

export const updateItem = (id, data) => apiFetch(`${API_BASE_URL}/items/${id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(data),
}).then(res => {
   if (!res.ok) throw new Error(`Failed to update item: ${res.status}`);
   return res.json();
});

export const deleteItem = (id) => apiFetch(`${API_BASE_URL}/items/${id}`, {
   method: "DELETE",
}).then(res => {
   if (!res.ok) throw new Error(`Failed to delete item: ${res.status}`);
});

// ── Catalog (public, no auth needed) ──────────────────────────────────────────

export const fetchCatalog = () =>
   fetch(`${API_BASE_URL}/catalog`).then(res => res.json());

// ── Categories ────────────────────────────────────────────────────────────────

export const fetchCategories = () =>
   apiFetch(`${API_BASE_URL}/categories`).then(res => res.json());

export const createCategory = (data) =>
   apiFetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
   }).then(res => {
      if (!res.ok) throw new Error(`Failed to create category: ${res.status}`);
      return res.json();
   });

export const updateCategory = (id, data) =>
   apiFetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
   }).then(res => {
      if (!res.ok) throw new Error(`Failed to update category: ${res.status}`);
      return res.json();
   });

export const deleteCategory = (id) =>
   apiFetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
   }).then(res => {
      if (!res.ok) throw new Error(`Failed to delete category: ${res.status}`);
   });

// ── Addons ────────────────────────────────────────────────────────────────────

export const createAddon = (data) =>
   apiFetch(`${API_BASE_URL}/addons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
   }).then(res => {
      if (!res.ok) throw new Error(`Failed to create addon: ${res.status}`);
      return res.json();
   });

export const updateAddon = (id, data) =>
   apiFetch(`${API_BASE_URL}/addons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
   }).then(res => {
      if (!res.ok) throw new Error(`Failed to update addon: ${res.status}`);
      return res.json();
   });

export const deleteAddon = (id) =>
   apiFetch(`${API_BASE_URL}/addons/${id}`, {
      method: "DELETE",
   }).then(res => {
      if (!res.ok) throw new Error(`Failed to delete addon: ${res.status}`);
   });

// ── Addon Options ─────────────────────────────────────────────────────────────

export const createAddonOption = (data) =>
   apiFetch(`${API_BASE_URL}/addon-options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
   }).then(res => {
      if (!res.ok) throw new Error(`Failed to create addon option: ${res.status}`);
      return res.json();
   });

export const updateAddonOption = (id, data) =>
   apiFetch(`${API_BASE_URL}/addon-options/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
   }).then(res => {
      if (!res.ok) throw new Error(`Failed to update addon option: ${res.status}`);
      return res.json();
   });

export const deleteAddonOption = (id) =>
   apiFetch(`${API_BASE_URL}/addon-options/${id}`, {
      method: "DELETE",
   }).then(res => {
      if (!res.ok) throw new Error(`Failed to delete addon option: ${res.status}`);
   });

// ── Item Addons ───────────────────────────────────────────────────────────────

export async function fetchItemAddons(itemId) {
   return apiFetch(`${API_BASE_URL}/items/${itemId}/addons`).then(res => res.json());
}
// ───────────────────────────────────────────────────────────────
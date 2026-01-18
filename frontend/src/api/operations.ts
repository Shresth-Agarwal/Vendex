import { apiClient } from './client';

// Products
export async function getProducts() {
  const { data } = await apiClient.get('/demo/products');
  return data;
}

export async function createProduct(body: unknown) {
  const { data } = await apiClient.post('/demo/products', body);
  return data;
}

export async function updateProduct(sku: string, body: unknown) {
  const { data } = await apiClient.put(`/demo/products/${encodeURIComponent(sku)}`, body);
  return data;
}

export async function deleteProduct(sku: string) {
  const { data } = await apiClient.delete(`/demo/products/${encodeURIComponent(sku)}`);
  return data;
}

// Stock
export async function getStock(sku: string) {
  const { data } = await apiClient.get(`/demo/stock/${encodeURIComponent(sku)}`);
  return data;
}

export async function updateStock(sku: string, body: unknown) {
  const { data } = await apiClient.put(`/demo/stock/${encodeURIComponent(sku)}`, body);
  return data;
}

// Sales
export async function addSale(body: unknown) {
  const { data } = await apiClient.post('/demo/sales', body);
  return data;
}

export async function getSales(sku: string) {
  const { data } = await apiClient.get(`/demo/sales/${encodeURIComponent(sku)}`);
  return data;
}

// Staff
export async function getStaff() {
  const { data } = await apiClient.get('/demo/staff');
  return data;
}

export async function createStaff(body: unknown) {
  const { data } = await apiClient.post('/demo/staff', body);
  return data;
}

export async function updateStaff(id: number, body: unknown) {
  const { data } = await apiClient.put(`/demo/staff/${id}`, body);
  return data;
}

export async function deactivateStaff(id: number) {
  const { data } = await apiClient.delete(`/demo/staff/${id}`);
  return data;
}

// Staff availability
export async function addAvailability(body: unknown) {
  const { data } = await apiClient.post('/demo/staff/availability', body);
  return data;
}

export async function getAvailability(staffId: number) {
  const { data } = await apiClient.get(`/demo/staff/availability/${staffId}`);
  return data;
}

export async function removeAvailability(id: number) {
  const { data } = await apiClient.delete(`/demo/staff/availability/${id}`);
  return data;
}

// Shifts
export async function getShifts() {
  const { data } = await apiClient.get('/demo/shifts');
  return data;
}

export async function getOpenShifts() {
  const { data } = await apiClient.get('/demo/shifts/open');
  return data;
}

export async function createShift(body: unknown) {
  const { data } = await apiClient.post('/demo/shifts', body);
  return data;
}

export async function assignStaffToShift(shiftId: number, staffId: number) {
  const { data } = await apiClient.post(`/demo/shifts/${shiftId}/assign/${staffId}`);
  return data;
}

// Purchase orders
export async function getPurchaseOrders() {
  const { data } = await apiClient.get('/demo/purchase-orders');
  return data;
}

export async function updatePurchaseOrderStatus(id: number, status: string) {
  const params = new URLSearchParams({ status });
  const { data } = await apiClient.put(
    `/demo/purchase-orders/${id}/status?${params.toString()}`
  );
  return data;
}

// User & admin
export async function getCurrentUser() {
  const { data } = await apiClient.get('/user/me');
  return data;
}

export async function deleteCurrentUser() {
  const { data } = await apiClient.delete('/user/me');
  return data;
}

export async function adminGetUsers() {
  const { data } = await apiClient.get('/admin/users');
  return data;
}

export async function adminDeleteUser(id: number) {
  const { data } = await apiClient.delete(`/admin/users/${id}`);
  return data;
}

export async function adminUpdateUserRole(body: unknown) {
  const { data } = await apiClient.post('/admin/users/roles', body);
  return data;
}


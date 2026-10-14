import { api } from './api';

const ADMIN_ROOT = '/admin';

function encodeId(id) {
  return encodeURIComponent(id);
}

export function getAdminDashboard(options) {
  return api.get(`${ADMIN_ROOT}/dashboard/`, options);
}

export function getAdminProducts({ search, category, active, limit = 20, offset = 0, ...options } = {}) {
  return api.get(`${ADMIN_ROOT}/products/`, {
    ...options,
    params: { search, category, active, limit, offset },
  });
}

export function createAdminProduct(product) {
  return api.post(`${ADMIN_ROOT}/products/`, product);
}

export function updateAdminProduct(id, product) {
  return api.patch(`${ADMIN_ROOT}/products/${encodeId(id)}/`, product);
}

export function deleteAdminProduct(id) {
  return api.delete(`${ADMIN_ROOT}/products/${encodeId(id)}/`);
}

export function getAdminProductImages(productId, options) {
  return api.get(`${ADMIN_ROOT}/products/${encodeId(productId)}/images/`, options);
}

export function uploadAdminProductImages(productId, files, { altText = '', sortOrder = 0 } = {}) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  formData.append('altText', altText);
  formData.append('sortOrder', String(sortOrder));
  return api.post(`${ADMIN_ROOT}/products/${encodeId(productId)}/images/`, formData);
}

export function deleteAdminProductImage(productId, imageId) {
  return api.delete(
    `${ADMIN_ROOT}/products/${encodeId(productId)}/images/${encodeId(imageId)}/`,
  );
}

export function getAdminCategories({ search, limit = 100, offset = 0, ...options } = {}) {
  return api.get(`${ADMIN_ROOT}/categories/`, {
    ...options,
    params: { search, limit, offset },
  });
}

export function createAdminCategory(category) {
  return api.post(`${ADMIN_ROOT}/categories/`, category);
}

export function updateAdminCategory(id, category) {
  return api.patch(`${ADMIN_ROOT}/categories/${encodeId(id)}/`, category);
}

export function deleteAdminCategory(id) {
  return api.delete(`${ADMIN_ROOT}/categories/${encodeId(id)}/`);
}

export function getAdminCustomers({ search, limit = 20, offset = 0, ...options } = {}) {
  return api.get(`${ADMIN_ROOT}/customers/`, {
    ...options,
    params: { search, limit, offset },
  });
}

export function getAdminOrders({
  search,
  status,
  paymentStatus,
  limit = 20,
  offset = 0,
  ...options
} = {}) {
  return api.get(`${ADMIN_ROOT}/orders/`, {
    ...options,
    params: { search, status, paymentStatus, limit, offset },
  });
}

export function getAdminOrder(orderId, options) {
  return api.get(`${ADMIN_ROOT}/orders/${encodeId(orderId)}/`, options);
}

export function updateAdminOrderStatus(orderId, status, note) {
  return api.patch(`${ADMIN_ROOT}/orders/${encodeId(orderId)}/status/`, { status, note });
}

export function refundAdminOrder(orderId, amount, idempotencyKey) {
  return api.post(
    `${ADMIN_ROOT}/orders/${encodeId(orderId)}/refunds/`,
    { amount: Number(amount).toFixed(2) },
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );
}

export function getAdminOffers({ search, limit = 20, offset = 0, ...options } = {}) {
  return api.get(`${ADMIN_ROOT}/offers/`, {
    ...options,
    params: { search, limit, offset },
  });
}

export function createAdminOffer(offer) {
  return api.post(`${ADMIN_ROOT}/offers/`, offer);
}

export function updateAdminOffer(id, offer) {
  return api.patch(`${ADMIN_ROOT}/offers/${encodeId(id)}/`, offer);
}

export function deleteAdminOffer(id) {
  return api.delete(`${ADMIN_ROOT}/offers/${encodeId(id)}/`);
}

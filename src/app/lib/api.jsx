import axios from 'axios';

const api = axios.create({
  baseURL: 'https://9jabukabackend.vercel.app/api',
});

export const uploadFood = async (formData) => {
  const response = await api.post('/foods/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const updateOrderStatus = async (referenceNumber, status) => {
  const response = await api.patch(`/orders/${referenceNumber}`, { status });
  return response.data;
};

export const getFoods = async () => {
  const response = await api.get('/foods');
  return response.data;
};

export const placeOrder = async (orderData) => {
  const response = await api.post('/orders/place', orderData);
  return response.data;
};

export default api;
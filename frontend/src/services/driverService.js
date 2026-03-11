import API from './api';

export const updateDriverLocation = async (locationData) => {
  const response = await API.post('/driver/location', locationData);
  return response.data;
};

export const getAvailableOrders = async (vehicleType) => {
  const response = await API.get(`/driver/orders/available?vehicle_type=${vehicleType}`);
  return response.data;
};

export const acceptOrder = async (orderData) => {
  const response = await API.post('/driver/orders/accept', orderData);
  return response.data;
};

export const updateOrderStatus = async (statusData) => {
  const response = await API.post('/driver/orders/status', statusData);
  return response.data;
};

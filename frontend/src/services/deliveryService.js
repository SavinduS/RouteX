import API from './api'; // අපි උඩ හදපු API setup එක

// 1. අලුතෙන් Delivery එකක් හදන්න
export const createDelivery = async (deliveryData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await API.post('/deliveries', deliveryData, config);
  return response.data;
};

// 2. Log වුන User ගේ Deliveries ටික ගන්න
export const getMyDeliveries = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await API.get('/deliveries/my', config);
  return response.data;
};

// 3. තනි Delivery එකක විස්තර ගන්න
export const getDeliveryById = async (id, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await API.get(`/deliveries/${id}`, config);
    return response.data;
};

// 4. Delivery එකක් Update කරන්න
export const updateDelivery = async (id, updateData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await API.put(`/deliveries/${id}`, updateData, config);
  return response.data;
};
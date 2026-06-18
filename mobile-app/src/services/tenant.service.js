import api from './api';

const tenantService = {
  getDashboard: async () => (await api.get('/tenant/dashboard')).data,
  getPayments: async () => (await api.get('/tenant/payments')).data,
  initiateRentPayment: async () => (await api.post('/tenant/pay-rent')).data,
  verifyPayment: async (data) => (await api.post('/tenant/verify-payment', data)).data,
  getComplaints: async () => (await api.get('/tenant/complaints')).data,
  raiseComplaint: async (data) => (await api.post('/tenant/complaints', data)).data,
  getNotices: async () => (await api.get('/tenant/notices')).data,
  requestExit: async (data) => (await api.post('/tenant/request-exit', data)).data,
  getPreAuthVisitors: async () => (await api.get('/tenant/preauth-visitors')).data,
  createPreAuthVisitor: async (data) => (await api.post('/tenant/preauth-visitors', data)).data,
};

export default tenantService;

import api from './api';

const ownerService = {
  // Dashboard
  getDashboardStats: async () => (await api.get('/owner/dashboard-stats')).data,
  getAnalytics: async () => (await api.get('/owner/analytics')).data,

  // Rooms
  getRooms: async () => (await api.get('/owner/rooms')).data,
  createRoom: async (data) => (await api.post('/owner/rooms', data)).data,
  updateRoom: async (id, data) => (await api.put(`/owner/rooms/${id}`, data)).data,
  deleteRoom: async (id) => (await api.delete(`/owner/rooms/${id}`)).data,
  checkCompatibility: async (roomId, prefs) => (await api.post(`/owner/rooms/${roomId}/compatibility`, prefs)).data,

  // Tenants
  getTenants: async () => (await api.get('/owner/tenants')).data,
  addTenant: async (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return (await api.post('/owner/tenants', data, config)).data;
  },
  updateTenant: async (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return (await api.put(`/owner/tenants/${id}`, data, config)).data;
  },
  deleteTenant: async (id) => (await api.delete(`/owner/tenants/${id}`)).data,
  manageExitRequest: async (data) => (await api.post('/owner/tenants/exit-request', data)).data,

  // Payments
  getPayments: async () => (await api.get('/owner/payments')).data,
  recordManualPayment: async (data) => (await api.post('/payments/manual', data)).data,

  // Complaints
  getComplaints: async () => (await api.get('/owner/complaints')).data,
  updateComplaintStatus: async (id, data) => (await api.put(`/owner/complaints/${id}`, data)).data,

  // Notices
  getNotices: async () => (await api.get('/owner/notices')).data,
  createNotice: async (data) => (await api.post('/owner/notices', data)).data,
  deleteNotice: async (id) => (await api.delete(`/owner/notices/${id}`)).data,

  // Expenses
  getExpenses: async () => (await api.get('/owner/expenses')).data,
  addExpense: async (data) => (await api.post('/owner/expenses', data)).data,
  deleteExpense: async (id) => (await api.delete(`/owner/expenses/${id}`)).data,
  getFinancialReport: async () => (await api.get('/owner/analytics/export', { responseType: 'blob' })).data,

  // Visit Requests
  getVisitRequests: async () => (await api.get('/visits')).data,
  updateVisitStatus: async (id, data) => (await api.put(`/visits/${id}`, data)).data,
};

export default ownerService;

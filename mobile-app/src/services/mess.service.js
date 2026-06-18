import api from './api';

const messService = {
  // Shared / Tenant View Menu
  getMenu: async (params) => {
    let queryString = '';
    if (params) {
      if (typeof params === 'object') {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val) searchParams.append(key, val);
        });
        queryString = `?${searchParams.toString()}`;
      } else {
        queryString = `?date=${params}`;
      }
    }
    const response = await api.get(`/mess/menu${queryString}`);
    return response.data;
  },

  // Owner Update Menu
  updateMenu: async (date, meals) => {
    const response = await api.post('/mess/menu', { date, meals });
    return response.data;
  },

  // Owner View Today's Analytics
  getAnalytics: async (date) => {
    const response = await api.get(`/mess/analytics?date=${date}`);
    return response.data;
  },

  // Tenant Attendance Logging
  markAttendance: async (date, meal_type, status) => {
    const response = await api.post('/mess/attendance', { date, meal_type, status });
    return response.data;
  },

  // Tenant Meal Voucher Purchases
  purchaseVoucher: async (voucherData) => {
    const response = await api.post('/mess/vouchers', voucherData);
    return response.data;
  },

  // Tenant View Own Vouchers
  getMyVouchers: async () => {
    const response = await api.get('/mess/vouchers/my');
    return response.data;
  },

  // Owner View All Vouchers Billed in PG
  getVouchersList: async () => {
    const response = await api.get('/mess/vouchers');
    return response.data;
  },

  // Owner Redeem / Verify Voucher Code
  verifyVoucher: async (voucherCode) => {
    const response = await api.post('/mess/vouchers/verify', { voucherCode });
    return response.data;
  },
};

export default messService;

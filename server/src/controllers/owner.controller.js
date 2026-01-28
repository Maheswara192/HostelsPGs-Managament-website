const Room = require('../models/Room');
const PG = require('../models/PG');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const bcrypt = require('bcryptjs');
const emailService = require('../services/email.service');
const crypto = require('crypto');
const OnboardingAnalytics = require('../models/OnboardingAnalytics');
const tokenService = require('../services/token.service');
const communicationService = require('../services/communication.service');

// @desc    Get all rooms for the owner's PG
// @route   GET /api/owner/rooms
// @access  Private (Owner)
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all rooms for the owner's PG
// @route   GET /api/owner/rooms
// @access  Private (Owner)
exports.getRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ pg_id: req.user.pg_id });
  res.status(200).json({ success: true, count: rooms.length, data: rooms });
});

// @desc    Create a new room
// @route   POST /api/owner/rooms
// @access  Private (Owner)
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, type, rent, capacity, amenities } = req.body;

    // Check if room number exists in this PG
    const roomExists = await Room.findOne({ pg_id: req.user.pg_id, number: roomNumber });
    if (roomExists) {
      return res.status(400).json({ success: false, message: 'Room number already exists' });
    }

    const room = await Room.create({
      pg_id: req.user.pg_id,
      number: roomNumber,
      type,
      price: rent,
      capacity,
      // amenities // Removed as not in model
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update room details
// @route   PUT /api/owner/rooms/:id
// @access  Private (Owner)
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Ensure room belongs to owner's PG
    if (room.pg_id.toString() !== req.user.pg_id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete room
// @route   DELETE /api/owner/rooms/:id
// @access  Private (Owner)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Ensure room belongs to owner's PG
    if (room.pg_id.toString() !== req.user.pg_id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // CASCADE DELETE: Find and delete associated tenants
    const tenants = await Tenant.find({ room_id: room._id });
    const userIds = tenants.map(t => t.user_id);

    // 1. Delete associated User accounts
    if (userIds.length > 0) {
      await User.deleteMany({ _id: { $in: userIds } });
    }

    // 2. Delete Tenant records
    await Tenant.deleteMany({ room_id: room._id });

    // 3. Delete Room
    await room.deleteOne();

    res.status(200).json({ success: true, message: `Room and ${tenants.length} associated tenants deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all tenants
// @route   GET /api/owner/tenants
// @access  Private (Owner)
exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ pg_id: req.user.pg_id })
      .populate('user_id', 'name email')
      .populate('room_id', 'number');
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add a new tenant
// @route   POST /api/owner/tenants
// @access  Private (Owner)
exports.addTenant = async (req, res) => {
  try {
    const { name, email, password, mobile, room_id, rentAmount, deposit } = req.body;

    console.log("--- ADD TENANT DEBUG ---");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      // Check if this user has an active tenant profile
      const existingTenant = await Tenant.findOne({ user_id: user._id });

      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists as an active tenant'
        });
      } else {
        // Orphaned user account (tenant was deleted but user wasn't) - clean it up
        console.log(`⚠️ Found orphaned user account: ${email}. Cleaning up...`);
        await User.findByIdAndDelete(user._id);
        user = null; // Allow creation to proceed
      }
    }

    // 0. Verify Room belongs to this PG
    if (!room_id) {
      return res.status(400).json({ success: false, message: 'Room ID is missing' });
    }

    const room = await Room.findOne({ _id: room_id, pg_id: req.user.pg_id });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found or does not belong to your PG' });
    }

    // Check Capacity
    const existingTenantsCount = await Tenant.countDocuments({ room_id: room._id, status: { $ne: 'inactive' } });
    if (existingTenantsCount >= room.capacity) {
      return res.status(400).json({ success: false, message: `Room ${room.number} is full (Capacity: ${room.capacity})` });
    }

    // Prepare Data
    const preferredLanguage = req.body.preferredLanguage || 'en';
    const placeholderPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    // --- TRANSACTION START ---
    const { withTransaction } = require('../utils/transaction');
    let tenant; // Will hold the created tenant

    await withTransaction(async (session) => {
      // 1. Create User
      const users = await User.create([{
        name,
        email,
        password: placeholderPassword,
        role: 'tenant',
        pg_id: req.user.pg_id,
        accountStatus: 'PENDING_ACTIVATION',
        preferredLanguage,
        created_by: req.user._id
      }], { session });
      user = users[0];

      // Analytics 1
      await OnboardingAnalytics.create([{
        pg_id: req.user.pg_id,
        tenant_id: user._id,
        step: 'CREATED',
        meta: { email, source: 'add_tenant' }
      }], { session });

      // Analytics 2
      await OnboardingAnalytics.create([{
        pg_id: req.user.pg_id,
        tenant_id: user._id,
        step: 'EMAIL_SENT',
        meta: { email, source: 'add_tenant' }
      }], { session });

      // 2. Create Tenant Profile
      const tenants = await Tenant.create([{
        user_id: user._id,
        pg_id: req.user.pg_id,
        room_id: room_id,
        rentAmount,
        advanceAmount: req.body.advanceAmount || 0,
        idProofFrontPath: (req.files && req.files['idProofFront']) ? req.files['idProofFront'][0].path : null,
        idProofBackPath: (req.files && req.files['idProofBack']) ? req.files['idProofBack'][0].path : null,
        contact_number: mobile,
        moveInDate: req.body.moveInDate || Date.now(),
        deposit
      }], { session });
      tenant = tenants[0];
    });
    // --- TRANSACTION END ---

    // Post-Transaction Actions (Emails)
    let emailSent = false;
    try {
      const activationToken = await tokenService.createActivationToken(user);
      const pg = await PG.findById(req.user.pg_id);
      const commResults = await communicationService.sendOnboardingCommunication(user, pg, activationToken, 'WELCOME');
      emailSent = commResults.email;
    } catch (e) { console.error("Post-Transaction Email Error", e); }

    // Re-fetch tenant for response to populate fields
    const finalTenant = await Tenant.findById(tenant._id)
      .populate('user_id', 'name email')
      .populate('room_id', 'number');

    // Audit Log (Async)
    const { logAction } = require('../services/audit.service');
    logAction(req, 'ADD_TENANT', 'Tenant', finalTenant._id, { email: user.email, room: room.number });

    res.status(201).json({
      success: true,
      data: finalTenant,
      user: { name, email },
      emailSent: emailSent,
      warning: emailSent ? null : "Tenant created but Email failed. Please use 'Resend Credentials' button."
    });

  } catch (error) {
    console.error("Add Tenant Error:", error);
    // Standard error response
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tenant details
// @route   PUT /api/owner/tenants/:id
// @access  Private (Owner)
exports.updateTenant = async (req, res) => {
  try {
    const { name, email, mobile, room_id, rentAmount, advanceAmount, deposit, password } = req.body;

    let tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (tenant.pg_id.toString() !== req.user.pg_id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Update User details if provided
    if (name || email || mobile || password) {
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;

      // Password update (only if strictly needed, usually separate flow, but allowed here for admin convenience)
      if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(password, salt);
      }

      await User.findByIdAndUpdate(tenant.user_id, updateFields);
    }

    // Update Tenant details
    if (room_id && room_id !== tenant.room_id.toString()) {
      const newRoom = await Room.findOne({ _id: room_id, pg_id: req.user.pg_id });
      if (!newRoom) return res.status(404).json({ success: false, message: 'New room not found' });

      const count = await Tenant.countDocuments({ room_id: newRoom._id, status: { $ne: 'inactive' } });
      if (count >= newRoom.capacity) {
        return res.status(400).json({ success: false, message: `Room ${newRoom.number} is full` });
      }
      tenant.room_id = room_id;
    }
    if (rentAmount) tenant.rentAmount = rentAmount;
    if (advanceAmount) tenant.advanceAmount = advanceAmount;
    if (deposit) tenant.deposit = deposit;
    if (mobile) tenant.contact_number = mobile;
    if (req.body.moveInDate) tenant.moveInDate = req.body.moveInDate;

    // Handle File Update
    if (req.files) {
      if (req.files['idProofFront']) {
        tenant.idProofFrontPath = req.files['idProofFront'][0].path;
      }
      if (req.files['idProofBack']) {
        tenant.idProofBackPath = req.files['idProofBack'][0].path;
      }
    }

    await tenant.save();

    // Re-populate for response
    const updatedTenant = await Tenant.findById(tenant._id)
      .populate('user_id', 'name email')
      .populate('room_id', 'number');

    res.status(200).json({ success: true, data: updatedTenant });
  } catch (error) {
    console.error("Update Tenant Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a tenant
// @route   DELETE /api/owner/tenants/:id
// @access  Private (Owner)
exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Ensure tenant belongs to owner's PG
    if (tenant.pg_id.toString() !== req.user.pg_id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Store user_id before deletion
    const userId = tenant.user_id;

    // Delete Tenant Profile first
    await tenant.deleteOne();
    console.log(`✅ Tenant profile deleted: ${req.params.id}`);

    // Delete associated User account
    if (userId) {
      const deletedUser = await User.findByIdAndDelete(userId);
      if (deletedUser) {
        console.log(`✅ User account deleted: ${userId} (${deletedUser.email})`);
      } else {
        console.warn(`⚠️ User account not found for deletion: ${userId}`);
      }
    }

    res.status(200).json({ success: true, message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error("Delete Tenant Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all complaints for the PG
// @route   GET /api/owner/complaints
// @access  Private (Owner)
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ pg_id: req.user.pg_id })
      .populate({
        path: 'tenant_id',
        populate: {
          path: 'user_id',
          select: 'name'
        }
      })
      .populate({
        path: 'tenant_id',
        populate: {
          path: 'room_id',
          select: 'number' // changed from room-number to number as per schema
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update complaint status
// @route   PUT /api/owner/complaints/:id
// @access  Private (Owner)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.pg_id.toString() !== req.user.pg_id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    complaint = await Complaint.findByIdAndUpdate(req.params.id, { status, adminComment }, { new: true });

    // Real-Time Notification
    const { getIO } = require('../services/socket.service');
    // Notify the Tenant specifically
    getIO().to(`user_${complaint.tenant_id.user_id}`).emit('COMPLAINT_UPDATED', complaint);
    // Also notify PG room if we had one, but user-specific is safer for now.

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new notice
// @route   POST /api/owner/notices
// @access  Private (Owner)
exports.createNotice = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    const notice = await Notice.create({
      pg_id: req.user.pg_id,
      title,
      message,
      type
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all notices for the PG
// @route   GET /api/owner/notices
// @access  Private (Owner)
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ pg_id: req.user.pg_id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/owner/notices/:id
// @access  Private (Owner)
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (notice.pg_id.toString() !== req.user.pg_id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await notice.deleteOne();

    res.status(200).json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add a new expense
// @route   POST /api/owner/expenses
// @access  Private (Owner)
exports.addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    const expense = await Expense.create({
      pg_id: req.user.pg_id,
      amount,
      category,
      description,
      date: date || Date.now()
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all expenses
// @route   GET /api/owner/expenses
// @access  Private (Owner)
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ pg_id: req.user.pg_id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/owner/expenses/:id
// @access  Private (Owner)
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    if (expense.pg_id.toString() !== req.user.pg_id.toString()) return res.status(401).json({ success: false, message: 'Not authorized' });

    await expense.deleteOne();
    res.status(200).json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Financial Analytics
// @route   GET /api/owner/analytics
// @access  Private (Owner)
// @desc    Get All Payments (History)
// @route   GET /api/owner/payments
// @access  Owner
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ pg_id: req.user.pg_id })
      .populate('tenant_id', 'user_id rentAmount') // CAREFUL: tenant_id ref is Tenant. Tenant has user_id which is User. 
      // We need name. Tenant -> user_id (User) -> name.
      // Populate: path: 'tenant_id', populate: { path: 'user_id', select: 'name email' }
      .populate({
        path: 'tenant_id',
        populate: { path: 'user_id', select: 'name email' }
      })
      .sort({ transaction_date: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const pgId = req.user.pg_id;

    // 1. Calculate Total Expenses per Category
    const expenses = await Expense.aggregate([
      { $match: { pg_id: pgId } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    // 2. Calculate Total Rent Collected (Revenue)
    // Assuming 'SUCCESS' status in Payment model indicates collected rent
    const revenue = await Payment.aggregate([
      { $match: { pg_id: pgId, status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.total, 0);
    const profit = totalRevenue - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        profit,
        expenseBreakdown: expenses
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Export Financial Report (CSV)
// @route   GET /api/owner/analytics/export
// @access  Private (Owner)
exports.exportFinancials = async (req, res) => {
  try {
    const pgId = req.user.pg_id;
    const { format } = req.query; // 'csv'

    // 1. Fetch Data
    const payments = await Payment.find({ pg_id: pgId, status: 'SUCCESS' }).sort({ transaction_date: -1 }).populate('tenant_id', 'contact_number');
    const expenses = await Expense.find({ pg_id: pgId }).sort({ date: -1 });

    // 2. Combine & Sort
    const reportData = [];

    payments.forEach(p => {
      reportData.push({
        date: p.transaction_date,
        type: 'INCOME',
        category: 'Rent',
        amount: p.amount,
        description: `Rent from Tenant (User ID: ${p.user_id})`
      });
    });

    expenses.forEach(e => {
      reportData.push({
        date: e.date,
        type: 'EXPENSE',
        category: e.category,
        amount: -e.amount, // Negative for expense
        description: e.description
      });
    });

    // Sort by Date Descending
    reportData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 3. Generate CSV
    if (format === 'csv' || true) {
      let csv = 'Date,Type,Category,Amount,Description\n';
      reportData.forEach(row => {
        const dateStr = new Date(row.date).toLocaleDateString();
        // Escape content
        const desc = `"${row.description.replace(/"/g, '""')}"`;
        csv += `${dateStr},${row.type},${row.category},${row.amount},${desc}\n`;
      });

      res.header('Content-Type', 'text/csv');
      res.attachment(`financial_report_${new Date().toISOString().slice(0, 10)}.csv`);
      return res.send(csv);
    }
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// @desc    Get Dashboard Stats (Pending Rent etc)
// @route   GET /api/owner/dashboard-stats
// @access  Private (Owner)
exports.getDashboardStats = async (req, res) => {
  try {
    const pgId = req.user.pg_id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    // 1. Get Active Tenants count and Total Expected Rent
    // Assuming all active tenants are expected to pay rent this month
    const activeTenants = await Tenant.find({ pg_id: pgId, status: { $ne: 'inactive' } });
    const totalTenants = activeTenants.length;
    const expectedRent = activeTenants.reduce((acc, t) => acc + (t.rentAmount || 0), 0);

    // 2. Get Rent Collected This Month
    const payments = await Payment.aggregate([
      {
        $match: {
          pg_id: pgId,
          type: 'RENT',
          status: 'SUCCESS',
          transaction_date: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$amount' }
        }
      }
    ]);

    const collectedRent = payments.length > 0 ? payments[0].totalCollected : 0;
    const pendingRent = Math.max(0, expectedRent - collectedRent);

    // 3. Get Open Complaints Count
    const openComplaints = await Complaint.countDocuments({
      pg_id: pgId,
      status: { $in: ['open', 'pending'] }
    });

    // 4. Get Occupancy
    const rooms = await Room.find({ pg_id: pgId });
    const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    const occupancy = totalCapacity > 0 ? Math.round((totalTenants / totalCapacity) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        tenants: totalTenants,
        occupancy,
        pendingRent,
        complaints: openComplaints
      }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Resend Tenant Credentials (Resets Password)
// @route   POST /api/owner/tenants/:id/resend-credentials
// @access  Private (Owner)
exports.resendOwnerTenantCredentials = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('user_id');
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    if (tenant.pg_id.toString() !== req.user.pg_id.toString()) return res.status(401).json({ success: false, message: 'Not authorized' });

    const user = await User.findById(tenant.user_id._id);
    if (!user) return res.status(404).json({ success: false, message: 'User record not found' });

    // Generate NEW Token (via Service)
    const activationToken = await tokenService.createActivationToken(user);

    user.accountStatus = 'PENDING_ACTIVATION';
    await user.save();

    // Log Analytics: Resend
    await OnboardingAnalytics.create({
      pg_id: req.user.pg_id,
      tenant_id: user._id,
      step: 'EMAIL_SENT',
      meta: { email: user.email, source: 'resend_credentials' }
    });

    // Send Communication
    const pg = await PG.findById(req.user.pg_id);
    const commResults = await communicationService.sendOnboardingCommunication(user, pg, activationToken, 'WELCOME');

    if (commResults.email || commResults.whatsapp) {
      res.json({ success: true, message: 'Credentials resent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send communication' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Bulk Add Tenants via CSV
// @route   POST /api/owner/tenants/bulk
// @access  Private (Owner)
exports.bulkAddTenants = async (req, res) => {
  const { parseCsv } = require('../utils/csvParser');

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
  }

  try {
    const rows = await parseCsv(req.file.path);
    const results = { success: 0, failed: 0, errors: [] };

    for (const [index, row] of rows.entries()) {
      try {
        // Minimal Validation
        if (!row.email || !row.name || !row.roomNumber || !row.rentAmount) {
          throw new Error('Missing required fields (email, name, roomNumber, rentAmount)');
        }

        // 1. Find Room
        const room = await Room.findOne({ pg_id: req.user.pg_id, number: row.roomNumber });
        if (!room) throw new Error(`Room ${row.roomNumber} not found`);

        // 2. Check User Existence
        const existingUser = await User.findOne({ email: row.email });
        if (existingUser) throw new Error(`User with email ${row.email} already exists`);

        // 3. Create User
        const password = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10);
        const user = await User.create({
          name: row.name,
          email: row.email,
          password,
          role: 'tenant',
          pg_id: req.user.pg_id,
          accountStatus: 'PENDING_ACTIVATION',
          created_by: req.user._id
        });

        // 4. Create Token for activation link
        const token = await tokenService.createActivationToken(user);

        // 5. Create Tenant Profile
        await Tenant.create({
          user_id: user._id,
          pg_id: req.user.pg_id,
          room_id: room._id,
          rentAmount: row.rentAmount,
          contact_number: row.mobile || '',
          deposit: row.deposit || 0
        });

        // 6. Send Email (Async)
        const pg = await PG.findById(req.user.pg_id);
        communicationService.sendOnboardingCommunication(user, pg, token, 'WELCOME');

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Row ${index + 1} (${row.email || 'unknown'}): ${err.message}`);
      }
    }

    // Cleanup File
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    res.json({ success: true, results });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Manage Exit Request (Approve/Reject)
// @route   POST /api/owner/tenants/exit-request
// @access  Private (Owner)
exports.manageExitRequest = async (req, res) => {
  try {
    const { tenantId, status, comment, exitDate } = req.body; // status: APPROVED or REJECTED

    const tenant = await Tenant.findOne({ _id: tenantId, pg_id: req.user.pg_id });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (!tenant.exit_request || tenant.exit_request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'No pending exit request found' });
    }

    tenant.exit_request.status = status;
    tenant.exit_request.admin_comment = comment;

    if (status === 'APPROVED') {
      tenant.exit_date = exitDate || tenant.exit_request.requested_date;
      tenant.status = 'on_notice';
    }

    await tenant.save();

    res.json({ success: true, message: `Exit request ${status.toLowerCase()}`, data: tenant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

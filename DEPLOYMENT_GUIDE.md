# 🚀 Deployment Guide: Hostels SaaS Application

This guide will walk you through deploying your MERN stack application.

**Architecture:**
- **Frontend**: Vercel (Free & Fast)
- **Backend**: Render (Good Free Tier)
- **Database**: MongoDB Atlas (Already set up)

---

## ✅ Phase 1: Preparation

### 1. Verification
Ensure your code is pushed to GitHub (you've already done this!).

### 2. Deployment Credentials
Gather these values (refer to your `SECURITY_GUIDE.md`):
- `MONGODB_URI` (Production Connection String)
- `JWT_SECRET` (Use a strong, long secret)
- `RAZORPAY_KEY_ID` & `SECRET` (Live keys)
- `SMTP_EMAIL` & `PASSWORD`

---

## 🛠️ Phase 2: Backend Deployment (Render)

We will deploy the Node.js server first because the Frontend needs the live Server URL.

1. **Sign Up**: Go to [Render.com](https://render.com) and sign up with GitHub.
2. **Create New Web Service**:
   - Click **"New +"** -> **"Web Service"**.
   - Select your repository (`hostel-management-saas` or whatever you named it).
   - Click **"Connect"**.

3. **Configure Service**:
   - **Name**: `hostel-backend` (or unique name)
   - **Region**: Choose closest to you (e.g., Singapore/Ohio)
   - **Branch**: `main`
   - **Root Directory**: `server` (Important!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Environment Variables** (Click "Advanced" or "Environment"):
   Add the following keys and your production values:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `your_mongodb_connection_string`
   - `JWT_SECRET`: `your_secure_secret`
   - `RAZORPAY_KEY_ID`: `your_live_key`
   - `RAZORPAY_KEY_SECRET`: `your_live_secret`
   - `SMTP_EMAIL`: `your_email`
   - `SMTP_PASSWORD`: `your_app_password`
   - `WHATSAPP_API_TOKEN`: `your_token`

5. **Deploy**:
   - Click **"Create Web Service"**.
   - Wait for the deployment to finish (~5-10 mins).
   - **Copy the Service URL** (e.g., `https://hostel-backend.onrender.com`).
   - ⚠️ **Note**: The free tier "sleeps" after inactivity. First request might take 50s.

---

## 🎨 Phase 3: Frontend Deployment (Vercel)

Now that the backend is live, let's deploy the React frontend.

1. **Sign Up**: Go to [Vercel.com](https://vercel.com) and sign up with GitHub.
2. **Import Project**:
   - Click **"Add New..."** -> **"Project"**.
   - Import your repository.

3. **Configure Project**:
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: Click "Edit" and select `client` folder.
   
4. **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api` (Paste the Render URL from Phase 2 and add `/api` at the end)

5. **Deploy**:
   - Click **"Deploy"**.
   - Vercel will build and assign a domain (e.g., `hostel-saas.vercel.app`).

---

## 🔗 Phase 4: Final Connection

1. **Verify Backend CORS** (Optional but Good):
   - Currently, your server allows ALL origins (`cors()`), so it should work immediately.
   - For better security later, update `server/src/app.js` to only allow your Vercel domain.

2. **Test the Live App**:
   - Open your Vercel URL.
   - Try to Register/Login.
   - Note: If using Render Free Tier, the first login attempt might be slow as the server wakes up.

---

## 🔄 Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Environment variables set in Render
- [ ] Frontend deployed on Vercel
- [ ] VITE_API_URL set in Vercel
- [ ] Database connected
- [ ] Test Login/Registration flow

---

Let me know if you run into any errors during these steps!

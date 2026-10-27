# Aspire Academy Online - Platform Integration & Setup Guide

## 1. Firebase Authentication & Cloud Firestore Setup
- **Provisioned Status**: Cloud Firestore and Firebase Authentication have been provisioned in your Firebase Project (`gen-lang-client-0942217522`) with database ID `ai-studio-aspireacademyonl-9161e5d8-78d5-4a99-ad98-5265f673a6b3`.
- **Configuration**: Loaded automatically in the application via `firebase-applet-config.json` and initialized in `src/firebase/config.ts`.
- **Security Rules**: Deployed with zero-trust RBAC in `firestore.rules`.
- **Google Sign-In**: Ready for use via `signInWithPopup`. Ensure Authorized Domains in Firebase Console > Authentication > Settings includes your domain.
- **Email & Password Authentication**: Enabled in Firebase Console under Authentication > Sign-in method.

---

## 2. Administrator Access Configuration
- **Bootstrapped Admin**: The administrator email is configured as `deepka2772@gmail.com`.
- **Automatic Role Assignment**: When you sign in with this email, the application automatically grants and persists the `admin` role in Firestore under `/users/{uid}` and writes an authorization record to `/admins/{uid}`.
- **Promoting Additional Administrators**:
  1. Open Firebase Console > Firestore Database.
  2. Navigate to the `admins` collection.
  3. Create a document with the user's UID as the document ID:
     ```json
     {
       "uid": "TARGET_USER_UID",
       "email": "mentor@aspireacademy.edu",
       "addedAt": "2026-10-27T08:00:00Z"
     }
     ```
  4. In the `users` collection, update their document `role: "admin"`.

---

## 3. Razorpay Indian Payment Gateway Setup
Aspire Academy Online provides real server-side payment order generation and cryptographic HMAC SHA-256 signature verification.

### Step 1: Obtain Razorpay API Keys
1. Sign up or log into [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** > **API Keys**.
3. Generate your Key ID and Key Secret (Test mode for development, Live mode for production).

### Step 2: Configure Environment Variables
Set the following variables in your hosting environment (Cloud Run, Docker, or `.env`):
```env
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret_key"
RAZORPAY_WEBHOOK_SECRET="your_custom_webhook_secret"
```

### Step 3: Webhook Setup (Optional for asynchronous confirmation)
1. In Razorpay Dashboard, navigate to **Settings** > **Webhooks**.
2. Add Webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select Active Events: `order.paid`, `payment.captured`, `payment.failed`.
4. Enter the same Secret as configured in `RAZORPAY_WEBHOOK_SECRET`.

---

## 4. Cloudflare R2 Private Video Storage Setup
Cloudflare R2 provides S3-compatible, egress-free object storage for private course videos and PDF handouts.

### Step 1: Create an R2 Bucket
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) and navigate to **R2**.
2. Click **Create Bucket** and name it (e.g., `aspire-academy-media`).

### Step 2: Create API Tokens
1. In the R2 Overview page, click **Manage R2 API Tokens**.
2. Click **Create API Token**.
3. Grant **Object Read & Write** permissions on your bucket.
4. Copy:
   - Account ID
   - Access Key ID
   - Secret Access Key

### Step 3: Configure Environment Variables
```env
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="aspire-academy-media"
R2_PUBLIC_DOMAIN="" # Optional if using public worker domain
```

---

## 5. Course & Lesson Workflow
1. Log in to Aspire Academy Online with your administrator account (`deepka2772@gmail.com`).
2. Click the **Admin Panel** badge in the navbar.
3. Under **Courses**, click **Create Course** (or edit an existing one) to set title, description, category, and pricing.
4. Click **Manage Lessons** on any course to add YouTube lectures, YouTube Live streams, R2 video files, or PDF notes.
5. Mark preview lessons as **Free Preview** to let prospective students sample teaching quality before purchasing.
6. Toggle **Publish** to make the course live on the public explore catalog.

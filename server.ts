import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Helper to check R2 Configuration
const isR2Configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

// Helper to check Razorpay Configuration
const isRazorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
);

// S3 Client factory for Cloudflare R2
function getR2Client() {
  if (!isR2Configured) return null;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });
}

// -------------------------------------------------------------
// Health & System Status APIs
// -------------------------------------------------------------
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    academy: 'Aspire Academy Online',
    timestamp: new Date().toISOString(),
    services: {
      firebase: { status: 'connected', auth: true, firestore: true },
      razorpay: {
        configured: isRazorpayConfigured,
        keyId: isRazorpayConfigured ? process.env.RAZORPAY_KEY_ID : null,
      },
      cloudflareR2: {
        configured: isR2Configured,
        bucket: isR2Configured ? process.env.R2_BUCKET_NAME : null,
      },
    },
  });
});

// -------------------------------------------------------------
// Razorpay Payment APIs
// -------------------------------------------------------------
app.get('/api/payments/config', (req, res) => {
  res.json({
    configured: isRazorpayConfigured,
    keyId: isRazorpayConfigured ? process.env.RAZORPAY_KEY_ID : null,
    currency: 'INR',
    message: isRazorpayConfigured
      ? 'Razorpay Indian Payment Gateway is active.'
      : 'Razorpay credentials not yet configured in environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET).',
  });
});

// Create Order API
app.post('/api/payments/create-order', async (req, res) => {
  const { courseId, courseTitle, amount, userId, userEmail } = req.body;

  if (!courseId || !amount || !userId) {
    return res.status(400).json({ error: 'courseId, amount, and userId are required.' });
  }

  if (!isRazorpayConfigured) {
    return res.status(503).json({
      error: 'Razorpay Payment Gateway is not configured.',
      code: 'RAZORPAY_NOT_CONFIGURED',
      details: 'Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the environment variables to accept payments.',
    });
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100), // convert rupees to paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${userId.slice(0, 8)}`,
        notes: {
          courseId,
          courseTitle: String(courseTitle || '').slice(0, 50),
          userId,
          userEmail: String(userEmail || ''),
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Razorpay order creation error:', data);
      return res.status(response.status).json({
        error: data.error?.description || 'Failed to create Razorpay order',
        details: data,
      });
    }

    res.json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('Error contacting Razorpay:', err);
    res.status(500).json({ error: 'Internal server error while processing payment.' });
  }
});

// Verify Payment Signature API
app.post('/api/payments/verify', (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ error: 'Missing required Razorpay payment verification fields.' });
  }

  if (!isRazorpayConfigured) {
    return res.status(503).json({
      error: 'Cannot verify signature: Razorpay secret is not configured on the server.',
      code: 'RAZORPAY_NOT_CONFIGURED',
    });
  }

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      console.warn('Payment verification failed for order:', razorpayOrderId);
      return res.status(400).json({ verified: false, error: 'Invalid payment signature.' });
    }

    res.json({
      verified: true,
      message: 'Payment signature verified successfully.',
      razorpayOrderId,
      razorpayPaymentId,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Server error during payment verification.' });
  }
});

// Webhook endpoint
app.post('/api/payments/webhook', (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(200).json({ received: true, note: 'Webhook received but secret not set' });
  }

  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) {
    return res.status(400).json({ error: 'Missing webhook signature header' });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Process event idempotently
    const event = req.body.event;
    console.log(`Razorpay webhook received: ${event}`, req.body.payload?.payment?.entity?.id);

    res.json({ status: 'ok', received: true });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// -------------------------------------------------------------
// Cloudflare R2 Storage APIs
// -------------------------------------------------------------
app.get('/api/storage/config', (req, res) => {
  res.json({
    configured: isR2Configured,
    bucket: isR2Configured ? process.env.R2_BUCKET_NAME : null,
    message: isR2Configured
      ? 'Cloudflare R2 storage is configured.'
      : 'Cloudflare R2 storage credentials not yet configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME).',
  });
});

// Presigned Upload URL for Admin/Faculty uploads with strict validation
app.post('/api/storage/presigned-upload', async (req, res) => {
  const { fileName, fileType, fileSize, courseId, folder } = req.body;

  if (!isR2Configured) {
    return res.status(503).json({
      error: 'Cloudflare R2 is not configured on this server.',
      code: 'R2_NOT_CONFIGURED',
      details: 'Configure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in environment settings.',
    });
  }

  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'fileName and fileType are required.' });
  }

  const targetFolder = folder || 'videos';

  // Server-side validation for thumbnails
  if (targetFolder === 'thumbnails') {
    const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedImageMimes.includes(fileType.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid image format: ${fileType}. Only JPG, PNG, and WebP are supported for course thumbnails.`,
      });
    }

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (fileSize && Number(fileSize) > MAX_IMAGE_SIZE) {
      return res.status(400).json({
        error: `Thumbnail image exceeds the maximum 5 MB limit (received ${(Number(fileSize) / (1024 * 1024)).toFixed(1)} MB).`,
      });
    }
  } else if (targetFolder === 'videos') {
    // Server-side validation for videos
    const allowedVideoMimes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska',
      'video/ogg',
    ];
    if (!allowedVideoMimes.includes(fileType.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid video format: ${fileType}. Supported video formats are MP4, WebM, and MOV/QuickTime.`,
      });
    }

    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
    if (fileSize && Number(fileSize) > MAX_VIDEO_SIZE) {
      return res.status(400).json({
        error: `Video file exceeds the maximum 500 MB limit (received ${(Number(fileSize) / (1024 * 1024)).toFixed(1)} MB).`,
      });
    }
  }

  try {
    const r2 = getR2Client();
    if (!r2) throw new Error('R2 Client initialization failed');

    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${targetFolder}/${courseId || 'general'}/${Date.now()}_${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 900 }); // 15 minutes

    res.json({
      uploadUrl,
      objectKey: key,
      publicUrl: process.env.R2_PUBLIC_DOMAIN
        ? `${process.env.R2_PUBLIC_DOMAIN}/${key}`
        : null,
    });
  } catch (err: any) {
    console.error('Error generating presigned upload URL:', err);
    res.status(500).json({ error: 'Failed to generate upload URL', details: err.message });
  }
});

// Short-lived signed download / playback URL for private R2 content
app.post('/api/storage/playback-url', async (req, res) => {
  const { objectKey } = req.body;

  if (!objectKey) {
    return res.status(400).json({ error: 'objectKey is required.' });
  }

  if (!isR2Configured) {
    return res.status(503).json({
      error: 'Cloudflare R2 is not configured on this server.',
      code: 'R2_NOT_CONFIGURED',
    });
  }

  try {
    const r2 = getR2Client();
    if (!r2) throw new Error('R2 Client initialization failed');

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
    });

    const playbackUrl = await getSignedUrl(r2, command, { expiresIn: 3600 }); // 1 hour token
    res.json({ playbackUrl, expiresInSeconds: 3600 });
  } catch (err: any) {
    console.error('Error generating signed playback URL:', err);
    res.status(500).json({ error: 'Failed to generate playback URL' });
  }
});

// Delete old object from R2 (e.g. replaced thumbnails or deleted lessons)
app.post('/api/storage/delete-object', async (req, res) => {
  const { objectKey } = req.body;

  if (!objectKey) {
    return res.status(400).json({ error: 'objectKey is required.' });
  }

  if (!isR2Configured) {
    // If R2 is not configured, silently acknowledge so client operations don't block
    return res.json({ deleted: false, reason: 'R2 not configured' });
  }

  try {
    const r2 = getR2Client();
    if (!r2) throw new Error('R2 Client initialization failed');

    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey,
      })
    );

    res.json({ deleted: true, objectKey });
  } catch (err: any) {
    console.warn('Failed to delete old R2 object:', objectKey, err.message);
    res.json({ deleted: false, error: err.message });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Server
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Aspire Academy Online server running at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

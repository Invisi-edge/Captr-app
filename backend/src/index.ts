import { Hono, Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import OpenAI from 'openai';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db, auth, storage } from './lib/firebase';
import * as XLSX from 'xlsx-js-style';

// ─── Types ──────────────────────────────────────────────────────────────────
type AuthEnv = {
  Variables: {
    userId: string;
  };
};

interface Card {
  id?: string;
  name?: string;
  job_title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  front_image_url?: string;
  back_image_url?: string;
  raw_text_front?: string;
  raw_text_back?: string;
  created_at?: string;
  updated_at?: string;
}

const app = new Hono<AuthEnv>();

// Global error handler
app.onError((err, c) => {
  console.error('[Global Error]', err.message, err.stack);
  return c.json({ success: false, error: err.message || 'Internal Server Error' }, 500);
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Razorpay ────────────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// ─── Plans Config ────────────────────────────────────────────────────────────
interface PlanConfig {
  id: string;
  name: string;
  priceInPaise: number;
  period: 'month' | 'year' | 'forever';
  durationDays: number;
}

const PLANS: Record<string, PlanConfig> = {
  monthly: { id: 'monthly', name: 'Monthly Plan', priceInPaise: 29900, period: 'month', durationDays: 30 },
  yearly: { id: 'yearly', name: 'Yearly Plan', priceInPaise: 99900, period: 'year', durationDays: 365 },
};

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(
  '*',
  cors({
    credentials: true,
    origin: (origin) => origin || '*',
  })
);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/', (c) => {
  return c.json({ message: 'Captr API is running' });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Test Payment Page (development only) ────────────────────────────────────
app.get('/test-payment', async (c) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const html = fs.readFileSync(path.resolve('./test-payment.html'), 'utf-8');
    c.header('Content-Type', 'text/html');
    return c.body(html);
  } catch {
    return c.text('test-payment.html not found. Only available in development.', 404);
  }
});

// ─── Auth Middleware ─────────────────────────────────────────────────────────
async function authMiddleware(c: Context<AuthEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await auth.verifyIdToken(token);
    c.set('userId', decoded.uid);
    await next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('Auth error:', message);
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
}

// ─── Helper: get user's cards collection ─────────────────────────────────────
function cardsCollection(userId: string) {
  return db.collection('users').doc(userId).collection('cards');
}

// ─── OCR Scan Endpoint ───────────────────────────────────────────────────────
const scanSchema = z.object({
  frontImage: z.string(),
  backImage: z.string().optional(),
});

app.post('/api/scan', authMiddleware, zValidator('json', scanSchema), async (c) => {
  const { frontImage, backImage } = c.req.valid('json');

  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an OCR assistant specialized in reading business/visiting cards, especially Indian business cards. Extract the following fields from the card image(s):
- name (full name of the person)
- job_title (their position/designation/title)
- company (company/organization name, including suffixes like Pvt. Ltd., LLP, etc.)
- email (email address)
- phone (phone number — if an Indian number without country code, prepend +91. Format as +91 XXXXX XXXXX for Indian numbers)
- website (website URL)
- address (full address including city, state, and PIN code if available)
- notes (any other relevant info such as GST number, PAN, or additional designations)

This app is primarily used in India. Indian phone numbers are 10 digits. Common Indian area codes: +91 for mobile, 011 for Delhi, 022 for Mumbai, 080 for Bengaluru, 044 for Chennai, etc.

Return ONLY valid JSON with these exact keys. If a field is not found, use an empty string. Do not wrap in markdown code blocks.`,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all contact information from this business card.' },
          {
            type: 'image_url',
            image_url: {
              url: frontImage.startsWith('data:') ? frontImage : `data:image/jpeg;base64,${frontImage}`,
            },
          },
        ],
      },
    ];

    if (backImage) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Here is the back side of the same card. Extract any additional information and merge with the front.' },
          {
            type: 'image_url',
            image_url: {
              url: backImage.startsWith('data:') ? backImage : `data:image/jpeg;base64,${backImage}`,
            },
          },
        ],
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const extracted = JSON.parse(cleaned);

    return c.json({ success: true, data: extracted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('OCR scan error:', error);
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Save Card ───────────────────────────────────────────────────────────────
const saveCardSchema = z.object({
  name: z.string().optional().default(''),
  job_title: z.string().optional().default(''),
  company: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  website: z.string().optional().default(''),
  address: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  front_image_url: z.string().optional().default(''),
  back_image_url: z.string().optional().default(''),
  raw_text_front: z.string().optional().default(''),
  raw_text_back: z.string().optional().default(''),
});

app.post('/api/cards', authMiddleware, zValidator('json', saveCardSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');

  try {
    const now = new Date().toISOString();
    const cardData = { ...data, created_at: now, updated_at: now };
    const docRef = await cardsCollection(userId).add(cardData);
    const card = { id: docRef.id, ...cardData };

    return c.json({ success: true, data: card });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Get All Cards ───────────────────────────────────────────────────────────
app.get('/api/cards', authMiddleware, async (c) => {
  const userId = c.get('userId');

  try {
    const snapshot = await cardsCollection(userId).orderBy('created_at', 'desc').get();
    const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return c.json({ success: true, data: cards });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Get Single Card ─────────────────────────────────────────────────────────
app.get('/api/cards/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  try {
    const doc = await cardsCollection(userId).doc(id).get();
    if (!doc.exists) {
      return c.json({ success: false, error: 'Card not found' }, 404);
    }

    return c.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Update Card ─────────────────────────────────────────────────────────────
app.put('/api/cards/:id', authMiddleware, zValidator('json', saveCardSchema.partial()), async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const data = c.req.valid('json');

  try {
    const docRef = cardsCollection(userId).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return c.json({ success: false, error: 'Card not found' }, 404);
    }

    const updateData = { ...data, updated_at: new Date().toISOString() };
    await docRef.update(updateData);

    const updated = await docRef.get();
    return c.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Delete Card ─────────────────────────────────────────────────────────────
app.delete('/api/cards/:id', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  try {
    const docRef = cardsCollection(userId).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return c.json({ success: false, error: 'Card not found' }, 404);
    }

    await docRef.delete();
    return c.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Export Cards (Excel) ────────────────────────────────────────────────────
app.get('/api/export', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const format = c.req.query('format') || 'xlsx';

  try {
    const snapshot = await cardsCollection(userId).orderBy('created_at', 'desc').get();
    const cards = snapshot.docs.map((doc) => doc.data()) as Card[];

    const rows = cards.map((card) => ({
      Name: card.name || '',
      'Job Title': card.job_title || '',
      Company: card.company || '',
      Email: card.email || '',
      Phone: card.phone || '',
      Website: card.website || '',
      Address: card.address || '',
      Notes: card.notes || '',
      'Scanned At': card.created_at ? new Date(card.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');

    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[addr]) {
        ws[addr].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '1a1a2e' } },
          alignment: { horizontal: 'center' },
        };
      }
    }

    ws['!cols'] = [
      { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 30 },
      { wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 30 }, { wch: 15 },
    ];

    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws);
      c.header('Content-Type', 'text/csv');
      c.header('Content-Disposition', 'attachment; filename="captr-contacts.csv"');
      return c.body(csv);
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    c.header('Content-Disposition', 'attachment; filename="captr-contacts.xlsx"');
    return c.body(buffer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Upload Image ────────────────────────────────────────────────────────────
app.post('/api/upload', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const { base64, filename } = body;

  try {
    const buffer = Buffer.from(base64, 'base64');
    const filePath = `cards/${userId}/${Date.now()}-${filename || 'image.jpg'}`;
    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    await file.save(buffer, {
      metadata: { contentType: 'image/jpeg' },
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return c.json({ success: true, url: publicUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── AI Chatbot ──────────────────────────────────────────────────────────────
const chatSchema = z.object({
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

app.post('/api/chat', authMiddleware, zValidator('json', chatSchema), async (c) => {
  const userId = c.get('userId');
  const { message, history } = c.req.valid('json');

  try {
    const snapshot = await cardsCollection(userId).orderBy('created_at', 'desc').get();
    const cards = snapshot.docs.map((doc) => doc.data()) as Card[];

    const contactsSummary = cards.map((card) =>
      `- ${card.name || 'Unknown'} | ${card.job_title || ''} at ${card.company || ''} | Phone: ${card.phone || 'N/A'} | Email: ${card.email || 'N/A'} | Website: ${card.website || 'N/A'} | Address: ${card.address || 'N/A'} | Notes: ${card.notes || ''}`
    ).join('\n');

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are Captr AI, a helpful assistant for managing scanned business card contacts. This app is primarily used in India. You have knowledge of all the user's saved contacts.

Here are the user's contacts:
${contactsSummary || 'No contacts saved yet.'}

You can help with:
- Finding contacts by name, company, role, etc.
- Summarizing contact information
- Suggesting follow-up actions
- Answering questions about the contacts
- General business networking advice

Be concise and helpful. If the user asks about a contact, provide all relevant details.`,
      },
      ...history.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || 'Sorry, I could not process that.';
    return c.json({ success: true, reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('Chat error:', error);
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Subscription Helpers ────────────────────────────────────────────────────
function subscriptionDoc(userId: string) {
  return db.collection('users').doc(userId).collection('subscription').doc('current');
}

function scansDoc(userId: string) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return db.collection('users').doc(userId).collection('scan_usage').doc(monthKey);
}

// ─── Get Subscription Status ─────────────────────────────────────────────────
app.get('/api/subscription', authMiddleware, async (c) => {
  const userId = c.get('userId');

  try {
    const subDoc = await subscriptionDoc(userId).get();
    const usageDoc = await scansDoc(userId).get();

    if (!subDoc.exists) {
      return c.json({
        success: true,
        data: {
          plan: 'free',
          status: 'active',
          scansUsed: usageDoc.exists ? (usageDoc.data()?.count || 0) : 0,
          scansLimit: 10,
          expiresAt: null,
        },
      });
    }

    const sub = subDoc.data()!;
    const isExpired = sub.expires_at && new Date(sub.expires_at) < new Date();

    return c.json({
      success: true,
      data: {
        plan: isExpired ? 'free' : sub.plan,
        status: isExpired ? 'expired' : sub.status,
        scansUsed: usageDoc.exists ? (usageDoc.data()?.count || 0) : 0,
        scansLimit: isExpired ? 10 : (sub.plan === 'free' ? 10 : -1),
        expiresAt: sub.expires_at || null,
        razorpayPaymentId: sub.razorpay_payment_id || null,
        subscribedAt: sub.subscribed_at || null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Increment Scan Count ────────────────────────────────────────────────────
app.post('/api/subscription/scan', authMiddleware, async (c) => {
  const userId = c.get('userId');

  try {
    const subDoc = await subscriptionDoc(userId).get();
    const sub = subDoc.exists ? subDoc.data()! : { plan: 'free' };
    const isExpired = sub.expires_at && new Date(sub.expires_at) < new Date();
    const effectivePlan = isExpired ? 'free' : (sub.plan || 'free');
    const limit = effectivePlan === 'free' ? 10 : -1;

    const usageRef = scansDoc(userId);
    const usageDoc = await usageRef.get();
    const currentCount = usageDoc.exists ? (usageDoc.data()?.count || 0) : 0;

    if (limit !== -1 && currentCount >= limit) {
      return c.json({
        success: false,
        error: 'scan_limit_reached',
        message: `You have used all ${limit} free scans this month. Upgrade to continue scanning.`,
        scansUsed: currentCount,
        scansLimit: limit,
      }, 403);
    }

    await usageRef.set({ count: currentCount + 1, updated_at: new Date().toISOString() }, { merge: true });

    return c.json({
      success: true,
      scansUsed: currentCount + 1,
      scansLimit: limit,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Create Razorpay Order ───────────────────────────────────────────────────
const createOrderSchema = z.object({
  planId: z.enum(['monthly', 'yearly']),
});

app.post('/api/payments/create-order', authMiddleware, zValidator('json', createOrderSchema), async (c) => {
  const userId = c.get('userId');
  const { planId } = c.req.valid('json');
  const plan = PLANS[planId];

  if (!plan) {
    return c.json({ success: false, error: 'Invalid plan' }, 400);
  }

  try {
    const order = await razorpay.orders.create({
      amount: plan.priceInPaise,
      currency: 'INR',
      receipt: `cap_${userId.slice(0, 8)}_${Date.now()}`.slice(0, 40),
      notes: {
        userId,
        planId,
        planName: plan.name,
      },
    });
    return c.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planId,
        planName: plan.name,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('Razorpay order error:', error);
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Verify Payment & Activate Subscription ──────────────────────────────────
const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  planId: z.enum(['monthly', 'yearly']),
});

app.post('/api/payments/verify', authMiddleware, zValidator('json', verifyPaymentSchema), async (c) => {
  const userId = c.get('userId');
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = c.req.valid('json');
  const plan = PLANS[planId];

  if (!plan) {
    return c.json({ success: false, error: 'Invalid plan' }, 400);
  }

  try {
    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return c.json({ success: false, error: 'Payment verification failed. Invalid signature.' }, 400);
    }

    // Calculate expiry
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    // Store subscription in Firestore
    const subscriptionData = {
      plan: planId,
      status: 'active',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount_paid: plan.priceInPaise / 100,
      currency: 'INR',
      subscribed_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    };

    await subscriptionDoc(userId).set(subscriptionData);

    // Also store in payment history
    await db.collection('users').doc(userId).collection('payments').add({
      ...subscriptionData,
      created_at: now.toISOString(),
    });

    return c.json({
      success: true,
      message: 'Payment verified and subscription activated!',
      data: {
        plan: planId,
        expiresAt: expiresAt.toISOString(),
        amountPaid: plan.priceInPaise / 100,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('Payment verification error:', error);
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Billing History ─────────────────────────────────────────────────────────
app.get('/api/billing', authMiddleware, async (c) => {
  const userId = c.get('userId');

  try {
    const paymentsSnap = await db
      .collection('users')
      .doc(userId)
      .collection('payments')
      .orderBy('created_at', 'desc')
      .get();

    const payments = paymentsSnap.docs.map((doc) => ({
      id: doc.id,
      plan: doc.data().plan,
      status: doc.data().status,
      amount_paid: doc.data().amount_paid,
      currency: doc.data().currency || 'INR',
      razorpay_order_id: doc.data().razorpay_order_id,
      razorpay_payment_id: doc.data().razorpay_payment_id,
      subscribed_at: doc.data().subscribed_at,
      expires_at: doc.data().expires_at,
      created_at: doc.data().created_at,
    }));

    return c.json({ success: true, data: payments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('Billing history error:', error);
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Download Invoice (HTML rendered as downloadable) ────────────────────────
app.get('/api/billing/:id/invoice', async (c) => {
  // Support both header-based auth and query param token (for browser downloads)
  let userId: string;
  const queryToken = c.req.query('token');
  const authHeader = c.req.header('Authorization');
  const tokenStr = queryToken || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '');

  if (!tokenStr) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const decoded = await auth.verifyIdToken(tokenStr);
    userId = decoded.uid;
  } catch {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }

  const paymentId = c.req.param('id');

  try {
    const paymentDoc = await db
      .collection('users')
      .doc(userId)
      .collection('payments')
      .doc(paymentId)
      .get();

    if (!paymentDoc.exists) {
      return c.json({ success: false, error: 'Payment not found' }, 404);
    }

    const p = paymentDoc.data()!;
    const invoiceDate = new Date(p.created_at || p.subscribed_at);
    const invoiceNumber = `CAPTR-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}${String(invoiceDate.getDate()).padStart(2, '0')}-${paymentId.slice(-6).toUpperCase()}`;
    const planLabel = p.plan === 'yearly' ? 'Yearly Pro Plan' : 'Monthly Pro Plan';
    const amount = p.amount_paid || 0;
    const gstRate = 18;
    const baseAmount = Math.round((amount * 100) / (100 + gstRate));
    const gstAmount = amount - baseAmount;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Invoice ${invoiceNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f8fafc; padding:20px; color:#1e293b; }
  .invoice { max-width:640px; margin:0 auto; background:#fff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; }
  .header { background: linear-gradient(135deg, #6366f1, #818cf8); padding:32px; color:#fff; }
  .header h1 { font-size:28px; font-weight:800; margin-bottom:4px; }
  .header p { opacity:0.85; font-size:13px; }
  .meta { display:flex; justify-content:space-between; padding:24px 32px; border-bottom:1px solid #f1f5f9; gap:16px; flex-wrap:wrap; }
  .meta-block h3 { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:#94a3b8; margin-bottom:6px; font-weight:700; }
  .meta-block p { font-size:14px; font-weight:600; color:#334155; }
  .items { padding:24px 32px; }
  .items table { width:100%; border-collapse:collapse; }
  .items th { text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:1.2px; color:#94a3b8; font-weight:700; padding:8px 0; border-bottom:2px solid #f1f5f9; }
  .items td { padding:14px 0; font-size:14px; border-bottom:1px solid #f8fafc; }
  .items td:last-child, .items th:last-child { text-align:right; }
  .totals { padding:0 32px 24px; }
  .totals table { width:100%; border-collapse:collapse; }
  .totals td { padding:6px 0; font-size:13px; color:#64748b; }
  .totals td:last-child { text-align:right; font-weight:600; }
  .totals .total-row td { padding:12px 0; font-size:16px; font-weight:800; color:#1e293b; border-top:2px solid #e2e8f0; }
  .footer { background:#f8fafc; padding:20px 32px; text-align:center; border-top:1px solid #f1f5f9; }
  .footer p { font-size:11px; color:#94a3b8; }
  .badge { display:inline-block; background:#10b98120; color:#10b981; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  @media print { body { background:#fff; padding:0; } .invoice { border:none; border-radius:0; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <h1>Captr</h1>
    <p>Business Card Scanner &mdash; Tax Invoice</p>
  </div>
  <div class="meta">
    <div class="meta-block">
      <h3>Invoice Number</h3>
      <p>${invoiceNumber}</p>
    </div>
    <div class="meta-block">
      <h3>Date</h3>
      <p>${invoiceDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
    <div class="meta-block">
      <h3>Status</h3>
      <p><span class="badge">Paid</span></p>
    </div>
    <div class="meta-block">
      <h3>Payment ID</h3>
      <p style="font-size:12px;">${p.razorpay_payment_id || '—'}</p>
    </div>
  </div>
  <div class="items">
    <table>
      <thead><tr><th>Description</th><th>Period</th><th>Amount</th></tr></thead>
      <tbody>
        <tr>
          <td><strong>${planLabel}</strong><br/><span style="font-size:12px;color:#94a3b8;">Subscription</span></td>
          <td>${invoiceDate.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} — ${new Date(p.expires_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
          <td>₹${baseAmount.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="totals">
    <table>
      <tr><td>Subtotal</td><td>₹${baseAmount.toLocaleString('en-IN')}</td></tr>
      <tr><td>GST (${gstRate}%)</td><td>₹${gstAmount.toLocaleString('en-IN')}</td></tr>
      <tr class="total-row"><td>Total Paid</td><td>₹${amount.toLocaleString('en-IN')}</td></tr>
    </table>
  </div>
  <div class="footer">
    <p>Payment processed securely via Razorpay &bull; Order ID: ${p.razorpay_order_id || '—'}</p>
    <p style="margin-top:6px;">Thank you for subscribing to Captr Pro!</p>
  </div>
</div>
<script>window.onload=function(){window.print();}</script>
</body>
</html>`;

    c.header('Content-Type', 'text/html');
    return c.body(html);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('Invoice error:', error);
    return c.json({ success: false, error: message }, 500);
  }
});

// ─── Get Plans ───────────────────────────────────────────────────────────────
app.get('/api/plans', (c) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      features: ['10 card scans per month', 'Basic OCR extraction', 'Export to CSV', 'Local storage'],
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: 299,
      period: 'month',
      features: ['Unlimited card scans', 'AI-powered OCR extraction', 'Smart AI Assistant', 'Export to Excel, CSV, vCard', 'Cloud backup & sync', 'Priority support'],
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 999,
      period: 'year',
      badge: 'Best Value',
      savingsLabel: 'Save 72%',
      features: ['Everything in Monthly', 'Unlimited card scans', 'AI-powered OCR extraction', 'Smart AI Assistant', 'Export to Excel, CSV, vCard', 'Cloud backup & sync', 'Early access to new features'],
    },
  ];

  return c.json({ success: true, data: plans });
});

// ─── Razorpay Web Checkout Page ──────────────────────────────────────────────
// Serves an HTML page that opens Razorpay checkout in a WebView/browser.
// The app opens this URL via expo-web-browser, then the page redirects back
// to the app's deep link with payment details.
app.get('/api/payments/checkout', async (c) => {
  const orderId = c.req.query('order_id') || '';
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const amount = c.req.query('amount') || '0';
  const planName = c.req.query('plan_name') || 'Captr Plan';
  const planId = c.req.query('plan_id') || '';
  const email = c.req.query('email') || '';
  const name = c.req.query('name') || '';
  const authToken = c.req.query('token') || '';
  const backendUrl = `${c.req.url.split('/api/')[0]}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Captr - Payment</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f23; color: #fff;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 20px;
    }
    .container { text-align: center; max-width: 400px; width: 100%; }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.2);
      border-top-color: #6366f1; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 20px; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
    .error { color: #ef4444; margin-top: 20px; display: none; }
    .btn { background: #6366f1; color: #fff; border: none; padding: 16px 32px;
      border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer;
      margin-top: 20px; display: none; width: 100%; }
    .btn-success { background: #10b981; display: block; }
    .success-icon { font-size: 48px; margin-bottom: 16px; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="container" id="loading">
    <div class="spinner"></div>
    <h2>Opening Payment...</h2>
    <p>Please complete the payment in the Razorpay window.</p>
    <p class="error" id="error"></p>
    <button class="btn" id="retryBtn" onclick="openCheckout()">Retry Payment</button>
  </div>

  <div class="container hidden" id="verifying">
    <div class="spinner"></div>
    <h2>Verifying Payment...</h2>
    <p>Please wait while we confirm your payment.</p>
  </div>

  <div class="container hidden" id="success">
    <div class="success-icon">✅</div>
    <h2>Payment Successful!</h2>
    <p style="margin-bottom: 8px;">Your <strong>${planName}</strong> is now active.</p>
    <p>You can close this page and return to the app.</p>
    <button class="btn btn-success" onclick="window.close();" style="display:block; margin-top: 24px;">
      Return to App
    </button>
  </div>

  <div class="container hidden" id="failed">
    <div class="success-icon">❌</div>
    <h2>Payment Failed</h2>
    <p id="failedMsg">Something went wrong. Please try again.</p>
    <button class="btn" onclick="openCheckout()" style="display:block;">Try Again</button>
  </div>

  <script>
    var BACKEND = '${backendUrl}';
    var AUTH_TOKEN = '${authToken}';

    function show(id) {
      ['loading','verifying','success','failed'].forEach(function(s) {
        document.getElementById(s).classList.add('hidden');
      });
      document.getElementById(id).classList.remove('hidden');
    }

    async function verifyPayment(response) {
      show('verifying');
      try {
        var res = await fetch(BACKEND + '/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AUTH_TOKEN
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId: '${planId}'
          })
        });
        var json = await res.json();
        if (json.success) {
          show('success');
        } else {
          document.getElementById('failedMsg').textContent = json.error || 'Verification failed.';
          show('failed');
        }
      } catch(e) {
        document.getElementById('failedMsg').textContent = 'Network error: ' + e.message;
        show('failed');
      }
    }

    function openCheckout() {
      show('loading');
      document.getElementById('error').style.display = 'none';
      document.getElementById('retryBtn').style.display = 'none';
      
      var options = {
        key: '${keyId}',
        amount: '${amount}',
        currency: 'INR',
        name: 'Captr',
        description: '${planName}',
        order_id: '${orderId}',
        prefill: { email: '${email}', name: '${name}' },
        theme: { color: '#6366f1' },
        handler: function(response) {
          verifyPayment(response);
        },
        modal: {
          ondismiss: function() {
            show('loading');
            document.getElementById('error').textContent = 'Payment was cancelled. Tap below to try again.';
            document.getElementById('error').style.display = 'block';
            document.getElementById('retryBtn').style.display = 'block';
          }
        }
      };
      
      try {
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function(resp) {
          document.getElementById('failedMsg').textContent = resp.error.description || 'Payment failed.';
          show('failed');
        });
        rzp.open();
      } catch(e) {
        document.getElementById('error').textContent = 'Failed to load: ' + e.message;
        document.getElementById('error').style.display = 'block';
        document.getElementById('retryBtn').style.display = 'block';
      }
    }
    openCheckout();
  </script>
</body>
</html>`;

  c.header('Content-Type', 'text/html');
  return c.body(html);
});

const port = parseInt(process.env.PORT || '3002', 10);

export default {
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
};

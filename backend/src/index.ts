import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import OpenAI from 'openai';
import { db, auth, storage } from './lib/firebase';
import * as XLSX from 'xlsx-js-style';

// ─── Types ──────────────────────────────────────────────────────────────────
type AuthEnv = {
  Variables: {
    userId: string;
  };
};

const app = new Hono<AuthEnv>();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// ─── Auth Middleware ─────────────────────────────────────────────────────────
async function authMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const decoded = await auth.verifyIdToken(token);
    c.set('userId', decoded.uid);
    await next();
  } catch (error: any) {
    console.error('Auth error:', error.message);
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
        content: `You are an OCR assistant specialized in reading business/visiting cards. Extract the following fields from the card image(s):
- name (full name of the person)
- job_title (their position/title)
- company (company/organization name)
- email (email address)
- phone (phone number with country code if visible)
- website (website URL)
- address (full address)
- notes (any other relevant info on the card)

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
  } catch (error: any) {
    console.error('OCR scan error:', error);
    return c.json({ success: false, error: error.message }, 500);
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
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ─── Get All Cards ───────────────────────────────────────────────────────────
app.get('/api/cards', authMiddleware, async (c) => {
  const userId = c.get('userId');

  try {
    const snapshot = await cardsCollection(userId).orderBy('created_at', 'desc').get();
    const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return c.json({ success: true, data: cards });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
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
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
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
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
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
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ─── Export Cards (Excel) ────────────────────────────────────────────────────
app.get('/api/export', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const format = c.req.query('format') || 'xlsx';

  try {
    const snapshot = await cardsCollection(userId).orderBy('created_at', 'desc').get();
    const cards = snapshot.docs.map((doc) => doc.data());

    const rows = cards.map((card: any) => ({
      Name: card.name || '',
      'Job Title': card.job_title || '',
      Company: card.company || '',
      Email: card.email || '',
      Phone: card.phone || '',
      Website: card.website || '',
      Address: card.address || '',
      Notes: card.notes || '',
      'Scanned At': card.created_at ? new Date(card.created_at).toLocaleDateString() : '',
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
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
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
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
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
    const cards = snapshot.docs.map((doc) => doc.data());

    const contactsSummary = cards.map((card: any) =>
      `- ${card.name || 'Unknown'} | ${card.job_title || ''} at ${card.company || ''} | Phone: ${card.phone || 'N/A'} | Email: ${card.email || 'N/A'} | Website: ${card.website || 'N/A'} | Address: ${card.address || 'N/A'} | Notes: ${card.notes || ''}`
    ).join('\n');

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are Captr AI, a helpful assistant for managing scanned business card contacts. You have knowledge of all the user's saved contacts.

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
  } catch (error: any) {
    console.error('Chat error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

const port = parseInt(process.env.PORT || '3002', 10);

export default {
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
};

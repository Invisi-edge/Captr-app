# Firebase Setup Guide for Captr

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** (or "Add project")
3. Enter a project name (e.g. `captr-app`)
4. Disable Google Analytics (optional, not needed)
5. Click **Create project**

---

## Step 2: Enable Authentication

1. In your Firebase project, go to **Build → Authentication**
2. Click **"Get started"**
3. Go to the **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on it → toggle **Enable** → Save
5. Enable **Google**:
   - Click on it → toggle **Enable**
   - Set a **support email** (your email)
   - Save
6. Note down the **Web client ID** shown under Google provider (you'll need it later)

---

## Step 3: Create a Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **Start in test mode** (you can add security rules later)
4. Select a location closest to your users
5. Click **Enable**

---

## Step 4: Create Firebase Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Choose **Start in test mode**
4. Click **Next** → select same location → **Done**

---

## Step 5: Register a Web App

1. Go to **Project Settings** (gear icon next to "Project Overview")
2. Scroll down to **"Your apps"**
3. Click the **Web icon** (`</>`)
4. Enter an app nickname (e.g. `captr-web`)
5. Click **Register app**
6. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "captr-app.firebaseapp.com",
  projectId: "captr-app",
  storageBucket: "captr-app.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

7. **Copy these values** — you'll paste them into `frontend/.env`

---

## Step 6: Generate a Service Account Key (for Backend)

1. Go to **Project Settings → Service Accounts**
2. Make sure **Firebase Admin SDK** is selected
3. Click **"Generate new private key"**
4. A JSON file will download — **keep it safe, don't commit it**
5. Open the JSON file and copy its entire contents

---

## Step 7: Fill in Environment Variables

### Frontend (`frontend/.env`)

Open `frontend/.env` and replace the placeholder values with your Firebase web app config:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=captr-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=captr-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=captr-app.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abc.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
```

**Where to find the Google Web Client ID:**
- Go to **Authentication → Sign-in method → Google** → expand it
- Copy the **Web client ID**
- OR go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) and find the OAuth 2.0 "Web client" auto-created by Firebase

> iOS and Android client IDs are only needed if you plan to build native apps. You can leave them empty for now.

### Backend (`backend/.env`)

Open `backend/.env` and paste the entire service account JSON as a single line:

```
OPENAI_API_KEY=sk-proj-your-key-here

FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"captr-app","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxx@captr-app.iam.gserviceaccount.com","client_id":"123456","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40captr-app.iam.gserviceaccount.com"}
```

**Important:** The JSON must be on a **single line** with no line breaks (except inside the private key `\n` escapes which are fine).

**Tip:** You can minify the downloaded JSON with:
```bash
cat path/to/your-service-account.json | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin)))"
```
Then paste the output after `FIREBASE_SERVICE_ACCOUNT=`

---

## Step 8: Restart the App

```bash
# Terminal 1 — Backend
cd backend && bun run dev

# Terminal 2 — Frontend
cd frontend && npx expo start -c
```

---

## Checklist

- [ ] Firebase project created
- [ ] Email/Password auth enabled
- [ ] Google auth enabled
- [ ] Firestore database created (test mode)
- [ ] Firebase Storage created (test mode)
- [ ] Web app registered, config values copied
- [ ] Service account key generated
- [ ] `frontend/.env` filled in
- [ ] `backend/.env` filled in (service account JSON on one line)
- [ ] App restarted and working

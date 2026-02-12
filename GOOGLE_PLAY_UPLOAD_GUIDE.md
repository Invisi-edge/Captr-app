# How to Upload Captr to Google Play Console

A step-by-step guide to publish the Captr app on the Google Play Store.

---

## Prerequisites

Before you start, make sure you have:

- [ ] A Google Play Developer account (one-time $25 fee) — https://play.google.com/console/signup
- [ ] Backend deployed to Railway with the latest code (privacy policy + terms pages)
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged into EAS: `eas login`

---

## Step 1: Deploy the Backend to Railway

The privacy policy must be live before Google reviews your app.

1. Push your latest backend code to your Git repo (if Railway is connected to Git), OR deploy manually via Railway dashboard
2. Verify it's live by visiting:
   - https://captr-app-production.up.railway.app/privacy-policy
   - https://captr-app-production.up.railway.app/terms-of-service
3. Both pages should load with proper content

---

## Step 2: Build the Production AAB

Google Play requires an Android App Bundle (.aab), not an APK.

```bash
cd frontend
npx eas-cli build --platform android --profile production --non-interactive
```

This will:
- Build a signed `.aab` file on EAS cloud servers
- Auto-increment the `versionCode`
- Use your `credentials.json` for signing

Wait for the build to complete (5-15 minutes). When done, you'll get a download link like:
```
https://expo.dev/accounts/bruha01/projects/captr/builds/[build-id]
```

**Download the `.aab` file** from that link — you'll need it in Step 4.

---

## Step 3: Create Your App in Google Play Console

1. Go to https://play.google.com/console
2. Click **"Create app"**
3. Fill in:
   - **App name**: `Captr - Business Card Scanner`
   - **Default language**: English (India)
   - **App or game**: App
   - **Free or paid**: Free
4. Accept the declarations and click **"Create app"**

---

## Step 4: Upload the AAB

1. In your app's dashboard, go to **Production** (left sidebar under "Release")
2. Click **"Create new release"**
3. Click **"Upload"** and select the `.aab` file you downloaded in Step 2
4. Add release notes:
   ```
   Initial release of Captr - Business Card Scanner.
   - AI-powered business card scanning
   - Contact management and search
   - CSV export
   - Cloud storage
   ```
5. Click **"Save"** (don't click Review yet — complete the setup first)

---

## Step 5: Fill in Store Listing

Go to **Store presence > Main store listing** and fill in:

### App Details
| Field | Value |
|-------|-------|
| **App name** | Captr - Business Card Scanner |
| **Short description** | Scan visiting cards instantly with AI. Extract, organise & export contacts. |
| **Full description** | *(Copy from PLAY_STORE_LISTING.md in this project)* |

### Graphics (you need to create/upload these)
| Asset | Requirement |
|-------|-------------|
| **App icon** | 512 x 512 px PNG (already in `assets/images/icon.png` — resize if needed) |
| **Feature graphic** | 1024 x 500 px PNG/JPG (create a banner showing the app) |
| **Phone screenshots** | Minimum 2 screenshots, 16:9 or 9:16 ratio, min 320px, max 3840px |

**How to take screenshots:**
- Open the app on your phone
- Take screenshots of: Home screen, Scanner, Review screen, Contact details, Settings
- Minimum 2, recommended 4-8 screenshots

### Contact Details
| Field | Value |
|-------|-------|
| **Email** | support@captr.app |
| **Phone** | *(optional)* |
| **Website** | *(optional)* |

---

## Step 6: Content Rating

1. Go to **Policy > App content > Content rating**
2. Click **"Start questionnaire"**
3. Select category: **"Utility, Productivity, Communication, or other"**
4. Answer all questions honestly:
   - Violence: No
   - Sexual content: No
   - Language: No
   - Controlled substances: No
   - User-generated content: No (users scan their own cards)
5. You should get an **"Everyone"** rating

---

## Step 7: Privacy Policy & Data Safety

### Privacy Policy
1. Go to **Policy > App content > Privacy policy**
2. Enter the URL: `https://captr-app-production.up.railway.app/privacy-policy`

### Data Safety
1. Go to **Policy > App content > Data safety**
2. Fill in the form:

| Question | Answer |
|----------|--------|
| Does your app collect or share any user data? | **Yes** |
| Is all user data encrypted in transit? | **Yes** |
| Do you provide a way for users to request data deletion? | **Yes** (via support@captr.app) |

**Data types collected:**

| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Name | Yes | No | App functionality |
| Email address | Yes | No | Account management |
| Phone number | Yes | No | App functionality (from scanned cards) |
| Photos | Yes | No | App functionality (card scanning) |

**Important**: Mark that data is transferred outside India (Firebase servers, OpenAI API).

---

## Step 8: Target Audience & App Category

1. Go to **Policy > App content > Target audience**
2. Select target age: **18 and over** (the app is for business professionals)
3. Confirm it's NOT designed for children

4. Go to **Store presence > Store settings**
5. Set **Category**: Business
6. Set **Tags**: business card scanner, OCR, contact management

---

## Step 9: App Access (Important!)

1. Go to **Policy > App content > App access**
2. Since Captr requires sign-in, select: **"All or some functionality is restricted"**
3. Click **"Manage"** and add test credentials:
   - **Instructions**: "Sign in with Google or create an account with any email"
   - If Google sign-in doesn't work for reviewers, create a test account:
     - Email: `reviewer@captr.app` (or any test email)
     - Password: `TestReview123!`
   - Make sure this account works before submitting

---

## Step 10: Permissions Declaration

Google will ask why your app needs certain permissions:

| Permission | Reason |
|------------|--------|
| **Camera** | Required to scan business cards by taking photos |
| **Contacts** | Required to save scanned contacts to the phone's address book |

If asked about **sensitive permissions**, explain each one clearly. Your app config already blocks unnecessary permissions (RECORD_AUDIO, READ_PHONE_STATE, etc.), which is good.

---

## Step 11: Review & Publish

1. Go back to **Production > Releases**
2. Check that all setup tasks show green checkmarks in the dashboard
3. If anything is yellow/red, click on it and complete the required info
4. Click **"Review release"**
5. Review the summary
6. Click **"Start rollout to Production"**

### What happens next:
- Google reviews your app (typically **1-3 days** for first submission, sometimes up to **7 days**)
- You'll get an email when it's approved or if changes are needed
- If rejected, they'll tell you exactly what to fix

---

## Quick Reference — App Details

| Item | Value |
|------|-------|
| Package name | `com.captr.scanner` |
| Version | 1.0.0 |
| App name | Captr - Business Card Scanner |
| Category | Business |
| Content rating | Everyone |
| Privacy policy | https://captr-app-production.up.railway.app/privacy-policy |
| Terms of service | https://captr-app-production.up.railway.app/terms-of-service |
| Contact email | support@captr.app |
| Default language | English (India) |
| Target countries | India (Primary) |

---

## Troubleshooting

### "Your app bundle has a different signing key"
If you've previously uploaded an app with a different key, you need to use the same keystore. Your signing credentials are in `frontend/credentials.json`.

### "Privacy policy URL is not accessible"
Make sure your Railway backend is deployed with the latest code. Test by opening the URL in a browser.

### "App rejected for permission issues"
Review the permissions in `app.config.ts`. We've already blocked unnecessary permissions. If Google flags something specific, remove it and rebuild.

### "App rejected for payment policy"
Our app currently has no active payments (all show "Coming Soon"). This should pass review. When you add payments later, you must use Google Play Billing for digital goods.

### Build failed on EAS
Make sure there's no `bun.lock` file in the frontend folder. Only `package-lock.json` should exist.

---

## After Publishing

Once your app is live:

1. **Monitor reviews** in Play Console dashboard
2. **Check crash reports** under Quality > Android vitals
3. **Update the app** by incrementing the version and building a new AAB:
   ```bash
   cd frontend
   npx eas-cli build --platform android --profile production --non-interactive
   ```
   Then upload the new AAB as a new release in Play Console.

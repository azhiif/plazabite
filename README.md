# PlazaBite 🍽️⚡
> **Next-Generation Shared Dining, Food Court & Multi-Cafe Digital QR Platform**  
> Built with Next.js 16 (Turbopack), TailwindCSS, Three.js, Supabase, and Capacitor for iOS/Android native mobile apps.

---

## 🌟 Overview & Key Real-World Features

PlazaBite is engineered specifically for **food courts, drive-ins, open food plazas, and shared dining halls** where multiple independent kitchens share a common seating area.

- **Universal Plaza QR**: Diners scan a single QR code at the entrance or on any table tent to access every participating cafe stall in a single collective menu.
- **Shared Seating & Flexible Fulfillment**:
  - **🥡 Counter Pickup / Token Mode**: Standard fast-casual food court buzzer model. No table number required; diners pick up at each stall counter when notified.
  - **🍽️ Direct Table Delivery**: For plazas with numbered common tables (Tables 1–50) with runner delivery.
- **Direct Shop-Specific UPI Bank Settlement**:
  - 0% payment gateway commissions.
  - Dynamic QR codes and 1-tap mobile UPI intent links route payments directly into each individual stall's merchant bank account (`caffellon@okhdfcbank`, `momohaven@paytm`, `brewbeans@okhdfcbank`, etc.).
- **Staff Kitchen Displays & High-Importance Audio Alerts**:
  - Live Kitchen Order Ticket (KOT) terminal with synthesizer chimes and native haptics.
  - Direct URL lock guard requiring **Registered Mobile Number + 4-Digit Staff PIN**.
  - In-dashboard **Shop Settings** to update merchant UPI IDs with live test QR previews and change secret PINs.
- **3D Interactive Landing Page**:
  - Three.js 3D interactive nexus visual with glowing orbital rings and particle constellation.
  - Full mobile-first responsive layout and slide-down navigation drawer.
- **SuperAdmin Multi-Venue Portal (`/admin`)**:
  - Master PIN lock (`9999`).
  - Create and manage multiple food courts/venues.
  - Approve or reject cafe stall join requests.
- **Native iOS & Android Mobile Apps**:
  - Capacitor configuration (`com.plazabite.partner`) with native push notifications, background audio, and app icons/splash screens.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup (Supabase)

The complete SQL scripts are located in the project root:
1. **`schema.sql`**: Full database schema definition (Food Courts, Banners, Tables, Shops, Items, Orders, Order Items).
2. **`schema2.sql`**: Fast delta migration adding `upi_id` to `shops` and `dining_option` to `orders`.

To apply:
1. Go to your **Supabase Dashboard $\rightarrow$ SQL Editor**.
2. Run `schema.sql` (or if already run, execute `schema2.sql`).

---

## 📱 Mobile App (Capacitor for Staff)

PlazaBite includes native iOS and Android projects configured under `android/` and `ios/`:

```bash
# Sync web build to native iOS and Android
npm run build
npm run cap:sync

# Open Android Studio
npm run cap:android

# Open Xcode
npm run cap:ios
```

---

## 🌐 Production Deployment

### Recommended: Vercel (1-Click, Free, Native Next.js SSR)
Because PlazaBite uses dynamic Next.js routes (`/shop/[shopId]/dashboard`, `/t/[tableId]`) and real-time Supabase subscriptions, **Vercel** is the recommended host:
1. Push this repository to GitHub.
2. Go to [Vercel.com](https://vercel.com) and click **"Add New Project"** $\rightarrow$ Import your GitHub repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically build and deploy your app with zero configuration and automatic continuous deployment on every `git push`.

---

## 🔐 Default Credentials (Demo / Testing)

| Role | Portal URL | Credentials |
| :--- | :--- | :--- |
| **SuperAdmin** | `/admin` | Master PIN: `9999` |
| **Caffellon Kitchen** | `/partner` | Phone: `9876543210` • PIN: `1234` |
| **Brew & Beans Kitchen** | `/partner` | Phone: `9876543211` • PIN: `1234` |
| **Momo Haven Kitchen** | `/partner` | Phone: `9876543212` • PIN: `1234` |
| **Sweet Scoop Kitchen** | `/partner` | Phone: `9876543213` • PIN: `1234` |

---

## 📄 License
MIT © PlazaBite

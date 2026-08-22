# Fabric Infinity - E-Commerce Platform

A full-stack e-commerce platform for selling fabrics, built with React (Vite), TypeScript, Express, and PostgreSQL.

## 🚀 Features

- **Customer Store**: Browse products, categories, add to cart, checkout
- **Admin Dashboard**: Product management, order tracking, analytics
- **AI Integration**: Groq-powered fabric image analysis and auto-fill
- **Image Upload**: Product image management with persistent storage
- **Authentication**: Secure admin login with cookie-based sessions
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Payment Integration**: Razorpay payment gateway

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: v20 or higher (Current: v24.18.0 detected)
- **pnpm**: Package manager (REQUIRED - npm/yarn won't work)
- **PostgreSQL**: v16 or higher
- **Git**: For version control

## 🔧 Installation

### Step 1: Install pnpm

```powershell
# Install pnpm globally using npm
npm install -g pnpm

# Verify installation
pnpm --version
```

### Step 2: Clone and Install Dependencies

```powershell
# Navigate to project directory
cd fabric_infinity

# Install all dependencies (monorepo structure)
pnpm install
```

### Step 3: Set Up Environment Variables

Create environment variables for the API server. On Replit, use the Secrets tab. Locally, create a `.env` file:

```env
# Required Environment Variables
DATABASE_URL=postgresql://username:password@host:port/database_name
SESSION_SECRET=your-secure-random-secret-key-here
PORT=5000

# Optional: For AI Features
GROQ_API_KEY=your-groq-api-key-here

# Optional: For Payments
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

**Important Notes:**
- `SESSION_SECRET`: Generate a secure random string (e.g., `openssl rand -base64 32`)
- `DATABASE_URL`: Your PostgreSQL connection string
- `GROQ_API_KEY`: Get free API key from [console.groq.com](https://console.groq.com)

### Step 4: Set Up Database

```powershell
# Push database schema to PostgreSQL
cd lib/db
pnpm run push

# Return to root
cd ../..
```

### Step 5: Create uploads directory

```powershell
# Create uploads folder for product images (if not exists)
New-Item -ItemType Directory -Force -Path "uploads"
```

## 🎯 Running the Project

### Development Mode

The project has two main artifacts that need to run together:

#### Option 1: Run Both Together (Recommended for Development)

```powershell
# Terminal 1: Start API Server
cd artifacts/api-server
pnpm run dev

# Terminal 2: Start Frontend (in a new terminal)
cd artifacts/fabric-infinity
pnpm run dev
```

#### Option 2: Production Build

```powershell
# Build everything
pnpm run build

# Start API server
cd artifacts/api-server
pnpm start

# Serve frontend
cd ../fabric-infinity
pnpm run serve
```

### Access the Application

- **Frontend (Customer Store)**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin
- **API Server**: http://localhost:5000

### Default Admin Credentials

Check your admin route configuration or database seeded data. If not set up, you'll need to manually insert an admin user in the database.

## 📁 Project Structure

```
fabric_infinity/
├── artifacts/
│   ├── api-server/          # Express backend API
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── middlewares/ # Auth, validation
│   │   │   └── lib/         # Utilities (logger)
│   │   └── package.json
│   └── fabric-infinity/     # React frontend
│       ├── src/
│       │   ├── pages/       # Route pages
│       │   ├── components/  # Reusable UI
│       │   └── contexts/    # State management
│       └── package.json
├── lib/
│   ├── db/                  # Database schema & Drizzle ORM
│   ├── api-zod/             # API validation schemas
│   ├── api-spec/            # API specifications
│   └── api-client-react/    # React Query hooks
├── scripts/                 # Build/deployment scripts
├── uploads/                 # Product images (created at runtime)
└── package.json             # Root workspace config
```

## 🛠️ Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Wouter (routing)
- **Backend**: Express 5, Node.js
- **Database**: PostgreSQL, Drizzle ORM
- **State Management**: TanStack React Query, Context API
- **UI Components**: Radix UI, shadcn/ui
- **File Upload**: Multer
- **Payment**: Razorpay
- **AI**: Groq API for image analysis

## ⚙️ Current Issues & Solutions

### ❌ Issue 1: Dependencies Not Installed
**Status**: Not installed (detected missing node_modules)
**Solution**: Run `pnpm install` as shown in Step 2

### ❌ Issue 2: Image Persistence
**Status**: FIXED in this update
- Images are saved to `/uploads` directory
- Served via `/api/uploads/` endpoint
- Images persist permanently after upload
- Owner can remove images from product edit page

### ❌ Issue 3: Owner Cannot Delete Products from Main Website
**Status**: TO BE IMPLEMENTED
**Solution**: Added password-protected delete button on product cards (public shop)

### ❌ Issue 4: pnpm Not Installed
**Status**: REQUIRED
**Solution**: Install pnpm using `npm install -g pnpm`

### ❌ Issue 5: Environment Variables Not Set
**Status**: CRITICAL
**Solution**: Set `DATABASE_URL`, `SESSION_SECRET`, and `PORT` as environment variables

## 🆕 New Features Added

### 1. ✅ Image Upload & Persistence
- Upload images in Admin Product Form
- Images saved to `uploads/` folder
- Remove option added (X button on each image)
- Last uploaded image highlighted with "latest" tag
- Static file serving configured at `/api/uploads/`

### 2. ✅ Admin Delete Products
- Delete button with confirmation dialog in admin panel
- Password protection already exists (requireAdmin middleware)

### 3. 🔜 Owner Delete from Main Website (To Be Implemented)
- Add password-protected delete button on Shop page
- Only visible when owner is authenticated
- Requires password confirmation before deletion

## 📝 Incomplete Features & Recommendations

### 1. Authentication System
**Current Status**: Admin auth exists, but customer auth is minimal
**Recommendation**: 
- Implement full customer registration/login
- Add password reset functionality
- Implement JWT or session-based auth for customers

### 2. Payment Integration
**Current Status**: Razorpay configured but not fully tested
**Recommendation**:
- Test Razorpay integration end-to-end
- Add payment success/failure handling
- Implement order status updates after payment

### 3. Order Management
**Current Status**: Basic order CRUD exists
**Recommendation**:
- Add order status workflow (pending → processing → shipped → delivered)
- Email notifications for order updates
- Invoice generation

### 4. Product Reviews
**Current Status**: Database schema exists, but UI not fully implemented
**Recommendation**:
- Build review submission form
- Display reviews on product detail page
- Add review moderation in admin

### 5. Inventory Management
**Current Status**: Basic stock tracking
**Recommendation**:
- Low stock alerts
- Automatic stock deduction after orders
- Restock notifications

### 6. Search & Filtering
**Current Status**: Basic search exists
**Recommendation**:
- Advanced filters (price range, fabric type, color)
- Full-text search with PostgreSQL
- Search suggestions/autocomplete

### 7. Analytics Dashboard
**Current Status**: Basic dashboard exists
**Recommendation**:
- Sales analytics with charts
- Best-selling products
- Revenue tracking
- Customer insights

### 8. SEO & Performance
**Current Status**: Basic React app
**Recommendation**:
- Add meta tags for products
- Implement lazy loading for images
- Add sitemap.xml and robots.txt
- Consider SSR (Next.js) for better SEO

### 9. Email Integration
**Current Status**: Not implemented
**Recommendation**:
- Order confirmation emails
- Shipping updates
- Newsletter subscription
- Admin notifications

### 10. Mobile App
**Current Status**: Responsive web only
**Recommendation**:
- Build React Native app
- Or use PWA approach

## 🔐 Security Considerations

1. **Session Secret**: Always use a strong, random SESSION_SECRET in production
2. **HTTPS**: Enable HTTPS in production
3. **Input Validation**: API uses Zod schemas for validation
4. **SQL Injection**: Protected by Drizzle ORM parameterized queries
5. **File Upload**: Limited to 5MB, images only
6. **Admin Routes**: Protected by `requireAdmin` middleware

## 📞 Support & Contact

- **WhatsApp**: +91 8530361444 (configured in environment)
- **Issues**: Report bugs in the project repository

## 📄 License

MIT License - Feel free to use for commercial projects

---

**Note**: This is a monorepo managed by pnpm workspaces. Always use `pnpm` commands, not npm or yarn.

## Verified audit — August 22, 2026

The current Replit workflows are running:

- `artifacts/fabric-infinity` — storefront/admin React application
- `artifacts/api-server` — Express API

### Verified working

- Database schema push and seeded data
- API typecheck
- Frontend typecheck
- Frontend production build
- `GET /api/healthz` returns 200
- Products, categories, banners, and coupon validation return successfully
- COD order creation returns 201
- Razorpay test order creation returns 201 with a real Razorpay test order ID
- Razorpay signature-verification endpoint is implemented
- Product images serve through `/api/assets/...`
- Homepage preview loads with the real Fabric Infinity logo and hero banners
- Admin password login uses `ADMIN_PASSWORD` and a signed HTTP-only cookie
- Customer mobile/email OTP session flow is implemented
- Admin product, order, category, banner, customer, and settings screens are routed

### Payment status

Razorpay is integrated in **test mode**, not live mode. The flow creates a Razorpay order on the server, opens Razorpay Checkout in the browser, and verifies the returned signature on the server. COD is implemented and tested.

Before launch, replace the test credentials with live Razorpay credentials in Replit Secrets and complete a small real-payment test. Never put `RAZORPAY_KEY_SECRET` in frontend code.

### Authentication status

- Admin authentication is ready for internal owner access.
- Customer sign-in supports mobile OTP and email OTP UI/session flow.
- OTP delivery is currently demo mode: the API logs and returns `demo_otp`. This must be replaced with an SMS/email provider before public launch.
- Google sign-in is not connected yet. The database reserves `googleId`, but a Google OAuth client, callback, and production session flow still need to be added.

### Exact external information still needed

1. Production Razorpay account/live credentials when ready.
2. Real support email, business phone/WhatsApp, and store address.
3. Final Instagram/Facebook links.
4. Shipping charge, free-shipping threshold, delivery regions, and estimated delivery time.
5. Shipping, returns/refunds, privacy, and terms copy.
6. Final catalogue data: prices, stock, measurements, variants, descriptions, and approved photos.
7. An OTP provider for Indian mobile delivery (MSG91, 2Factor, Twilio, or similar).
8. An email provider for email OTP/order emails (Resend, SendGrid, Mailgun, or SMTP).
9. Google OAuth web client ID/secret and development/production callback URLs if Google login is required.
10. Optional courier aggregator and WhatsApp/email notification provider for automated fulfilment updates.

### Important launch hardening remaining

- Remove `demo_otp` from responses and add real SMS/email delivery.
- Add OTP rate limiting, retry limits, and abuse protection.
- Add transactional stock validation/decrement during order creation.
- Add Razorpay webhooks for asynchronous payment success, refunds, and disputes.
- Add CSRF/origin protection for cookie-authenticated mutations.
- Add review moderation, invoice generation, and order notification emails.
- Replace seeded sample products, coupons, reviews, and audit test orders.

### Commands used for verification

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/fabric-infinity run typecheck
PORT=19802 BASE_PATH=/ pnpm --filter @workspace/fabric-infinity run build
pnpm --filter @workspace/scripts run seed
```

The admin password and payment secrets are intentionally not written in this README. Use Replit Secrets and open `/admin/login`.

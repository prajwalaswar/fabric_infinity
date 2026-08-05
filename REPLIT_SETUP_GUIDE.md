# Replit Setup Guide - Fabric Infinity

Ye guide specially Replit ke liye hai jahan PostgreSQL aur deployment already built-in hai.

## 🎯 Quick Setup Steps

### 1. Environment Variables (Replit Secrets)

Replit me **Secrets** tab kholo aur ye add karo:

#### Required Secrets:

```
SESSION_SECRET=<randomly-generated-32-char-string>
PORT=5000
```

**Generate SESSION_SECRET:**
- Replit Shell me run karo: `openssl rand -base64 32`
- Ya use this: `flKBJfHFA2Ohni8uVGF33EURJJGmPtUzT5ms5s1Gdr4=`

#### Optional (for payments):

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx
```

**Get Razorpay Keys:**
1. Sign up at: https://razorpay.com
2. Go to Settings → API Keys
3. Generate Test Keys (for testing)
4. Copy both Key ID and Secret

### 2. Database Setup

Replit automatically setup kar deta hai PostgreSQL. Bas schema push karna hai:

```bash
cd lib/db
pnpm run push
```

### 3. Create Default Categories

```bash
cd lib/db
pnpm run seed-categories
cd ../..
```

Ye 4 categories automatically create kar dega:
1. **New Arrivals** (slug: new-arrivals)
2. **Fabrics** (slug: fabrics)  
3. **Dress Material** (slug: dress-material)
4. **Saree Collection** (slug: saree-collection)

### 4. Run the Project

Replit me **Run** button press karo, ya manually:

```bash
# Terminal 1 (API Server)
cd artifacts/api-server
pnpm run dev

# Terminal 2 (Frontend)
cd artifacts/fabric-infinity
pnpm run dev
```

## 📦 Features Overview

### Category System
- **Automatic Assignment**: Jab aap product add karte ho, dropdown me category select karo
- Product automatically selected category me assign ho jayega
- Category slug product URL me use hoga

### Payment Integration

#### Payment Options:
1. **Cash on Delivery (COD)** - Always works
2. **Online Payment (Razorpay)** - Needs API keys

#### Razorpay Setup Status:

✅ **Working (Already Implemented):**
- Payment gateway integration
- Order creation
- Payment verification
- Signature validation
- Order status update after payment

❌ **Pending (Need to Add):**
- Razorpay API Keys in Secrets tab
- Test mode enabled by default

#### Payment Flow:

1. Customer checkout pe jata hai
2. Payment method select karta hai (COD / Online)
3. If Online selected:
   - Razorpay popup khulta hai
   - Customer payment karta hai (UPI/Card/NetBanking)
   - Payment verify hota hai
   - Order confirmed hota hai
4. If COD selected:
   - Direct order place hota hai
   - Payment pending rahega delivery tak

### Current Issues

#### Issue 1: "Invalid" Payment Error

**Reason**: Razorpay keys Secrets me nahi hain

**Solution**:
1. Replit Secrets tab kholo
2. Add these:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```
3. Server restart karo

**Temporary Workaround**: COD use karo (already working)

#### Issue 2: Categories Not Showing

**Reason**: Database me categories nahi hain

**Solution**: Seed script run karo
```bash
cd lib/db
pnpm run seed-categories
```

## 🔧 How Categories Work

### Adding Product with Category:

1. Admin Dashboard → Products → Add Product
2. "Category" dropdown me se select karo:
   - New Arrivals
   - Fabrics
   - Dress Material
   - Saree Collection
3. Product save karo
4. Product automatically us category me add ho jayega

### Category Filtering on Shop Page:

- Shop page pe left sidebar me categories show hongi
- Click on category → sirf us category ke products dikenge
- "All Categories" → sab products dikenge

### Special Categories:

- **New Arrivals**: "isNewArrival" flag true hogi
- **Bestsellers**: "isBestseller" flag true hogi

## 🛠️ Testing Payment

### Test Mode (Safe for Testing):

```
Razorpay Test Keys se payment testing karo (real money nahi lagega)
```

**Test Cards:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI:**
- UPI ID: success@razorpay
- For failure testing: failure@razorpay

### Production Mode:

1. Razorpay dashboard me production keys generate karo
2. Business verification complete karo
3. Live keys Secrets me add karo
4. Test thoroughly before going live

## 📋 Complete Checklist

### Database Setup:
- [ ] `pnpm run push` - Schema created
- [ ] `pnpm run seed-categories` - Categories created
- [ ] Verify in pgAdmin or psql

### Secrets Configuration:
- [ ] SESSION_SECRET added
- [ ] PORT added (5000)
- [ ] RAZORPAY_KEY_ID added (optional)
- [ ] RAZORPAY_KEY_SECRET added (optional)

### Features Testing:
- [ ] Can create products
- [ ] Can select category when adding product
- [ ] Products show in correct category on shop page
- [ ] COD payment works
- [ ] Razorpay payment works (if keys added)
- [ ] Order confirmation page shows after payment

### Category Testing:
- [ ] New Arrivals category exists
- [ ] Fabrics category exists
- [ ] Dress Material category exists
- [ ] Saree Collection category exists
- [ ] Products can be assigned to categories
- [ ] Category filter works on shop page

## 🎨 Customization

### Adding More Categories:

#### Option 1: From Admin Panel
1. Dashboard → Categories
2. Click "Add Category"
3. Enter name (slug auto-generates)
4. Save

#### Option 2: Edit seed-categories.ts
```typescript
const defaultCategories = [
  // ... existing categories
  {
    name: "Your New Category",
    slug: "your-new-category",
    image: null,
    description: "Category description"
  }
];
```

### Changing Payment Provider:

Current: Razorpay
To change: Edit `artifacts/api-server/src/routes/orders.ts`

## 🚨 Common Errors & Solutions

### Error: "SESSION_SECRET env var is not set"

**Fix**: Add SESSION_SECRET in Replit Secrets tab

### Error: "Payment invalid"

**Fix**: 
1. Check Razorpay keys in Secrets
2. Use COD instead temporarily
3. Verify keys are correct (test/live)

### Error: "Cannot create order"

**Fix**: Check database connection and run migrations

### Error: "Category not found"

**Fix**: Run seed-categories script

## 📞 Payment Issues Checklist

Agar payment kaam nahi kar raha:

1. **Check Razorpay Keys:**
   ```bash
   # Replit Shell me
   echo $RAZORPAY_KEY_ID
   echo $RAZORPAY_KEY_SECRET
   ```
   
2. **Verify Keys Format:**
   - Key ID starts with: `rzp_test_` (test) or `rzp_live_` (production)
   - Secret is long alphanumeric string

3. **Check Razorpay Dashboard:**
   - Login to https://dashboard.razorpay.com
   - Check "Test Mode" is ON
   - Verify API keys are active

4. **Browser Console:**
   - Open browser DevTools (F12)
   - Check for any errors
   - Razorpay script should load

5. **Server Logs:**
   - Check Replit console for errors
   - Look for "Failed to create Razorpay order"

## 🎯 Production Deployment

### Before Going Live:

1. **Razorpay Production Setup:**
   - Complete business verification
   - Get live API keys
   - Update Secrets with live keys
   - Test thoroughly in test mode first

2. **Security:**
   - Change owner password in Shop.tsx
   - Strong SESSION_SECRET
   - Never expose Razorpay Secret Key

3. **Testing:**
   - Complete purchase flow
   - Payment success scenario
   - Payment failure handling
   - Order confirmation emails

## 💡 Tips

- **Use COD**: Agar payment testing me problem hai, COD safe hai
- **Test Mode**: Hamesha test keys se start karo
- **Categories**: Seed script re-run kar sakte ho (duplicate check hai)
- **Logs**: Replit console me errors dekhlo agar kuch kaam nahi kar raha

## 📱 Support

Agar koi problem hai:
1. Check Replit console for errors
2. Verify Secrets are set correctly
3. Run seed-categories again
4. Try COD payment first
5. Check browser console (F12) for frontend errors

---

**Last Updated**: Setup for Replit with PostgreSQL built-in

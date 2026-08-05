# Setup Checklist - Fabric Infinity

Use this checklist to ensure your Fabric Infinity e-commerce platform is properly configured and ready for production.

## ✅ Pre-Installation

- [ ] Node.js v20+ installed
- [ ] pnpm package manager installed (`npm install -g pnpm`)
- [ ] PostgreSQL v16+ installed and running
- [ ] Git installed (for version control)
- [ ] Code editor installed (VS Code recommended)

## ✅ Installation Steps

### 1. Dependencies
```powershell
# Install all project dependencies
pnpm install
```
- [ ] Run `pnpm install` without errors
- [ ] Verify `node_modules` folder created
- [ ] Check `pnpm-lock.yaml` is present

### 2. Database Setup

- [ ] PostgreSQL server is running
- [ ] Database created for the project
- [ ] Database connection string ready

```powershell
# Push database schema
cd lib/db
pnpm run push
cd ../..
```

- [ ] Schema push completed successfully
- [ ] All tables created (products, orders, categories, etc.)
- [ ] Verify tables in database: `\dt` in psql

### 3. Environment Variables

Create or configure environment variables:

#### Required Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Secure random string (use `openssl rand -base64 32`)
- [ ] `PORT` - API server port (default: 5000)

#### Optional Variables
- [ ] `GROQ_API_KEY` - For AI features (get from console.groq.com)
- [ ] `RAZORPAY_KEY_ID` - For payment integration
- [ ] `RAZORPAY_KEY_SECRET` - For payment integration
- [ ] `VITE_WHATSAPP_NUMBER` - Customer support WhatsApp

**Verification:**
```powershell
# Check if environment variables are accessible
# On Windows, use:
echo $env:DATABASE_URL
echo $env:SESSION_SECRET
echo $env:PORT
```

### 4. File System

- [ ] `uploads/` directory exists or will be created automatically
- [ ] Write permissions on `uploads/` directory
- [ ] Sufficient disk space for product images

```powershell
# Create uploads directory
New-Item -ItemType Directory -Force -Path "uploads"
```

## ✅ Running the Application

### Development Mode

**Terminal 1 - API Server:**
```powershell
cd artifacts/api-server
pnpm run dev
```
- [ ] Server starts without errors
- [ ] Listening on specified PORT
- [ ] No database connection errors
- [ ] All routes loaded successfully

**Terminal 2 - Frontend:**
```powershell
cd artifacts/fabric-infinity
pnpm run dev
```
- [ ] Vite dev server starts
- [ ] Opens on http://localhost:5173
- [ ] No compilation errors
- [ ] Hot reload working

### Access Points

- [ ] Frontend accessible at http://localhost:5173
- [ ] API server responding at http://localhost:5000/api/health
- [ ] Admin panel accessible at http://localhost:5173/admin
- [ ] Shop page accessible at http://localhost:5173/shop

## ✅ Functional Testing

### Public Store Features

- [ ] Home page loads correctly
- [ ] Product catalog displays products
- [ ] Product images load
- [ ] Category filtering works
- [ ] Search functionality works
- [ ] Product detail page shows information
- [ ] Add to cart works
- [ ] Cart page displays items
- [ ] Checkout process completes

### Admin Features

- [ ] Admin login page accessible
- [ ] Can log in as admin
- [ ] Dashboard loads with statistics
- [ ] Product list displays
- [ ] Can create new product
- [ ] Image upload works
- [ ] Can edit existing product
- [ ] Can delete product (with confirmation)
- [ ] Order management accessible
- [ ] Category management works
- [ ] Settings page loads

### Owner Mode (New Feature)

- [ ] "Owner Mode" button visible on shop page
- [ ] Clicking enables owner mode (button turns red)
- [ ] Delete buttons appear on product cards
- [ ] Clicking delete shows password dialog
- [ ] Entering correct password deletes product
- [ ] Entering wrong password shows error
- [ ] Can exit owner mode

### Image Management

- [ ] Can upload images in product form
- [ ] Last uploaded image marked as "latest"
- [ ] Images persist after server restart
- [ ] Can remove images (X button works)
- [ ] Images accessible at `/api/uploads/[filename]`
- [ ] Multiple images can be added to one product

### AI Features (if Groq API key configured)

- [ ] "Auto-fill with AI" button visible after image upload
- [ ] Clicking button analyzes image
- [ ] Product fields auto-filled with suggestions
- [ ] Can review and modify AI suggestions
- [ ] Error message if API key not configured

## ✅ Security Configuration

### Passwords & Secrets

- [ ] Changed default owner password from `owner123`
  - File: `artifacts/fabric-infinity/src/pages/Shop.tsx`
  - Line: `const OWNER_PASSWORD = '...'`
  
- [ ] SESSION_SECRET is strong and random (min 32 characters)
- [ ] Admin password is secure
- [ ] Database user has appropriate permissions only
- [ ] No sensitive data in version control (.gitignore configured)

### API Security

- [ ] CORS configured correctly
- [ ] Cookie signing working (SESSION_SECRET set)
- [ ] Admin routes protected by `requireAdmin` middleware
- [ ] File upload limits enforced (5MB max)
- [ ] Only image file types accepted
- [ ] SQL injection protection (using Drizzle ORM)

### Production Readiness

- [ ] HTTPS enabled (if in production)
- [ ] Environment variables secured (not in code)
- [ ] Database backups configured
- [ ] Error logging implemented
- [ ] Rate limiting considered
- [ ] Monitoring tools set up

## ✅ Performance Checks

- [ ] Page load times acceptable (<3 seconds)
- [ ] Images optimized (use WebP format)
- [ ] Database queries efficient
- [ ] Frontend bundle size reasonable
- [ ] API response times fast (<500ms)

## ✅ Browser Compatibility

Test in multiple browsers:
- [ ] Google Chrome
- [ ] Mozilla Firefox
- [ ] Microsoft Edge
- [ ] Safari (Mac/iOS)
- [ ] Mobile browsers (responsive design)

## ✅ Mobile Testing

- [ ] Responsive layout works on phone
- [ ] Touch interactions work properly
- [ ] Images scale appropriately
- [ ] Navigation menu accessible
- [ ] Forms usable on mobile
- [ ] Checkout flow works on mobile

## ✅ Data Verification

### Database Tables

Verify all tables exist:
- [ ] `products` - Product catalog
- [ ] `categories` - Product categories
- [ ] `orders` - Customer orders
- [ ] `customers` - Customer accounts
- [ ] `reviews` - Product reviews
- [ ] `banners` - Homepage banners
- [ ] `coupons` - Discount codes
- [ ] `settings` - App settings

### Sample Data

- [ ] At least one category exists
- [ ] At least one product with images
- [ ] Test customer account created
- [ ] Test order placed successfully

## ✅ Documentation

- [ ] README.md reviewed and understood
- [ ] OWNER_GUIDE.md read (for owner features)
- [ ] Environment variables documented
- [ ] API endpoints documented (if needed)
- [ ] Deployment process documented

## ✅ Backup & Recovery

- [ ] Database backup strategy defined
- [ ] `uploads/` folder backup plan
- [ ] Environment variables backed up securely
- [ ] Recovery procedure tested
- [ ] Rollback plan in place

## 🚨 Common Issues & Solutions

### Issue: pnpm command not found
**Solution:** Install pnpm globally: `npm install -g pnpm`

### Issue: Database connection failed
**Solution:** 
- Check PostgreSQL is running
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Test connection with psql

### Issue: SESSION_SECRET error on startup
**Solution:** Set SESSION_SECRET environment variable before starting server

### Issue: Images not persisting
**Solution:**
- Check `uploads/` folder exists
- Verify write permissions
- Ensure not using in-memory storage

### Issue: Port already in use
**Solution:** 
- Change PORT environment variable
- Or kill process using the port:
  ```powershell
  # Find process on port 5000
  netstat -ano | findstr :5000
  # Kill process (replace PID)
  taskkill /PID <PID> /F
  ```

### Issue: Build fails
**Solution:**
- Clear node_modules: `Remove-Item -Recurse -Force node_modules`
- Clear pnpm cache: `pnpm store prune`
- Reinstall: `pnpm install`

### Issue: Frontend can't reach API
**Solution:**
- Verify API server is running
- Check API URL in frontend config
- Verify CORS settings
- Check browser console for errors

## 📊 Post-Setup Tasks

After completing setup:

1. **Create Admin User**
   - Manual database insert or use seed script
   - Test admin login

2. **Add Initial Products**
   - Create categories first
   - Add sample products with images
   - Test product display on storefront

3. **Configure Payment Gateway**
   - Add Razorpay keys (if using payments)
   - Test payment flow in test mode

4. **Customize Branding**
   - Update logo and favicon
   - Adjust colors in Tailwind config
   - Add business information

5. **Configure Email** (if needed)
   - Set up SMTP or email service
   - Test order confirmation emails

6. **Set Up Analytics** (optional)
   - Google Analytics
   - Custom event tracking
   - Conversion tracking

## ✅ Final Verification

- [ ] All critical features working
- [ ] No console errors
- [ ] No API errors
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Documentation complete
- [ ] Team members trained
- [ ] Backup systems active
- [ ] Monitoring in place
- [ ] **READY FOR PRODUCTION** 🚀

## 📞 Need Help?

If you encounter issues not covered in this checklist:
- Review README.md troubleshooting section
- Check browser console (F12) for errors
- Review API server logs
- Contact support: WhatsApp +91 8530361444

---

**Checklist Version:** 1.0  
**Last Updated:** August 2026

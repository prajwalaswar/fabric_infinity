# Owner Guide - Fabric Infinity

## 🔐 Owner Mode Features

As the store owner, you have special privileges to manage products directly from the main website without going to the admin panel.

### Accessing Owner Mode

1. Navigate to the Shop page (`/shop`)
2. Click the **"Owner Mode"** button in the top-right corner of the page header
3. The button will turn red to indicate Owner Mode is active
4. All product cards will now show a **red delete button** (trash icon) in the top-right corner

### Deleting Products from Main Website

When in Owner Mode:

1. Click the **red trash icon** on any product card
2. A password dialog will appear
3. Enter the owner password (default: `owner123`)
4. Press Enter or click "Delete Product"
5. The product will be permanently deleted from the database

**⚠️ IMPORTANT SECURITY NOTES:**

- The default password is `owner123` - **CHANGE THIS IMMEDIATELY**
- To change the password, edit the file: `artifacts/fabric-infinity/src/pages/Shop.tsx`
- Look for the line: `const OWNER_PASSWORD = 'owner123';`
- Replace `'owner123'` with your secure password
- Use a strong password with letters, numbers, and symbols

### Image Management

#### Uploading Images (Admin Dashboard)

1. Go to Admin Dashboard → Products
2. Create or Edit a product
3. In the "Product Images" section, click the **Upload** button
4. Select an image file (max 5MB, images only)
5. The image will be uploaded and saved permanently to the `/uploads` folder
6. The last uploaded image will be highlighted with a **"latest"** tag
7. You can use the **"Auto-fill with AI"** button to analyze the image with Groq

#### Removing Images

1. Hover over any uploaded image in the product form
2. Click the **X button** that appears in the top-right corner of the image
3. The image will be removed from the product (but the file remains on server)

#### Image Persistence

- All uploaded images are stored in the `uploads/` directory at the project root
- Images are served via the `/api/uploads/` endpoint
- Images persist permanently even after server restart
- Backup the `uploads/` folder regularly to prevent data loss

### AI-Powered Product Analysis

The platform includes Groq AI integration for automatic product detail generation:

1. Upload a fabric image in the product form
2. Click the **"Auto-fill with AI"** button (with sparkle icon)
3. The AI will analyze the image and automatically fill in:
   - Product name
   - Description
   - Fabric details
   - Suggested price
   - Suggested offer price
   - Category match (if applicable)
4. Review the AI-generated content and adjust as needed
5. Save the product

**Requirements:**
- Add your free Groq API key in Admin → Settings → AI Integration
- Get free API key from: https://console.groq.com

## 🛡️ Security Best Practices

### 1. Change Default Passwords

**Owner Password (for Shop page delete):**
```typescript
// File: artifacts/fabric-infinity/src/pages/Shop.tsx
const OWNER_PASSWORD = 'your-secure-password-here'; // Line ~35
```

**Admin Password:**
- Managed through your authentication system
- Check your database or admin auth configuration

### 2. Production Security Checklist

- [ ] Change owner password from default `owner123`
- [ ] Set strong `SESSION_SECRET` environment variable
- [ ] Enable HTTPS in production
- [ ] Set up proper admin authentication
- [ ] Regular database backups
- [ ] Implement rate limiting on delete endpoints
- [ ] Add audit logging for deletions
- [ ] Consider IP whitelisting for admin routes

### 3. Recommended Password Security

For Owner Password, use:
- Minimum 12 characters
- Mix of uppercase and lowercase letters
- Include numbers and special characters
- Avoid common words or patterns
- Example: `Fb!c2024$SecureOwn3r`

### 4. Better Owner Authentication (Future Enhancement)

The current password check is client-side only. For production, consider:

1. **Backend Verification:**
   - Move password check to API server
   - Hash passwords with bcrypt
   - Create `/api/owner/verify` endpoint

2. **Session-Based Owner Auth:**
   - Add owner login page
   - Issue secure cookies
   - Verify on each delete request

3. **Two-Factor Authentication:**
   - Add OTP via email/SMS
   - Use authenticator apps
   - Require confirmation for sensitive actions

## 📊 Product Management Workflow

### Complete Product Lifecycle

1. **Create Product** (Admin Dashboard)
   - Go to Products → Add Product
   - Upload images
   - Fill basic info (or use AI auto-fill)
   - Set price, stock, category
   - Enable/disable visibility flags
   - Save

2. **Edit Product** (Admin Dashboard)
   - Click Edit on any product
   - Modify details
   - Add/remove images
   - Update inventory
   - Save changes

3. **Quick Delete** (Main Website - Owner Mode)
   - Enable Owner Mode on Shop page
   - Click delete button on product card
   - Enter password
   - Confirm deletion

4. **Bulk Management** (Admin Dashboard)
   - View all products in table format
   - Search and filter
   - Edit or delete multiple items
   - Track inventory levels

## 🎯 Best Practices

### Image Management
- Use high-quality product images (recommended: 1000x1000px minimum)
- Optimize images before upload (use tools like TinyPNG)
- Keep image file sizes under 500KB for faster loading
- Use consistent backgrounds for professional look
- Take photos from multiple angles

### Product Information
- Write clear, descriptive product names
- Include detailed fabric specifications
- Mention care instructions
- Add size/dimension information
- Use AI analysis as a starting point, then refine

### Inventory
- Keep stock levels accurate
- Mark products as "Out of Stock" when needed
- Use "New Arrival" badge for latest products
- Highlight "Bestsellers" to drive sales

### Pricing
- Set competitive prices based on market research
- Use offer prices strategically for promotions
- Show clear savings percentages
- Update prices seasonally

## 🚨 Troubleshooting

### Owner Mode Not Working
- Clear browser cookies
- Check if you're on the correct page (`/shop`)
- Verify Owner Mode button is clicked (should be red)

### Images Not Uploading
- Check file size (max 5MB)
- Ensure file is an image format (jpg, png, webp)
- Verify uploads folder has write permissions
- Check browser console for error messages

### Delete Not Working
- Verify correct password entered
- Check browser network tab for API errors
- Ensure you're logged in as admin
- Check API server is running

### AI Analysis Failing
- Verify Groq API key is set in Settings
- Check internet connection
- Ensure image URL is accessible
- Try uploading a different image

## 📞 Support

For technical issues or questions:
- WhatsApp: +91 8530361444
- Check logs in browser console (F12)
- Review API server logs
- Refer to README.md for setup issues

---

**Last Updated:** August 2026

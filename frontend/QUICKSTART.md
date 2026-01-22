# Vendex Frontend - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Spring Boot backend running on port 8080
- [ ] Python FastAPI backend running on port 8000
- [ ] CORS enabled on both backends

## 🎯 Test Accounts

Create test accounts via the registration page:
- **Consumer**: Role = CONSUMER
- **Store Owner**: Role = STORE_OWNER  
- **Manufacturer**: Role = MANUFACTURER

## 🔑 Key Features to Test

### Consumer Dashboard
1. Search products
2. Use Intent Builder: "monthly grocery for family of 4"
3. Add items to cart
4. Checkout

### Store Owner Dashboard
1. View inventory with real-time updates
2. Check demand forecast (if sales data available)
3. Request supply → Get manufacturer recommendations
4. Manage staff
5. View analytics

### Manufacturer Dashboard
1. View incoming orders
2. Accept/reject orders
3. Download receipts
4. Chat with store owners

## 🐛 Common Issues

### "Cannot connect to server"
- Check if Spring Boot backend is running
- Verify API URL in `.env.local`
- Check CORS settings

### "Unauthorized" errors
- Clear browser cookies/localStorage
- Re-login
- Check JWT token expiration

### Build errors
- Delete `.next` folder
- Run `npm install` again
- Check Node.js version (18+)

## 📁 Key Files

- `src/lib/api.ts` - All API endpoints
- `src/store/authStore.ts` - Authentication state
- `src/components/` - Reusable components
- `src/app/` - Next.js pages (App Router)

## 🎨 Customization

- **Colors**: Edit `tailwind.config.ts`
- **API URLs**: Update `.env.local`
- **Components**: Modify files in `src/components/`

## 📞 Support

For issues, check:
1. Backend logs
2. Browser console
3. Network tab in DevTools

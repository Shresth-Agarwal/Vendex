# Vendex Frontend - Next.js Application

A modern, production-ready Next.js frontend for the Vendex B2B platform that connects consumers, store owners, and manufacturers.

## Features

### 🛒 Consumer Dashboard
- **Product Search** with real-time availability
- **Intent Builder** - AI-powered product recommendations based on natural language input
- Shopping cart and checkout functionality
- Real-time stock updates

### 🏪 Store Owner Dashboard
- **Real-time Inventory Management** with auto-refresh
- **Demand Forecast** - AI-powered predictions for optimal reorder quantities
- **Request Supply Flow** - Get manufacturer recommendations and select suppliers
- **Staff Management** - Create, edit, and manage staff accounts with role assignments
- **Shift Management** - Assign shifts with date and time
- **Receipt Generation** - Download and email PDF receipts
- **Analytics Dashboard** - Power BI integration for sales trends and stock movement

### 🏭 Manufacturer Dashboard
- View incoming purchase requests
- Accept or reject orders
- Download receipts
- Encrypted messaging with store owners

### 💬 Communication
- **Encrypted Chat** - End-to-end encrypted messaging between store owners and manufacturers
- WhatsApp/Slack-like UI
- Real-time message polling

### 📊 Analytics & Reports
- Power BI dashboard embedding
- Sales trends visualization
- Stock movement tracking
- Demand forecast charts

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Forms**: React Hook Form + Zod
- **Encryption**: CryptoJS

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend Spring Boot server running on `http://localhost:8080`
- Python FastAPI server running on `http://localhost:8000` (for AI/ML features)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
NEXT_PUBLIC_POWER_BI_URL=your_power_bi_embed_url_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── consumer/          # Consumer dashboard pages
│   │   ├── store-owner/       # Store owner dashboard pages
│   │   ├── manufacturer/      # Manufacturer dashboard pages
│   │   ├── staff/             # Staff dashboard pages
│   │   ├── login/              # Authentication pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page (redirects based on role)
│   │   └── globals.css         # Global styles
│   ├── components/              # Reusable components
│   │   ├── ProductCard.tsx
│   │   ├── ManufacturerCard.tsx
│   │   ├── InventoryTable.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ReceiptModal.tsx
│   │   ├── SearchAutocomplete.tsx
│   │   └── Layout.tsx
│   ├── lib/                    # Utilities and API
│   │   └── api.ts              # API service layer
│   ├── store/                  # State management
│   │   └── authStore.ts        # Authentication store
│   └── utils/                  # Helper functions
│       ├── encryption.ts       # Message encryption/decryption
│       └── imageUtils.ts       # Image URL utilities
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Integration

The frontend connects to two backend services:

### Spring Boot Backend (Port 8080)
- Authentication (`/auth/login`, `/auth/register`)
- Products (`/demo/products`)
- Inventory (`/demo/stock`)
- Orders (`/demo/sales`)
- Purchase Orders (`/demo/manager/purchase-orders`)
- Manufacturers (`/demo/manufacturers`)
- Staff Management (`/demo/staff`, `/demo/shifts`)
- Chat (`/demo/chat`)

### Python FastAPI Backend (Port 8000)
- Intent Processing (`/api/process-intent`)
- Demand Forecast (`/api/forecast`)
- Inventory Decisions (`/api/decision`)
- Manufacturer Recommendation (`/api/sourcing/recommend`)
- Receipt Generation (`/api/generate-receipt`)
- Staff Assignment (`/api/assign-staff`)

## Authentication & Authorization

- JWT-based authentication
- Role-based routing (CONSUMER, STORE_OWNER, MANUFACTURER, STAFF, ADMIN)
- Automatic token refresh and logout on expiration
- Protected routes based on user role

## Smart Features

1. **Autocomplete Search** - Smart product search with suggestions
2. **Visual Badges** - Status indicators for stock levels, best manufacturers, etc.
3. **Real-time Updates** - Auto-refresh inventory and messages using polling
4. **Intent Builder** - AI-powered natural language to product list conversion
5. **Demand Forecasting** - ML-powered inventory optimization

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Spring Boot backend URL | `http://localhost:8080` |
| `NEXT_PUBLIC_PYTHON_API_URL` | Python FastAPI backend URL | `http://localhost:8000` |
| `NEXT_PUBLIC_POWER_BI_URL` | Power BI embed URL | (optional) |

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Key Components

### ProductCard
Displays product information with stock status, images, and add-to-cart functionality.

### ManufacturerCard
Shows manufacturer details with ratings, distance, pricing, and selection capability.

### InventoryTable
Comprehensive inventory management table with inline editing, forecast data, and status badges.

### ChatWindow
Encrypted messaging interface with real-time updates and message history.

### ReceiptModal
PDF receipt generation and email functionality.

## Notes

- The frontend assumes CORS is enabled on both backend servers
- JWT tokens are stored in cookies and localStorage for persistence
- Real-time updates use polling (can be upgraded to WebSockets)
- Encryption keys for chat are derived from user IDs (should be improved in production)
- Power BI embedding requires proper authentication setup

## Troubleshooting

### Backend Connection Issues
- Ensure both Spring Boot and Python FastAPI servers are running
- Check CORS configuration on backend servers
- Verify API URLs in `.env.local`

### Authentication Issues
- Clear browser cookies and localStorage
- Check JWT token expiration
- Verify backend authentication endpoints

### Build Issues
- Clear `.next` directory and rebuild
- Check Node.js version (requires 18+)
- Verify all dependencies are installed

## License

This project is part of the Vendex platform.

# Vendex E-commerce Frontend

A modern React.js frontend for the Vendex e-commerce platform with customer shopping interface and vendor dashboard.

## Features

### Customer Shop
- Browse products with search functionality
- Add items to shopping cart
- View and manage cart items
- Real-time stock availability
- Checkout functionality

### Vendor Dashboard
- View all inventory stock
- Real-time inventory statistics
- Edit stock quantities
- Stock status indicators (In Stock, Low Stock, Out of Stock)
- Product information display

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend Spring Boot server running on `http://localhost:8080`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## Configuration

The API base URL is configured in `src/services/api.js`. By default, it points to:
```
http://localhost:8080
```

If your backend runs on a different port or URL, update the `API_BASE_URL` constant in `src/services/api.js`.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CustomerShop.js       # Customer shopping interface
│   │   ├── CustomerShop.css
│   │   ├── VendorDashboard.js    # Vendor inventory dashboard
│   │   └── VendorDashboard.css
│   ├── services/
│   │   └── api.js                # API service layer
│   ├── App.js                     # Main app component with routing
│   ├── App.css
│   ├── index.js                   # Entry point
│   └── index.css
├── package.json
└── README.md
```

## API Endpoints Used

### Products
- `GET /demo/products` - Get all products
- `GET /demo/products/{sku}` - Get product by SKU

### Stock
- `GET /demo/stock` - Get all stock items
- `GET /demo/stock/{sku}` - Get stock by SKU
- `PUT /demo/stock/{sku}` - Update stock quantity

### Sales
- `POST /demo/sales` - Create a sale/order

## Usage

### Customer Shopping
1. Navigate to the Customer Shop page
2. Browse products or use the search bar
3. Click "Add to Cart" on desired products
4. Click the Cart button to view your cart
5. Adjust quantities or remove items
6. Click "Checkout" to place your order

### Vendor Dashboard
1. Navigate to the Vendor Dashboard page
2. View inventory statistics at the top
3. Browse the inventory table
4. Click the edit icon to update stock quantities
5. Enter new quantity and click save
6. Use the refresh button to reload inventory data

## Technologies Used

- React 18.2.0
- React Router DOM 6.20.0
- Axios 1.6.2
- React Icons 4.12.0

## Notes

- The frontend assumes the backend is running and accessible
- CORS must be enabled on the backend to allow requests from `http://localhost:3000`
- Stock updates are reflected immediately after checkout
- The vendor dashboard shows real-time inventory status

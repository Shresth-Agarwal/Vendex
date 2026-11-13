import { FiBarChart2, FiBox, FiPackage, FiSearch, FiShoppingBag, FiUsers } from 'react-icons/fi';

type Tone = 'blue' | 'teal' | 'slate' | 'red';

export const marketingNav = [
  { label: 'Marketplace', to: '/consumer' },
  { label: 'Command Center', to: '/store-owner' },
  { label: 'Pipeline', to: '/manufacturer' },
  { label: 'Resources', to: '/ecosystem-hub' },
];

export const roleCards = [
  {
    title: 'For Consumers',
    description: 'Browse products, compare options, and create clean checkout flows from one unified marketplace.',
    accent: 'blue',
    to: '/consumer',
  },
  {
    title: 'For Store Owners',
    description: 'Track inventory, manage staff, and keep replenishment decisions visible across the team.',
    accent: 'teal',
    to: '/store-owner',
  },
  {
    title: 'For Manufacturers',
    description: 'Surface catalogues, review orders, and keep every supply-chain handoff auditable.',
    accent: 'slate',
    to: '/manufacturer',
  },
  {
    title: 'For Administrators',
    description: 'Monitor platform health, workflows, and permissions without losing the full picture.',
    accent: 'red',
    to: '/store-owner/discovery',
  },
];

export const flowSteps = [
  { title: 'Discover', description: 'Search the network, compare manufacturers, and surface live product data.' },
  { title: 'Coordinate', description: 'Move from request to quote with structured handoffs and shared status.' },
  { title: 'Fulfill', description: 'Keep operational updates visible to every participant in the loop.' },
];

export const ecosystemNodes = [
  { label: 'Consumers', icon: FiShoppingBag, active: true },
  { label: 'Store Owners', icon: FiUsers },
  { label: 'Manufacturers', icon: FiPackage },
];

export const consumerProducts = [
  {
    name: 'Whole Grain Bread',
    category: 'Bakery',
    price: 6.99,
    image: '/product/men/2211.jpg',
    stock: 'In Stock',
  },
  {
    name: 'Organic Coffee Beans',
    category: 'Beverages',
    price: 18.5,
    image: '/product/men/2220.jpg',
    stock: 'Low Stock',
  },
  {
    name: 'Kitchen Cleaning Kit',
    category: 'Household',
    price: 14.25,
    image: '/product/women/2611.jpg',
    stock: 'In Stock',
  },
  {
    name: 'Protein Snack Pack',
    category: 'Snacks',
    price: 11.0,
    image: '/product/men/2963.jpg',
    stock: 'In Stock',
  },
  {
    name: 'Fresh Pasta Bundle',
    category: 'Pantry',
    price: 9.75,
    image: '/product/women/2627.jpg',
    stock: 'Low Stock',
  },
  {
    name: 'Tea Sampler',
    category: 'Beverages',
    price: 8.5,
    image: '/product/women/2697.jpg',
    stock: 'In Stock',
  },
];

export const consumerQuickFilters = ['Bulk Office Supplies', 'Industrial Cleaning Kit', 'Fresh Produce', 'Daily Pantry'];

export const storeOwnerMetrics = [
  { label: 'Stock Health', value: '94%', detail: 'Optimal across 8 locations', icon: FiBarChart2, tone: 'teal' },
  { label: 'Pending Deliveries', value: '12', detail: 'Expected within 48h', icon: FiPackage, tone: 'slate' },
  { label: 'Critical Alerts', value: '2', detail: 'Low stock items', icon: FiBox, tone: 'red' },
];

export const inventoryRows = [
  { product: 'Artisan Sourdough Mix', sku: 'VNDX-SDM-01', stock: 450, status: 'In Stock', action: 'Approve' },
  { product: 'Premium Espresso Beans', sku: 'VNDX-ESB-04', stock: 12, status: 'Low Stock', action: 'Restock' },
  { product: 'Glass Storage Jars', sku: 'VNDX-GSJ-12', stock: 88, status: 'Reorder Soon', action: 'Review' },
];

export const manufacturerCards: Array<{
  name: string;
  location: string;
  rating: number;
  quote: string;
  tone: Tone;
}> = [
  { name: 'Apex Components Ltd.', location: 'Chicago, IL', rating: 4.9, quote: '24-hour quote response', tone: 'teal' },
  { name: 'Nexus Electronics', location: 'Austin, TX', rating: 4.8, quote: 'Preferred payment terms', tone: 'slate' },
  { name: 'Orion Mfg Partners', location: 'Denver, CO', rating: 4.7, quote: 'Fast catalog sync', tone: 'blue' },
  { name: 'Vanguard Tech Hub', location: 'Seattle, WA', rating: 4.6, quote: 'Bulk order ready', tone: 'red' },
];

export const pipelineColumns = [
  {
    title: 'Draft',
    cards: ['Create order request', 'Add vendor notes', 'Share expected pricing'],
  },
  {
    title: 'Sent',
    cards: ['Quote sent to vendors', 'Follow-up due tomorrow', 'Awaiting confirmation'],
  },
  {
    title: 'Approved',
    cards: ['Final terms locked', 'Logistics scheduled', 'Payment staged'],
  },
];

export const manufacturerDiscoveryFilters = [
  'Electronics',
  'Industrial Supplies',
  'Food & Beverage',
  'Packaging',
  'Logistics',
];

export const commandCenterActions = [
  'Manual Control Panel',
  'Help Center',
  'Log Out',
];

export const dashboardLinks = [
  { label: 'Overview', icon: FiBarChart2, to: '/store-owner' },
  { label: 'Inventory', icon: FiPackage, to: '/store-owner' },
  { label: 'Discover', icon: FiSearch, to: '/store-owner/discovery' },
  { label: 'Manufacturer', icon: FiPackage, to: '/manufacturer' },
];

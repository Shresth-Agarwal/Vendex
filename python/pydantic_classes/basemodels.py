from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class SalesHistory(BaseModel):
    sales_history: List[float]

class ForecastResponse(BaseModel):
    forecast: int
    confidence: float

class DecisionPayload(BaseModel):
    forecast: int
    confidence: float
    current_stock: int
    unit_cost: float

class ForecastAndDecideRequest(SalesHistory):
    current_stock: int
    unit_cost: float
    
class ChatRequest(BaseModel):
    user_input: str
    stock_list: List[Dict[str, Any]]

class StaffAvailability(BaseModel):
    date: str
    shifts: List[Dict[str, Any]]
    staff: List[Dict[str, Any]]

class POMetadata(BaseModel):
    purchaseOrderId: int
    createdAt: str
    approvedAt: str

class ManufacturerInfo(BaseModel):
    name: str
    emailId: str
    paymentMode: str
    advanceRequired: bool

class ItemInfo(BaseModel):
    sku: str
    quantity: int
    unitCost: float

class ReceiptTotals(BaseModel):
    subtotal: float
    tax: float
    grandTotal: float

class ReceiptRequest(BaseModel):
    purchaseOrder: POMetadata
    manufacturer: ManufacturerInfo
    items: List[ItemInfo]
    totals: ReceiptTotals

class  ManufacturerProduct(BaseModel):
    sku: str
    costPrice: float
    minimumOrderQuantity: int

class ManufacturerDetail(BaseModel):
    manufacturerId: int
    distanceKm: float
    averageRating: float
    advanceRequired: bool
    preferredPaymentMode: str
    products: List[ManufacturerProduct]

class SourcingItem(BaseModel):
    sku: str
    quantity: int

class SourcingContext(BaseModel):
    purchaseOrderId: int
    preferredPaymentMode: str
    confidence: float
    createdAt: str

class SourcingRequest(BaseModel):
    context: SourcingContext
    items: List[SourcingItem]
    manufacturers: List[ManufacturerDetail]
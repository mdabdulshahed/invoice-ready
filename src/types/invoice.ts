export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "INR"
  | "LKR"
  | "BDT"
  | "SGD"
  | "AUD"
  | "AED"
  | "SAR"
  | "QAR"
  | "CAD"
  | "IDR";

export type TemplateId = "classic" | "modern" | "minimal";

export interface BusinessInfo {
  name: string;
  logoDataUrl: string | null;
  address: string;
  email: string;
  phone: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  email: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceState {
  business: BusinessInfo;
  client: ClientInfo;
  invoiceNumber: number;
  issueDate: string; // ISO date
  dueDate: string; // ISO date
  currency: Currency;
  lineItems: LineItem[];
  taxPercent: number;
  discountPercent: number;
  paymentDetails: string;
  notes: string;
  template: TemplateId;
}

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface PersistedBusinessInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

import type { Currency, InvoiceState, InvoiceTotals, LineItem } from "@/types/invoice";
import { DEFAULT_INVOICE_NUMBER } from "@/lib/storage";

const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  INR: "en-IN",
  LKR: "en-LK",
  BDT: "en-BD",
  SGD: "en-SG",
  AUD: "en-AU",
  AED: "en-AE",
  SAR: "en-SA",
  QAR: "en-QA",
  CAD: "en-CA",
  IDR: "id-ID",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

// Resolved decision: DD MMM YYYY, e.g. "12 Sep 2026" — professional, locale-agnostic.
export function formatDateDisplay(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "—";
  return `${pad2(d)} ${MONTHS[m - 1]} ${y}`;
}

export function formatMoney(value: number, currency: Currency): string {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
      style: "currency",
      currency,
    }).format(value || 0);
  } catch {
    return `${(value || 0).toFixed(2)} ${currency}`;
  }
}

export function createLineItem(): LineItem {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `li_${Math.random().toString(36).slice(2, 9)}`,
    description: "",
    quantity: 1,
    rate: 0,
  };
}

export function lineItemAmount(item: LineItem): number {
  return (Number(item.quantity) || 0) * (Number(item.rate) || 0);
}

export function computeTotals(state: InvoiceState): InvoiceTotals {
  const subtotal = state.lineItems.reduce((sum, li) => sum + lineItemAmount(li), 0);
  const taxAmount = (subtotal * (Number(state.taxPercent) || 0)) / 100;
  const discountAmount = (subtotal * (Number(state.discountPercent) || 0)) / 100;
  const total = subtotal + taxAmount - discountAmount;
  return { subtotal, taxAmount, discountAmount, total };
}

export interface InvoiceValidity {
  hasClientName: boolean;
  hasBillableLineItem: boolean;
  ok: boolean;
}

export function validateInvoice(state: InvoiceState): InvoiceValidity {
  const hasClientName = state.client.name.trim().length > 0;
  const hasBillableLineItem = state.lineItems.some(
    (li) => li.description.trim().length > 0 && lineItemAmount(li) > 0
  );
  return { hasClientName, hasBillableLineItem, ok: hasClientName && hasBillableLineItem };
}

export function sanitizeFilenamePart(str: string): string {
  return (
    String(str || "client")
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "") || "client"
  );
}

export function createInitialInvoiceState(): InvoiceState {
  return {
    business: { name: "", logoDataUrl: null, address: "", email: "", phone: "" },
    client: { name: "", address: "", email: "" },
    invoiceNumber: DEFAULT_INVOICE_NUMBER,
    issueDate: todayIso(),
    dueDate: addDaysIso(todayIso(), 15),
    currency: "USD",
    lineItems: [createLineItem()],
    taxPercent: 0,
    discountPercent: 0,
    paymentDetails: "",
    notes: "",
    template: "classic",
  };
}

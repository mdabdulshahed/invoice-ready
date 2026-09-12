import type { PersistedBusinessInfo } from "@/types/invoice";

const LAST_NUMBER_KEY = "invoiceready_last_number";
const BUSINESS_INFO_KEY = "invoiceready_business_info";

export const DEFAULT_INVOICE_NUMBER = 1001;

export function getLastInvoiceNumber(): number | null {
  try {
    const raw = window.localStorage.getItem(LAST_NUMBER_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

export function setLastInvoiceNumber(n: number): void {
  try {
    window.localStorage.setItem(LAST_NUMBER_KEY, String(n));
  } catch {
    // storage unavailable (private mode, disabled cookies, etc.) — non-fatal
  }
}

export function getBusinessInfo(): PersistedBusinessInfo | null {
  try {
    const raw = window.localStorage.getItem(BUSINESS_INFO_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedBusinessInfo;
  } catch {
    return null;
  }
}

export function setBusinessInfo(info: PersistedBusinessInfo): void {
  try {
    window.localStorage.setItem(BUSINESS_INFO_KEY, JSON.stringify(info));
  } catch {
    // storage unavailable — non-fatal
  }
}

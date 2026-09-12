"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import type { Currency, InvoiceState } from "@/types/invoice";
import { computeTotals, createInitialInvoiceState, validateInvoice } from "@/lib/invoice";
import { getBusinessInfo, getLastInvoiceNumber, setBusinessInfo, setLastInvoiceNumber } from "@/lib/storage";
import { downloadInvoicePdf } from "@/lib/pdf/generateInvoicePdf";
import { FAQ_ITEMS } from "@/lib/site";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import TemplateSelector from "@/components/TemplateSelector";

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: "USD", label: "$ USD — US Dollar" },
  { code: "EUR", label: "€ EUR — Euro" },
  { code: "GBP", label: "£ GBP — British Pound" },
  { code: "INR", label: "₹ INR — Indian Rupee" },
  { code: "LKR", label: "Rs LKR — Sri Lankan Rupee" },
  { code: "BDT", label: "৳ BDT — Bangladeshi Taka" },
  { code: "SGD", label: "$ SGD — Singapore Dollar" },
  { code: "AUD", label: "$ AUD — Australian Dollar" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
  { code: "QAR", label: "QAR — Qatari Riyal" },
  { code: "CAD", label: "$ CAD — Canadian Dollar" },
  { code: "IDR", label: "Rp IDR — Indonesian Rupiah" },
];

export default function Home() {
  const [invoice, setInvoiceState] = useState<InvoiceState>(createInitialInvoiceState);
  const [clientNameError, setClientNameError] = useState(false);
  const [lineItemsError, setLineItemsError] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("preview");
  const clientNameInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill next invoice number + last-used business info from localStorage (client-only).
  useEffect(() => {
    const lastNumber = getLastInvoiceNumber();
    const businessInfo = getBusinessInfo();
    if (lastNumber === null && !businessInfo) return;
    // Deliberately deferred to an effect: localStorage is unavailable during SSR, so the
    // first client render must match the server's default state before this hydrates it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInvoiceState((prev) => ({
      ...prev,
      invoiceNumber: lastNumber !== null ? lastNumber + 1 : prev.invoiceNumber,
      business: businessInfo
        ? { ...prev.business, ...businessInfo, logoDataUrl: null }
        : prev.business,
    }));
  }, []);

  function setInvoice(updater: (prev: InvoiceState) => InvoiceState) {
    setInvoiceState(updater);
  }

  const totals = computeTotals(invoice);
  const validity = validateInvoice(invoice);

  async function handleDownload() {
    setDownloadError(null);
    if (!validity.ok) {
      if (!validity.hasClientName) {
        setClientNameError(true);
        setMobileTab("edit");
        clientNameInputRef.current?.focus();
      }
      if (!validity.hasBillableLineItem) {
        setLineItemsError(true);
        setMobileTab("edit");
      }
      return;
    }

    setIsDownloading(true);
    try {
      await downloadInvoicePdf(invoice);
    } catch {
      setDownloadError("Could not generate the PDF — please try again.");
      setIsDownloading(false);
      return;
    }
    setIsDownloading(false);

    // Local persistence and analytics are independent — one failing must not block the other.
    try {
      setLastInvoiceNumber(invoice.invoiceNumber);
      setBusinessInfo({
        name: invoice.business.name,
        address: invoice.business.address,
        email: invoice.business.email,
        phone: invoice.business.phone,
      });
    } catch {
      // non-fatal
    }
    try {
      track("pdf_generated");
    } catch {
      // non-fatal
    }
  }

  function handleNewInvoice() {
    setInvoiceState((prev) => ({
      ...prev,
      client: { name: "", address: "", email: "" },
      invoiceNumber: (Number(prev.invoiceNumber) || 1000) + 1,
      issueDate: new Date().toISOString().slice(0, 10),
      lineItems: prev.lineItems.slice(0, 1).map((li) => ({ ...li, description: "", quantity: 1, rate: 0 })),
      taxPercent: 0,
      discountPercent: 0,
      notes: "",
    }));
    setClientNameError(false);
    setLineItemsError(false);
  }

  function handleClearAll() {
    setInvoiceState((prev) => ({ ...createInitialInvoiceState(), currency: prev.currency, template: prev.template }));
    setClientNameError(false);
    setLineItemsError(false);
  }

  return (
    <div data-mobile-tab={mobileTab} className="min-h-screen px-4 py-6 sm:px-6 md:py-9">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b border-(--desk-line) pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-(--accent) font-serif text-[15px] font-bold text-white">
                $
              </span>
              <h1 className="font-serif text-[26px] font-semibold tracking-tight">InvoiceReady</h1>
            </div>
            <p className="max-w-[46ch] text-[13.5px] text-(--ink-soft)">
              Professional invoices, no signup or business registration required. Everything runs in this
              browser — nothing you type is sent anywhere.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Currency"
              value={invoice.currency}
              onChange={(e) => setInvoice((prev) => ({ ...prev, currency: e.target.value as Currency }))}
              className="rounded-lg border border-(--panel-border) bg-(--panel) px-3 py-2 text-[13.5px]"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleNewInvoice}
              title="Keep your business details, clear client & line items"
              className="rounded-lg border border-(--panel-border) bg-(--panel) px-3 py-2 text-[13.5px] hover:border-(--accent) hover:text-(--accent-strong)"
            >
              New invoice
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-lg border border-(--panel-border) bg-(--panel) px-3 py-2 text-[13.5px] hover:border-(--accent) hover:text-(--accent-strong)"
            >
              Clear all fields
            </button>
          </div>
        </header>

        <div className="flex gap-2 md:hidden">
          <button
            type="button"
            aria-pressed={mobileTab === "edit"}
            onClick={() => setMobileTab("edit")}
            className={`flex-1 rounded-lg border border-(--panel-border) py-2 text-[13px] font-semibold ${
              mobileTab === "edit" ? "bg-(--accent) text-white" : "bg-(--panel) text-(--ink-soft)"
            }`}
          >
            Edit invoice
          </button>
          <button
            type="button"
            aria-pressed={mobileTab === "preview"}
            onClick={() => setMobileTab("preview")}
            className={`flex-1 rounded-lg border border-(--panel-border) py-2 text-[13px] font-semibold ${
              mobileTab === "preview" ? "bg-(--accent) text-white" : "bg-(--panel) text-(--ink-soft)"
            }`}
          >
            Preview
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className={mobileTab === "preview" ? "hidden md:block" : ""}>
            <InvoiceForm
              invoice={invoice}
              setInvoice={setInvoice}
              clientNameError={clientNameError}
              lineItemsError={lineItemsError}
              onClearClientNameError={() => setClientNameError(false)}
              onClearLineItemsError={() => setLineItemsError(false)}
              clientNameInputRef={clientNameInputRef}
            />
          </div>

          <div className={`flex flex-col gap-3 md:sticky md:top-4 ${mobileTab === "edit" ? "hidden md:flex" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <TemplateSelector
                value={invoice.template}
                onChange={(template) => setInvoice((prev) => ({ ...prev, template }))}
              />
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-4.5 py-2.5 text-[13.5px] font-semibold text-white shadow-(--shadow) hover:bg-(--accent-strong) disabled:opacity-55"
                >
                  {isDownloading ? "Generating…" : "⤓ Download PDF"}
                </button>
                {!validity.ok && (
                  <span className="text-right text-xs text-(--stamp)">
                    {!validity.hasClientName
                      ? "Add a client name to enable the download."
                      : "Add at least one line item to enable the download."}
                  </span>
                )}
                {downloadError && <span className="text-right text-xs text-(--stamp)">{downloadError}</span>}
              </div>
            </div>
            <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-3 shadow-(--shadow) sm:p-5">
              <InvoicePreview invoice={invoice} totals={totals} />
            </div>
          </div>
        </div>

        <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 border-t border-(--desk-line) pt-10">
          <div>
            <h2 className="font-serif text-2xl font-semibold">How InvoiceReady works</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Fill in your details",
                  body: "Add your business info, your client's name, and at least one line item. Everything else — tax, discount, payment details, notes — is optional.",
                },
                {
                  step: "2",
                  title: "Preview instantly",
                  body: "Watch the invoice update live as you type, and switch between the Classic, Modern, and Minimal templates to find the look you want.",
                },
                {
                  step: "3",
                  title: "Download the PDF",
                  body: "Click Download PDF to get a ready-to-send invoice file — generated entirely in your browser, with nothing uploaded to a server.",
                },
              ].map((s) => (
                <div key={s.step} className="rounded-xl border border-(--panel-border) bg-(--panel) p-5">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-(--accent-tint) font-mono text-[13px] font-semibold text-(--accent-strong)">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-(--ink)">{s.title}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-(--ink-soft)">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold">
              A free invoice generator for freelancers and unregistered businesses
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-(--ink-soft)">
              InvoiceReady is built for freelancers, consultants, and small businesses who need to send an
              occasional professional invoice without paying for accounting software or registering a
              business. There&apos;s no account to create and no business or tax ID required — just fill in
              the form and download a PDF. All 13 supported currencies (USD, EUR, GBP, INR, LKR, BDT, SGD,
              AUD, AED, SAR, QAR, CAD, IDR) and all invoice generation happen entirely in your browser, so
              your invoice data is never sent to or stored on a server.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold">Frequently asked questions</h2>
            <div className="mt-5 flex flex-col gap-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-(--panel-border) bg-(--panel) p-4 open:pb-4"
                >
                  <summary className="cursor-pointer list-none text-[14.5px] font-semibold text-(--ink) marker:content-none">
                    <span className="flex items-center justify-between gap-3">
                      {item.question}
                      <span className="flex-none text-(--ink-faint) transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-(--ink-soft)">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer className="pt-1.5 text-center text-[11.5px] text-(--ink-faint)">
          Runs entirely in your browser — no accounts, no servers, nothing stored except locally on this
          device.
        </footer>
      </div>
    </div>
  );
}

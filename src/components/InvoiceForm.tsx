"use client";

import { useRef, useState } from "react";
import type { InvoiceState } from "@/types/invoice";
import LineItemsTable from "@/components/LineItemsTable";

interface InvoiceFormProps {
  invoice: InvoiceState;
  setInvoice: (updater: (prev: InvoiceState) => InvoiceState) => void;
  clientNameError: boolean;
  lineItemsError: boolean;
  onClearClientNameError: () => void;
  onClearLineItemsError: () => void;
  clientNameInputRef?: React.RefObject<HTMLInputElement | null>;
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export default function InvoiceForm({
  invoice,
  setInvoice,
  clientNameError,
  lineItemsError,
  onClearClientNameError,
  onClearLineItemsError,
  clientNameInputRef,
}: InvoiceFormProps) {
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setLogoError(null);
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setLogoError("Logo must be a PNG or JPG image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("That logo is over 2MB — please use a smaller file.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setInvoice((prev) => ({
        ...prev,
        business: { ...prev.business, logoDataUrl: reader.result as string },
      }));
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setInvoice((prev) => ({ ...prev, business: { ...prev.business, logoDataUrl: null } }));
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  const inputClass =
    "w-full rounded-lg border border-(--panel-border) bg-(--desk) px-2.5 py-2 text-[13.5px] text-(--ink) focus:border-(--focus) focus:outline-none";
  const labelClass = "text-[12px] font-medium text-(--ink-soft)";

  return (
    <div className="flex flex-col gap-3.5">
      {/* From — your business */}
      <section className="rounded-xl border border-(--panel-border) bg-(--panel) p-5 shadow-(--shadow)">
        <h2 className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-(--ink-soft)">
          From — your business
        </h2>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-[54px] w-[54px] flex-none items-center justify-center overflow-hidden rounded-lg border border-dashed border-(--panel-border) bg-(--desk) text-center text-[10px] text-(--ink-faint)">
            {invoice.business.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={invoice.business.logoDataUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              "No logo"
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-(--panel-border) bg-(--panel) px-2.5 py-1.5 text-[12.5px] hover:border-(--accent) hover:text-(--accent-strong)">
              Upload logo
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
            {invoice.business.logoDataUrl && (
              <button
                type="button"
                onClick={removeLogo}
                className="w-fit rounded-lg border border-(--panel-border) bg-(--panel) px-2.5 py-1.5 text-[12.5px] hover:border-(--accent) hover:text-(--accent-strong)"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {logoError && <p className="mb-3 text-[11.5px] text-(--stamp)">{logoError}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="biz-name">
              Business or your name
            </label>
            <input
              id="biz-name"
              type="text"
              autoComplete="organization"
              value={invoice.business.name}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, business: { ...prev.business, name: e.target.value } }))
              }
              className={inputClass}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="biz-address">
              Address
            </label>
            <textarea
              id="biz-address"
              rows={2}
              value={invoice.business.address}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, business: { ...prev.business, address: e.target.value } }))
              }
              className={`${inputClass} resize-y`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="biz-email">
              Email
            </label>
            <input
              id="biz-email"
              type="email"
              autoComplete="email"
              value={invoice.business.email}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, business: { ...prev.business, email: e.target.value } }))
              }
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="biz-phone">
              Phone
            </label>
            <input
              id="biz-phone"
              type="tel"
              autoComplete="tel"
              value={invoice.business.phone}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, business: { ...prev.business, phone: e.target.value } }))
              }
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Bill to — your client */}
      <section className="rounded-xl border border-(--panel-border) bg-(--panel) p-5 shadow-(--shadow)">
        <h2 className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-(--ink-soft)">
          Bill to — your client
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="client-name">
              Client name <span className="text-(--stamp)">*</span>
            </label>
            <input
              id="client-name"
              ref={clientNameInputRef}
              type="text"
              value={invoice.client.name}
              onChange={(e) => {
                setInvoice((prev) => ({ ...prev, client: { ...prev.client, name: e.target.value } }));
                onClearClientNameError();
              }}
              className={`${inputClass} ${clientNameError ? "border-(--stamp)" : ""}`}
            />
            {clientNameError && (
              <span className="text-[11.5px] text-(--stamp)">
                Add the client&apos;s name — it&apos;s needed on every invoice.
              </span>
            )}
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="client-address">
              Address
            </label>
            <textarea
              id="client-address"
              rows={2}
              value={invoice.client.address}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, client: { ...prev.client, address: e.target.value } }))
              }
              className={`${inputClass} resize-y`}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="client-email">
              Email
            </label>
            <input
              id="client-email"
              type="email"
              value={invoice.client.email}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, client: { ...prev.client, email: e.target.value } }))
              }
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Invoice details */}
      <section className="rounded-xl border border-(--panel-border) bg-(--panel) p-5 shadow-(--shadow)">
        <h2 className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-(--ink-soft)">
          Invoice details
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="invoice-number">
              Invoice number
            </label>
            <input
              id="invoice-number"
              type="text"
              inputMode="numeric"
              value={invoice.invoiceNumber}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, invoiceNumber: Number(e.target.value) || 0 }))
              }
              className={inputClass}
            />
          </div>
          <div />
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="issue-date">
              Issue date
            </label>
            <input
              id="issue-date"
              type="date"
              value={invoice.issueDate}
              onChange={(e) => setInvoice((prev) => ({ ...prev, issueDate: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="due-date">
              Due date
            </label>
            <input
              id="due-date"
              type="date"
              value={invoice.dueDate}
              onChange={(e) => setInvoice((prev) => ({ ...prev, dueDate: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Line items */}
      <section className="rounded-xl border border-(--panel-border) bg-(--panel) p-5 shadow-(--shadow)">
        <h2 className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-(--ink-soft)">
          Line items
        </h2>
        <LineItemsTable
          lineItems={invoice.lineItems}
          currency={invoice.currency}
          onChange={(lineItems) => {
            setInvoice((prev) => ({ ...prev, lineItems }));
            onClearLineItemsError();
          }}
          error={
            lineItemsError
              ? "Add at least one line item with a description and an amount above zero."
              : undefined
          }
        />
      </section>

      {/* Adjustments */}
      <section className="rounded-xl border border-(--panel-border) bg-(--panel) p-5 shadow-(--shadow)">
        <h2 className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-(--ink-soft)">
          Adjustments
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="tax-percent">
              Tax (%)
            </label>
            <input
              id="tax-percent"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={invoice.taxPercent}
              onChange={(e) => setInvoice((prev) => ({ ...prev, taxPercent: Number(e.target.value) || 0 }))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="discount-percent">
              Discount (%)
            </label>
            <input
              id="discount-percent"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={invoice.discountPercent}
              onChange={(e) =>
                setInvoice((prev) => ({ ...prev, discountPercent: Number(e.target.value) || 0 }))
              }
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Payment & notes */}
      <section className="rounded-xl border border-(--panel-border) bg-(--panel) p-5 shadow-(--shadow)">
        <h2 className="mb-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-(--ink-soft)">
          Payment &amp; notes
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="payment-details">
              Payment details
            </label>
            <span className="text-[11px] text-(--ink-faint)">
              Bank transfer, UPI ID, PayPal link — whatever you accept.
            </span>
            <textarea
              id="payment-details"
              rows={2}
              value={invoice.paymentDetails}
              onChange={(e) => setInvoice((prev) => ({ ...prev, paymentDetails: e.target.value }))}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="notes">
              Notes / terms
            </label>
            <textarea
              id="notes"
              rows={2}
              value={invoice.notes}
              onChange={(e) => setInvoice((prev) => ({ ...prev, notes: e.target.value }))}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
        <p className="mt-2.5 text-[11.5px] text-(--ink-faint)">
          Every invoice includes a small &quot;Made with InvoiceReady&quot; line — removing it is a paid feature,
          coming soon.
        </p>
      </section>
    </div>
  );
}

"use client";

import type { InvoiceState, InvoiceTotals } from "@/types/invoice";
import { formatDateDisplay, formatMoney, lineItemAmount } from "@/lib/invoice";

export default function InvoicePreview({
  invoice,
  totals,
}: {
  invoice: InvoiceState;
  totals: InvoiceTotals;
}) {
  const isOverdue = (() => {
    try {
      const due = new Date(`${invoice.dueDate}T00:00:00`);
      return due.getTime() < new Date(new Date().toDateString()).getTime();
    } catch {
      return false;
    }
  })();

  const logo = invoice.business.logoDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={invoice.business.logoDataUrl} alt="" className="h-10 w-10 flex-none rounded-md object-contain" />
  ) : null;

  const brandBlock = (nameColor: string, metaColor: string) => (
    <div className="flex items-center gap-2.5">
      {logo}
      <div>
        <div className="font-serif text-base font-semibold" style={{ color: nameColor }}>
          {invoice.business.name || "Your business name"}
        </div>
        <div className="mt-0.5 whitespace-pre-line text-[11px]" style={{ color: metaColor }}>
          {invoice.business.address}
          {invoice.business.email ? `\n${invoice.business.email}` : ""}
          {invoice.business.phone ? `  ·  ${invoice.business.phone}` : ""}
        </div>
      </div>
    </div>
  );

  const partiesAndTable = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-(--sheet-ink-faint)">
            Bill to
          </div>
          <div className="font-semibold text-(--sheet-ink)">{invoice.client.name || "Client name"}</div>
          <div className="mt-0.5 whitespace-pre-line text-[11.5px] text-(--sheet-ink-soft)">
            {invoice.client.address}
            {invoice.client.email ? `\n${invoice.client.email}` : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="flex justify-end gap-5">
            <div>
              <div className="mb-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-(--sheet-ink-faint)">
                Issue date
              </div>
              <div className="font-mono text-xs">{formatDateDisplay(invoice.issueDate)}</div>
            </div>
            <div>
              <div className="mb-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-(--sheet-ink-faint)">
                Due date
              </div>
              <div className="font-mono text-xs">{formatDateDisplay(invoice.dueDate)}</div>
            </div>
          </div>
          {isOverdue && (
            <div className="mt-2 flex justify-end">
              <span className="inline-block -rotate-3 rounded border-[1.5px] border-(--stamp) px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-(--stamp) opacity-85">
                Past due
              </span>
            </div>
          )}
        </div>
      </div>

      <table className="w-full border-collapse text-[12.2px]">
        <thead>
          <tr className={invoice.template === "minimal" ? "hidden" : undefined}>
            <th className="pb-1.5 text-left text-[9.5px] font-semibold uppercase tracking-wider text-(--sheet-ink-faint)">
              Description
            </th>
            <th className="pb-1.5 text-right text-[9.5px] font-semibold uppercase tracking-wider text-(--sheet-ink-faint)">
              Qty
            </th>
            <th className="pb-1.5 text-right text-[9.5px] font-semibold uppercase tracking-wider text-(--sheet-ink-faint)">
              Rate
            </th>
            <th className="pb-1.5 text-right text-[9.5px] font-semibold uppercase tracking-wider text-(--sheet-ink-faint)">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-2.5 text-(--sheet-ink-faint)">
                No line items yet
              </td>
            </tr>
          ) : (
            invoice.lineItems.map((li) => (
              <tr key={li.id} className="border-b border-(--sheet-line)">
                <td className="py-1.5">{li.description || "—"}</td>
                <td className="py-1.5 text-right">{Number(li.quantity) || 0}</td>
                <td className="whitespace-nowrap py-1.5 text-right font-mono tabular-nums">
                  {formatMoney(Number(li.rate) || 0, invoice.currency)}
                </td>
                <td className="whitespace-nowrap py-1.5 text-right font-mono tabular-nums">
                  {formatMoney(lineItemAmount(li), invoice.currency)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div
        className={`ml-auto flex w-[min(260px,60%)] flex-col gap-1.5 ${
          invoice.template === "modern" ? "rounded-md bg-(--accent-tint) px-2.5 py-2" : ""
        }`}
      >
        <div className="flex justify-between text-xs text-(--sheet-ink-soft)">
          <span>Subtotal</span>
          <span className="font-mono tabular-nums">{formatMoney(totals.subtotal, invoice.currency)}</span>
        </div>
        {invoice.discountPercent > 0 && (
          <div className="flex justify-between text-xs text-(--sheet-ink-soft)">
            <span>Discount ({invoice.discountPercent}%)</span>
            <span className="font-mono tabular-nums">
              -{formatMoney(totals.discountAmount, invoice.currency)}
            </span>
          </div>
        )}
        {invoice.taxPercent > 0 && (
          <div className="flex justify-between text-xs text-(--sheet-ink-soft)">
            <span>Tax ({invoice.taxPercent}%)</span>
            <span className="font-mono tabular-nums">+{formatMoney(totals.taxAmount, invoice.currency)}</span>
          </div>
        )}
        <div
          className={`flex justify-between pt-2 text-[15px] font-bold text-(--sheet-ink) ${
            invoice.template !== "modern" ? "border-t-[1.5px] border-(--sheet-ink)" : ""
          }`}
        >
          <span>Total due</span>
          <span className="font-mono tabular-nums">{formatMoney(totals.total, invoice.currency)}</span>
        </div>
      </div>

      {(invoice.paymentDetails || invoice.notes) && (
        <div className="mt-auto grid grid-cols-2 gap-4 pt-3">
          {invoice.paymentDetails ? (
            <div>
              <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-(--sheet-ink-faint)">
                Payment details
              </div>
              <p className="whitespace-pre-line text-[11px] text-(--sheet-ink-soft)">
                {invoice.paymentDetails}
              </p>
            </div>
          ) : (
            <div />
          )}
          {invoice.notes ? (
            <div>
              <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-(--sheet-ink-faint)">
                Notes
              </div>
              <p className="whitespace-pre-line text-[11px] text-(--sheet-ink-soft)">{invoice.notes}</p>
            </div>
          ) : (
            <div />
          )}
        </div>
      )}

      <div className="mt-1 border-t border-(--sheet-line) pt-2 text-center text-[9.5px] text-(--sheet-ink-faint)">
        Made with InvoiceReady
      </div>
    </>
  );

  if (invoice.template === "modern") {
    return (
      <div className="flex aspect-[8.5/11] w-full flex-col overflow-auto bg-(--sheet) text-[12.6px] leading-relaxed text-(--sheet-ink)">
        <div className="flex justify-between gap-4 bg-(--accent) px-8 py-7 text-white [&_.font-serif]:text-white">
          {brandBlock("#FFFFFF", "rgba(255,255,255,0.78)")}
          <div className="text-right">
            <div className="font-serif text-lg font-bold text-white">Invoice</div>
            <div className="mt-0.5 font-mono text-[11.5px] text-white/80">No. {invoice.invoiceNumber}</div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 px-8 py-5">{partiesAndTable}</div>
      </div>
    );
  }

  return (
    <div
      className={`flex aspect-[8.5/11] w-full flex-col gap-4 overflow-auto bg-(--sheet) p-9 text-[12.6px] leading-relaxed text-(--sheet-ink) ${
        invoice.template === "classic" ? "border-t-[6px] border-(--accent)" : ""
      }`}
    >
      <div
        className={`flex items-start justify-between gap-4 ${
          invoice.template === "classic" ? "border-b border-(--sheet-line) pb-3.5" : ""
        }`}
      >
        {brandBlock("var(--sheet-ink)", "var(--sheet-ink-soft)")}
        <div className="text-right">
          <div
            className={
              invoice.template === "classic"
                ? "font-serif text-[22px] font-bold text-(--accent)"
                : "text-[13px] font-medium uppercase tracking-[0.14em] text-(--sheet-ink-faint)"
            }
          >
            {invoice.template === "classic" ? "Invoice" : "Invoice"}
          </div>
          <div className="mt-0.5 font-mono text-[11.5px] text-(--sheet-ink-soft)">
            No. {invoice.invoiceNumber}
          </div>
        </div>
      </div>
      {partiesAndTable}
    </div>
  );
}

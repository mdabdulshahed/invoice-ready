"use client";

import type { Currency, LineItem } from "@/types/invoice";
import { createLineItem, formatMoney, lineItemAmount } from "@/lib/invoice";

interface LineItemsTableProps {
  lineItems: LineItem[];
  currency: Currency;
  onChange: (lineItems: LineItem[]) => void;
  error?: string;
}

export default function LineItemsTable({ lineItems, currency, onChange, error }: LineItemsTableProps) {
  function updateItem(id: string, patch: Partial<LineItem>) {
    onChange(lineItems.map((li) => (li.id === id ? { ...li, ...patch } : li)));
  }

  function removeItem(id: string) {
    const next = lineItems.filter((li) => li.id !== id);
    onChange(next.length > 0 ? next : [createLineItem()]);
  }

  function addItem() {
    onChange([...lineItems, createLineItem()]);
  }

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-(--desk-line)">
            <th className="pb-2 text-left text-[10.5px] font-semibold uppercase tracking-wider text-(--ink-faint)">
              Description
            </th>
            <th className="w-16 pb-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-(--ink-faint)">
              Qty
            </th>
            <th className="w-24 pb-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-(--ink-faint)">
              Rate
            </th>
            <th className="w-24 pb-2 text-right text-[10.5px] font-semibold uppercase tracking-wider text-(--ink-faint)">
              Amount
            </th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {lineItems.map((li) => (
            <tr key={li.id} className="border-b border-(--desk-line-soft) align-top">
              <td className="py-2 pr-1">
                <input
                  type="text"
                  value={li.description}
                  onChange={(e) => updateItem(li.id, { description: e.target.value })}
                  placeholder="What did you deliver?"
                  className="w-full rounded-md border border-transparent bg-transparent px-1.5 py-1.5 text-[13.5px] hover:border-(--panel-border) focus:border-(--focus) focus:bg-(--desk) focus:outline-none"
                />
              </td>
              <td className="py-2 pr-1">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={li.quantity}
                  onChange={(e) => updateItem(li.id, { quantity: Number(e.target.value) })}
                  className="w-full rounded-md border border-transparent bg-transparent px-1.5 py-1.5 text-right font-mono text-[13.5px] tabular-nums hover:border-(--panel-border) focus:border-(--focus) focus:bg-(--desk) focus:outline-none"
                />
              </td>
              <td className="py-2 pr-1">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={li.rate}
                  onChange={(e) => updateItem(li.id, { rate: Number(e.target.value) })}
                  className="w-full rounded-md border border-transparent bg-transparent px-1.5 py-1.5 text-right font-mono text-[13.5px] tabular-nums hover:border-(--panel-border) focus:border-(--focus) focus:bg-(--desk) focus:outline-none"
                />
              </td>
              <td className="whitespace-nowrap py-2 pt-3.5 text-right font-mono text-[13px] tabular-nums text-(--ink)">
                {formatMoney(lineItemAmount(li), currency)}
              </td>
              <td className="py-2 text-center">
                <button
                  type="button"
                  onClick={() => removeItem(li.id)}
                  aria-label="Remove line item"
                  title="Remove line item"
                  className="rounded-md p-1.5 text-(--ink-faint) hover:bg-(--stamp-tint) hover:text-(--stamp)"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="mt-2 text-[11.5px] text-(--stamp)">{error}</p>}
      <button
        type="button"
        onClick={addItem}
        className="mt-2.5 w-full rounded-lg border border-dashed border-(--panel-border) py-2 text-[13px] text-(--ink-soft) hover:border-(--accent) hover:text-(--accent-strong)"
      >
        + Add line item
      </button>
    </div>
  );
}

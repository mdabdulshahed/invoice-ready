import { pdf } from "@react-pdf/renderer";
import type { InvoiceState, TemplateId } from "@/types/invoice";
import { computeTotals, sanitizeFilenamePart } from "@/lib/invoice";
import ClassicTemplate from "@/templates/ClassicTemplate";
import ModernTemplate from "@/templates/ModernTemplate";
import MinimalTemplate from "@/templates/MinimalTemplate";

const TEMPLATE_COMPONENTS: Record<TemplateId, typeof ClassicTemplate> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export function invoiceFilename(invoice: InvoiceState): string {
  return `Invoice-${invoice.invoiceNumber}-${sanitizeFilenamePart(invoice.client.name)}.pdf`;
}

export async function generateInvoicePdfBlob(invoice: InvoiceState): Promise<Blob> {
  const totals = computeTotals(invoice);
  const TemplateComponent = TEMPLATE_COMPONENTS[invoice.template] ?? ClassicTemplate;
  return pdf(<TemplateComponent invoice={invoice} totals={totals} />).toBlob();
}

export async function downloadInvoicePdf(invoice: InvoiceState): Promise<void> {
  const blob = await generateInvoicePdfBlob(invoice);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = invoiceFilename(invoice);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

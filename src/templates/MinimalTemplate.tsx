import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import type { InvoiceState, InvoiceTotals } from "@/types/invoice";
import { formatDateDisplay } from "@/lib/invoice";
import { PdfLineItemsTable, PdfTotalsBlock, palette, sharedStyles } from "@/lib/pdf/shared";

export default function MinimalTemplate({
  invoice,
  totals,
}: {
  invoice: InvoiceState;
  totals: InvoiceTotals;
}) {
  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="LETTER" style={sharedStyles.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {invoice.business.logoDataUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML img
              <Image src={invoice.business.logoDataUrl} style={{ width: 30, height: 30 }} />
            )}
            <Text style={{ fontSize: 17, fontWeight: 700, color: palette.ink }}>
              {invoice.business.name || "Your business name"}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: palette.inkFaint,
              textTransform: "uppercase",
              letterSpacing: 1.4,
            }}
          >
            Invoice
          </Text>
        </View>
        <Text style={{ fontSize: 9, color: palette.inkSoft, marginTop: 4, lineHeight: 1.5 }}>
          {invoice.business.address}
          {invoice.business.email ? `\n${invoice.business.email}` : ""}
        </Text>

        <View style={sharedStyles.partiesRow}>
          <View>
            <Text style={sharedStyles.label}>Bill to</Text>
            <Text style={sharedStyles.partyName}>{invoice.client.name || "Client name"}</Text>
            <Text style={sharedStyles.partyMeta}>
              {invoice.client.address}
              {invoice.client.email ? `\n${invoice.client.email}` : ""}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={sharedStyles.metaValue}>No. {invoice.invoiceNumber}</Text>
            <Text style={{ ...sharedStyles.metaValue, marginTop: 4 }}>
              Issued {formatDateDisplay(invoice.issueDate)}
            </Text>
            <Text style={{ ...sharedStyles.metaValue, marginTop: 2 }}>
              Due {formatDateDisplay(invoice.dueDate)}
            </Text>
          </View>
        </View>

        <PdfLineItemsTable invoice={invoice} />
        <PdfTotalsBlock invoice={invoice} totals={totals} />

        {(invoice.paymentDetails || invoice.notes) && (
          <View style={sharedStyles.footnotesRow}>
            {invoice.paymentDetails ? (
              <View style={sharedStyles.footnoteBlock}>
                <Text style={sharedStyles.label}>Payment details</Text>
                <Text style={sharedStyles.footnoteText}>{invoice.paymentDetails}</Text>
              </View>
            ) : (
              <View style={sharedStyles.footnoteBlock} />
            )}
            {invoice.notes ? (
              <View style={sharedStyles.footnoteBlock}>
                <Text style={sharedStyles.label}>Notes</Text>
                <Text style={sharedStyles.footnoteText}>{invoice.notes}</Text>
              </View>
            ) : (
              <View style={sharedStyles.footnoteBlock} />
            )}
          </View>
        )}

        <Text style={sharedStyles.footerCredit}>Made with InvoiceReady</Text>
      </Page>
    </Document>
  );
}

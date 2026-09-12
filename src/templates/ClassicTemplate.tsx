import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import type { InvoiceState, InvoiceTotals } from "@/types/invoice";
import { formatDateDisplay } from "@/lib/invoice";
import { PdfLineItemsTable, PdfTotalsBlock, palette, sharedStyles } from "@/lib/pdf/shared";

export default function ClassicTemplate({
  invoice,
  totals,
}: {
  invoice: InvoiceState;
  totals: InvoiceTotals;
}) {
  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="LETTER" style={sharedStyles.page}>
        <View
          style={{
            borderTopWidth: 5,
            borderTopColor: palette.accent,
            marginBottom: 16,
            marginTop: -40,
            marginHorizontal: -44,
            paddingTop: 24,
            paddingHorizontal: 44,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottomWidth: 1,
            borderBottomColor: palette.line,
            paddingBottom: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {invoice.business.logoDataUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML img
              <Image src={invoice.business.logoDataUrl} style={{ width: 34, height: 34 }} />
            )}
            <View>
              <Text style={{ fontSize: 15, fontWeight: 700, color: palette.ink }}>
                {invoice.business.name || "Your business name"}
              </Text>
              <Text style={sharedStyles.partyMeta}>
                {invoice.business.address}
                {invoice.business.email ? `\n${invoice.business.email}` : ""}
                {invoice.business.phone ? `  ·  ${invoice.business.phone}` : ""}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: palette.accent }}>INVOICE</Text>
            <Text style={{ fontSize: 9.5, color: palette.inkSoft, fontFamily: "Courier", marginTop: 3 }}>
              No. {invoice.invoiceNumber}
            </Text>
          </View>
        </View>

        <View style={sharedStyles.partiesRow}>
          <View>
            <Text style={sharedStyles.label}>Bill to</Text>
            <Text style={sharedStyles.partyName}>{invoice.client.name || "Client name"}</Text>
            <Text style={sharedStyles.partyMeta}>
              {invoice.client.address}
              {invoice.client.email ? `\n${invoice.client.email}` : ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 22 }}>
            <View>
              <Text style={sharedStyles.label}>Issue date</Text>
              <Text style={sharedStyles.metaValue}>{formatDateDisplay(invoice.issueDate)}</Text>
            </View>
            <View>
              <Text style={sharedStyles.label}>Due date</Text>
              <Text style={sharedStyles.metaValue}>{formatDateDisplay(invoice.dueDate)}</Text>
            </View>
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

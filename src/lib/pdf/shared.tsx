import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { InvoiceState, InvoiceTotals } from "@/types/invoice";
import { formatMoney, lineItemAmount } from "@/lib/invoice";

export const palette = {
  accent: "#1F4D3F",
  accentTint: "#DCEAE3",
  ink: "#17262A",
  inkSoft: "#52686B",
  inkFaint: "#8098A0",
  line: "#E4E1D6",
  lineSoft: "#F1F0EA",
};

const styles = StyleSheet.create({
  table: { display: "flex", flexDirection: "column", marginTop: 8 },
  headRow: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: palette.ink,
    paddingBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: palette.line,
    paddingVertical: 7,
  },
  colDesc: { flexGrow: 1, flexShrink: 1, paddingRight: 8 },
  colQty: { width: 46, textAlign: "right" },
  colRate: { width: 78, textAlign: "right" },
  colAmt: { width: 84, textAlign: "right" },
  headLabel: {
    fontSize: 8,
    color: palette.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cellText: { fontSize: 9.5, color: palette.ink },
  totalsWrap: { alignSelf: "flex-end", width: 220, marginTop: 14 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsLabel: { fontSize: 9.5, color: palette.inkSoft },
  totalsValue: { fontSize: 9.5, color: palette.inkSoft },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1.25,
    borderTopColor: palette.ink,
    marginTop: 4,
    paddingTop: 6,
  },
  totalLabel: { fontSize: 12, fontWeight: 700, color: palette.ink },
  totalValue: { fontSize: 12, fontWeight: 700, color: palette.ink },
});

export function PdfLineItemsTable({ invoice }: { invoice: InvoiceState }) {
  return (
    <View style={styles.table}>
      <View style={styles.headRow}>
        <Text style={[styles.colDesc, styles.headLabel]}>Description</Text>
        <Text style={[styles.colQty, styles.headLabel]}>Qty</Text>
        <Text style={[styles.colRate, styles.headLabel]}>Rate</Text>
        <Text style={[styles.colAmt, styles.headLabel]}>Amount</Text>
      </View>
      {invoice.lineItems.map((li) => (
        <View key={li.id} style={styles.row} wrap={false}>
          <Text style={[styles.colDesc, styles.cellText]}>{li.description || "—"}</Text>
          <Text style={[styles.colQty, styles.cellText]}>{Number(li.quantity) || 0}</Text>
          <Text style={[styles.colRate, styles.cellText]}>
            {formatMoney(Number(li.rate) || 0, invoice.currency)}
          </Text>
          <Text style={[styles.colAmt, styles.cellText]}>
            {formatMoney(lineItemAmount(li), invoice.currency)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function PdfTotalsBlock({
  invoice,
  totals,
  accentColor,
  wrapperStyle,
}: {
  invoice: InvoiceState;
  totals: InvoiceTotals;
  accentColor?: string;
  wrapperStyle?: object;
}) {
  return (
    <View style={{ ...styles.totalsWrap, ...(wrapperStyle || {}) }}>
      <View style={styles.totalsRow}>
        <Text style={styles.totalsLabel}>Subtotal</Text>
        <Text style={styles.totalsValue}>{formatMoney(totals.subtotal, invoice.currency)}</Text>
      </View>
      {invoice.discountPercent > 0 && (
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Discount ({invoice.discountPercent}%)</Text>
          <Text style={styles.totalsValue}>
            -{formatMoney(totals.discountAmount, invoice.currency)}
          </Text>
        </View>
      )}
      {invoice.taxPercent > 0 && (
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Tax ({invoice.taxPercent}%)</Text>
          <Text style={styles.totalsValue}>+{formatMoney(totals.taxAmount, invoice.currency)}</Text>
        </View>
      )}
      <View style={styles.totalRow}>
        <Text style={{ ...styles.totalLabel, color: accentColor || palette.ink }}>Total due</Text>
        <Text style={{ ...styles.totalValue, color: accentColor || palette.ink }}>
          {formatMoney(totals.total, invoice.currency)}
        </Text>
      </View>
    </View>
  );
}

export const sharedStyles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: palette.ink,
  },
  footerCredit: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: palette.inkFaint,
  },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  label: {
    fontSize: 8,
    color: palette.inkFaint,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  partyName: { fontSize: 11, fontWeight: 700, color: palette.ink },
  partyMeta: { fontSize: 9, color: palette.inkSoft, marginTop: 2, lineHeight: 1.5 },
  metaValue: { fontSize: 9.5, color: palette.ink, fontFamily: "Courier" },
  footnotesRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24, gap: 16 },
  footnoteBlock: { width: "48%" },
  footnoteText: { fontSize: 8.5, color: palette.inkSoft, lineHeight: 1.5 },
});

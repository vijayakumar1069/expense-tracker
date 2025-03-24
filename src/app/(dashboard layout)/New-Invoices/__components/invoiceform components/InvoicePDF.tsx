// app/components/InvoicePDF.tsx
"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { Invoice, InvoiceContents } from "@prisma/client";

// Register custom fonts for a professional look
Font.register({
  family: "Lato",
  fonts: [
    { src: "/fonts/Lato-Regular.ttf" },
    { src: "/fonts/Lato-Bold.ttf", fontWeight: 700 },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Lato",
    fontSize: 12,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  companyLogo: {
    width: 120,
    height: 50,
    objectFit: "contain",
  },
  invoiceInfo: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#6366F1", // Indigo color matching your UI
  },
  invoiceNumber: {
    fontSize: 14,
    marginBottom: 5,
  },
  invoiceStatus: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 4,
    color: "#fff",
    textTransform: "uppercase",
  },
  draftStatus: {
    backgroundColor: "#6B7280", // Gray
  },
  sentStatus: {
    backgroundColor: "#3B82F6", // Blue
  },
  paidStatus: {
    backgroundColor: "#10B981", // Green
  },
  overdueStatus: {
    backgroundColor: "#EF4444", // Red
  },
  cancelledStatus: {
    backgroundColor: "#F59E0B", // Amber
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#6366F1",
    textTransform: "uppercase",
  },
  clientInfo: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  billingInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  billingSection: {
    width: "48%",
  },
  table: {
    display: "flex",
    width: "100%",
    marginBottom: 20,
    borderStyle: "solid",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
  },
  tableHeader: {
    backgroundColor: "#F3F4F6",
    fontWeight: "bold",
    padding: 10,
  },
  tableCell: {
    padding: 10,
  },
  descriptionCol: {
    width: "40%",
  },
  quantityCol: {
    width: "15%",
    textAlign: "center",
  },
  priceCol: {
    width: "20%",
    textAlign: "right",
  },
  totalCol: {
    width: "25%",
    textAlign: "right",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  summary: {
    width: "40%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "8px 0",
  },
  summaryTotal: {
    fontWeight: "bold",
    fontSize: 16,
    borderTopWidth: 2,
    borderTopColor: "#6366F1",
    borderTopStyle: "solid",
    paddingTop: 8,
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#6B7280",
    padding: "0 50px",
  },
  note: {
    marginTop: 40,
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    fontSize: 11,
  },
});

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

type InvoiceWithContents = Invoice & {
  invoiceContents: InvoiceContents[];
};

const InvoicePDF = ({ invoice }: { invoice: InvoiceWithContents }) => {
  // Get the status style
  const getStatusStyle = () => {
    switch (invoice.status) {
      case "DRAFT":
        return styles.draftStatus;
      case "SENT":
        return styles.sentStatus;
      case "PAID":
        return styles.paidStatus;
      case "OVERDUE":
        return styles.overdueStatus;
      case "CANCELLED":
        return styles.cancelledStatus;
      default:
        return styles.draftStatus;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with logo and invoice info */}
        <View style={styles.header}>
          <View>
            <Image src="/logo.png" style={styles.companyLogo} />
            <Text>Your Company Name</Text>
            <Text>123 Business Street</Text>
            <Text>City, State ZIP</Text>
            <Text>contact@yourcompany.com</Text>
          </View>

          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
            <Text>Issue Date: {formatDate(invoice.createdAt)}</Text>
            <Text>Due Date: {formatDate(invoice.dueDate)}</Text>
            <Text style={[styles.invoiceStatus, getStatusStyle()]}>
              {invoice.status}
            </Text>
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.clientInfo}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.clientName}>{invoice.clientName}</Text>
          <Text>{invoice.clientEmail}</Text>
          <Text>{invoice.clientPhone}</Text>
          <Text>{invoice.clientAddress}</Text>
        </View>

        {/* Invoice Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.descriptionCol]}>
              Description
            </Text>
            <Text style={[styles.tableCell, styles.quantityCol]}>Qty</Text>
            <Text style={[styles.tableCell, styles.priceCol]}>Price</Text>
            <Text style={[styles.tableCell, styles.totalCol]}>Total</Text>
          </View>

          {/* Table Rows */}
          {invoice.invoiceContents.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionCol]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.quantityCol]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.priceCol]}>
                {formatCurrency(item.price)}
              </Text>
              <Text style={[styles.tableCell, styles.totalCol]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Invoice Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text>Subtotal</Text>
              <Text>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Tax ({invoice.taxRate}%)</Text>
              <Text>{formatCurrency(invoice.taxAmount)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text>Total Due</Text>
              <Text>{formatCurrency(invoice.invoiceTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.note}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <Text>Please make payment via bank transfer to:</Text>
          <Text>Bank: Your Bank Name</Text>
          <Text>Account Name: Your Company Name</Text>
          <Text>Account Number: XXXX-XXXX-XXXX</Text>
          <Text>Reference: Invoice #{invoice.invoiceNumber}</Text>
          <Text style={{ marginTop: 10 }}>
            Payment Terms: Due within 30 days
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>
            If you have any questions about this invoice, please contact us at
            accounts@yourcompany.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;

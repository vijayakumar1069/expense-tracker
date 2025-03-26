import React from "react";
import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Invoice, InvoiceContents } from "@prisma/client";

type InvoiceEmailProps = {
  invoice: Invoice & {
    invoiceContents: InvoiceContents[];
  };
  previewUrl?: string;
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
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

export const InvoiceEmail = ({
  invoice,
  previewUrl = "https://your-app.com/invoice/preview",
}: InvoiceEmailProps) => {
  const {
    id,
    invoiceNumber,
    clientName,
    dueDate,
    subtotal,
    taxRate,
    taxAmount,
    invoiceTotal,
    invoiceContents,
    createdAt,
  } = invoice;

  // Fixed email-safe colors
  const primaryColor = "#4f46e5"; // Indigo that displays well in email clients
  const secondaryColor = "#f8fafc"; // Very light gray/blue
  const accentColor = "#f97316"; // Orange for highlights
  const darkTextColor = "#334155"; // Slate-700
  const lightTextColor = "#94a3b8"; // Slate-400

  return (
    <Html>
      <Head>
        <title>{`Your Invoice ${invoiceNumber} | ${formatCurrency(
          invoiceTotal
        )}`}</title>
        <Font
          fontFamily="Arial"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Arial:wght@400;500;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        Your invoice #{invoiceNumber} for {formatCurrency(invoiceTotal)} is
        ready to view and download ✨
      </Preview>
      <Tailwind>
        <Body style={{ backgroundColor: "#f1f5f9", margin: "0", padding: "0" }}>
          <Container
            style={{
              backgroundColor: "#ffffff",
              margin: "40px auto",
              maxWidth: "600px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Header Banner */}
            <Section
              style={{
                backgroundColor: primaryColor,
                padding: "32px 40px",
                textAlign: "center",
              }}
            >
              <Img
                src="https://your-company.com/logo-white.png"
                width="130"
                height="55"
                alt="Your Company"
                style={{ margin: "0 auto" }}
              />
              <Heading
                style={{
                  color: "#ffffff",
                  fontSize: "28px",
                  fontWeight: "bold",
                  marginTop: "24px",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                Invoice Ready
              </Heading>
              <Text
                style={{
                  color: "#ffffff",
                  opacity: "0.9",
                  fontWeight: "300",
                  textAlign: "center",
                  margin: "0",
                }}
              >
                We&apos;ve prepared your invoice {invoiceNumber}
              </Text>
            </Section>

            {/* Main Content */}
            <Section style={{ padding: "40px" }}>
              <Text
                style={{
                  color: darkTextColor,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                Hello {clientName},
              </Text>
              <Text
                style={{
                  color: darkTextColor,
                  fontSize: "16px",
                  lineHeight: "24px",
                  marginTop: "16px",
                }}
              >
                Thank you for your business! Please find your invoice details
                below. We&apos;ve attached a PDF copy of this invoice to this
                email for your records.
              </Text>

              {/* Invoice Details Card */}
              <Section style={{ marginTop: "32px", marginBottom: "32px" }}>
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderLeft: `4px solid ${primaryColor}`,
                    borderRadius: "8px",
                    padding: "24px",
                    backgroundColor: secondaryColor,
                  }}
                >
                  <Heading
                    as="h2"
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      marginBottom: "16px",
                      color: primaryColor,
                    }}
                  >
                    Invoice #{invoiceNumber}
                  </Heading>

                  <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ marginBottom: "16px" }}
                  >
                    <tr>
                      <td width="33%">
                        <Text
                          style={{
                            color: lightTextColor,
                            fontSize: "12px",
                            marginBottom: "4px",
                            textTransform: "uppercase",
                          }}
                        >
                          ISSUED ON
                        </Text>
                        <Text
                          style={{
                            color: darkTextColor,
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {formatDate(createdAt)}
                        </Text>
                      </td>
                      <td width="33%">
                        <Text
                          style={{
                            color: lightTextColor,
                            fontSize: "12px",
                            marginBottom: "4px",
                            textTransform: "uppercase",
                          }}
                        >
                          DUE DATE
                        </Text>
                        <Text
                          style={{
                            color: darkTextColor,
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {formatDate(dueDate)}
                        </Text>
                      </td>
                      <td width="33%">
                        <Text
                          style={{
                            color: lightTextColor,
                            fontSize: "12px",
                            marginBottom: "4px",
                            textTransform: "uppercase",
                          }}
                        >
                          INVOICE NUMBER
                        </Text>
                        <Text
                          style={{
                            color: accentColor,
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          #{invoiceNumber}
                        </Text>
                      </td>
                    </tr>
                  </table>

                  <Hr
                    style={{
                      borderColor: "#e2e8f0",
                      borderWidth: "1px",
                      margin: "20px 0",
                    }}
                  />

                  {/* Amount Summary */}
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td width="60%">
                        <Text
                          style={{ color: darkTextColor, fontSize: "14px" }}
                        >
                          Subtotal
                        </Text>
                      </td>
                      <td width="40%" align="right">
                        <Text
                          style={{ color: darkTextColor, fontSize: "14px" }}
                        >
                          {formatCurrency(subtotal)}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td width="60%">
                        <Text
                          style={{ color: darkTextColor, fontSize: "14px" }}
                        >
                          Tax ({taxRate}%)
                        </Text>
                      </td>
                      <td width="40%" align="right">
                        <Text
                          style={{ color: darkTextColor, fontSize: "14px" }}
                        >
                          {formatCurrency(taxAmount)}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td width="60%">
                        <Text
                          style={{
                            color: primaryColor,
                            fontSize: "18px",
                            fontWeight: "600",
                            marginTop: "16px",
                          }}
                        >
                          Total Due
                        </Text>
                      </td>
                      <td width="40%" align="right">
                        <Text
                          style={{
                            color: primaryColor,
                            fontSize: "18px",
                            fontWeight: "600",
                            marginTop: "16px",
                          }}
                        >
                          {formatCurrency(invoiceTotal)}
                        </Text>
                      </td>
                    </tr>
                  </table>
                </div>
              </Section>

              {/* Services Summary */}
              <Heading
                as="h3"
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  color: darkTextColor,
                  marginBottom: "12px",
                }}
              >
                Services Provided
              </Heading>

              {invoiceContents.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px",
                    marginBottom: "8px",
                    backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td width="70%">
                        <Text
                          style={{
                            color: darkTextColor,
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {item.description}
                        </Text>
                      </td>
                      <td width="30%" align="right">
                        <Text
                          style={{
                            color: darkTextColor,
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {formatCurrency(item.total)}
                        </Text>
                      </td>
                    </tr>
                  </table>
                </div>
              ))}

              {/* Call to Action Button */}
              <Section style={{ textAlign: "center", marginTop: "32px" }}>
                <div>
                  <a
                    href={`${previewUrl}/${id}`}
                    style={{
                      backgroundColor: primaryColor,
                      color: "#ffffff",
                      padding: "12px 24px",
                      borderRadius: "6px",
                      fontWeight: "500",
                      fontSize: "16px",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    View Full Invoice
                  </a>
                </div>
              </Section>

              {/* Payment Options */}
              <Section style={{ marginTop: "32px" }}>
                <Heading
                  as="h3"
                  style={{
                    fontSize: "18px",
                    fontWeight: "500",
                    color: darkTextColor,
                    marginBottom: "12px",
                  }}
                >
                  Payment Options
                </Heading>
                <div
                  style={{
                    backgroundColor: secondaryColor,
                    borderRadius: "8px",
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      color: darkTextColor,
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Bank Transfer:</strong> Make a direct transfer to
                    our account
                  </Text>
                  <Text
                    style={{
                      color: darkTextColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    Bank: Bank of America
                  </Text>
                  <Text
                    style={{
                      color: darkTextColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    Account: Your Company, Inc.
                  </Text>
                  <Text
                    style={{
                      color: darkTextColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    Account #: XXXX-XXXX-XXXX-XXXX
                  </Text>
                  <Text
                    style={{
                      color: darkTextColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    Reference: INV-{invoiceNumber}
                  </Text>

                  <Hr style={{ borderColor: "#e2e8f0", margin: "16px 0" }} />

                  <Text
                    style={{
                      color: darkTextColor,
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Credit Card:</strong> Pay securely online
                  </Text>
                  <div>
                    <a
                      href={`${previewUrl}/${id}/pay`}
                      style={{
                        backgroundColor: "#ffffff",
                        color: primaryColor,
                        border: `1px solid ${primaryColor}`,
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontWeight: "500",
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      Pay Online Now
                    </a>
                  </div>
                </div>
              </Section>
            </Section>

            {/* Footer */}
            <Section
              style={{
                backgroundColor: secondaryColor,
                padding: "24px 40px",
                textAlign: "center",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <Text
                style={{
                  color: darkTextColor,
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Need help with this invoice? Contact us at{" "}
                <a
                  href="mailto:billing@yourcompany.com"
                  style={{ color: primaryColor, textDecoration: "underline" }}
                >
                  billing@yourcompany.com
                </a>
              </Text>
              <Text
                style={{
                  color: lightTextColor,
                  fontSize: "12px",
                  margin: "4px 0",
                }}
              >
                © 2025 Your Company, Inc. All rights reserved.
              </Text>
              <Text
                style={{
                  color: lightTextColor,
                  fontSize: "12px",
                  margin: "4px 0",
                }}
              >
                123 Business Street, City, State ZIP
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InvoiceEmail;

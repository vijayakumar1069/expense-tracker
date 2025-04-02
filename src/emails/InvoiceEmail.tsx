import React from "react";
import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
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

export const InvoiceEmail = ({ invoice }: InvoiceEmailProps) => {
  const {
    invoiceNumber,
    clientName,

    subtotal,
    taxRate,
    taxAmount,
    invoiceTotal,
    invoiceContents,
    createdAt,
  } = invoice;

  // Custom colors based on the provided RGB values
  const primaryColor = "#2CAC68"; // Professional green from rgb(0.17, 0.67, 0.41)
  const secondaryColor = "#333333"; // Dark gray from rgb(0.2, 0.2, 0.2)
  const accentColor = "#F2F2F2"; // Light gray from rgb(0.95, 0.95, 0.95)
  const textColor = "#333333"; // Text color from rgb(0.2, 0.2, 0.2)
  const successColor = "#2DB42D"; // Success green from rgb(0.176, 0.706, 0.176)
  const lightTextColor = "#666666"; // Lighter text for less emphasis

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
        <Body
          style={{ backgroundColor: "#f8f9fa", margin: "0", padding: "2px" }}
        >
          <Container
            style={{
              backgroundColor: "#ffffff",
              margin: "40px auto",
              maxWidth: "600px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
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
                  color: textColor,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                Hello {clientName},
              </Text>
              <Text
                style={{
                  color: textColor,
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
                    backgroundColor: accentColor,
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
                      <td width="50%">
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
                            color: secondaryColor,
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {formatDate(createdAt)}
                        </Text>
                      </td>
                      {/* <td width="33%">
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
                            color: secondaryColor,
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {formatDate(dueDate)}
                        </Text>
                      </td> */}
                      <td width="50%" className="text-right">
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
                            color: primaryColor,
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
                          style={{ color: secondaryColor, fontSize: "14px" }}
                        >
                          Subtotal
                        </Text>
                      </td>
                      <td width="40%" align="right">
                        <Text
                          style={{ color: secondaryColor, fontSize: "14px" }}
                        >
                          {formatCurrency(subtotal)}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td width="60%">
                        <Text
                          style={{ color: secondaryColor, fontSize: "14px" }}
                        >
                          Tax ({taxRate}%)
                        </Text>
                      </td>
                      <td width="40%" align="right">
                        <Text
                          style={{ color: secondaryColor, fontSize: "14px" }}
                        >
                          {formatCurrency(taxAmount)}
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td width="60%">
                        <Text
                          style={{
                            color: successColor,
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
                            color: successColor,
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
                  color: primaryColor,
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
                    backgroundColor: i % 2 === 0 ? accentColor : "#ffffff",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td width="70%">
                        <Text
                          style={{
                            color: secondaryColor,
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
                            color: secondaryColor,
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

              {/* Payment Options */}
              <Section style={{ marginTop: "32px" }}>
                <Heading
                  as="h3"
                  style={{
                    fontSize: "18px",
                    fontWeight: "500",
                    color: primaryColor,
                    marginBottom: "12px",
                  }}
                >
                  Payment Options
                </Heading>
                <div
                  style={{
                    backgroundColor: accentColor,
                    borderRadius: "8px",
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      color: secondaryColor,
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Bank Transfer:</strong> Make a direct transfer to
                    our account
                  </Text>
                  <Text
                    style={{
                      color: secondaryColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    Account Name: {process.env.ACCOUNT_NAME}
                  </Text>
                  <Text
                    style={{
                      color: secondaryColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    Bank: {process.env.BANK_NAME}
                  </Text>
                  <Text
                    style={{
                      color: secondaryColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    Account No: {process.env.ACCOUNT_NUMBER}
                  </Text>
                  <Text
                    style={{
                      color: secondaryColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    Branch Name:{process.env.BRANCH_NAME}
                  </Text>
                  <Text
                    style={{
                      color: secondaryColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    IFSC Code:{process.env.IFSC_CODE}
                  </Text>
                  <Text
                    style={{
                      color: secondaryColor,
                      fontSize: "14px",
                      margin: "4px 0",
                    }}
                  >
                    Reference: INV-{invoiceNumber}
                  </Text>

                  <Hr style={{ borderColor: "#e2e8f0", margin: "16px 0" }} />
                </div>
              </Section>
            </Section>

            {/* Footer */}
            <Section
              style={{
                backgroundColor: primaryColor,
                padding: "24px 40px",
                textAlign: "center",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                Need help with this invoice? Contact us at{" "}
                <a
                  href="mailto:info@gliggo.com"
                  style={{ color: "#ffffff", textDecoration: "underline" }}
                >
                  info@gliggo.com
                </a>
              </Text>
              <Text
                style={{
                  color: "#ffffff",
                  opacity: "0.8",
                  fontSize: "12px",
                  margin: "4px 0",
                }}
              >
                © 2025 Gliggo Inc, Inc. All rights reserved.
              </Text>
              <Text
                style={{
                  color: "#ffffff",
                  opacity: "0.8",
                  fontSize: "12px",
                  margin: "4px 0",
                }}
              >
                57/1-A VOC Nagar 2nd Cross Street, Anna Nagar East, Chennai- 600
                102, Tamil Nadu, India
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InvoiceEmail;

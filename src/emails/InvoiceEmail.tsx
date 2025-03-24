// emails/InvoiceEmail.tsx
import React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Invoice, InvoiceContents } from "@prisma/client";
// import { Invoice, InvoiceContents } from "@prisma/client";

// Define the props for our email
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

// Get status badge styling
const getStatusStyles = (status: string) => {
  switch (status) {
    case "PAID":
      return {
        backgroundColor: "#D1FAE5",
        color: "#065F46",
      };
    case "OVERDUE":
      return {
        backgroundColor: "#FEE2E2",
        color: "#B91C1C",
      };
    case "SENT":
      return {
        backgroundColor: "#DBEAFE",
        color: "#1E40AF",
      };
    case "DRAFT":
      return {
        backgroundColor: "#F3F4F6",
        color: "#374151",
      };
    case "CANCELLED":
      return {
        backgroundColor: "#FEF3C7",
        color: "#92400E",
      };
    default:
      return {
        backgroundColor: "#F3F4F6",
        color: "#374151",
      };
  }
};

export const InvoiceEmail = ({
  invoice,
  previewUrl = "https://your-app.com/invoice/preview",
}: InvoiceEmailProps) => {
  const {
    invoiceNumber,
    status,
    clientName,
    clientEmail,
    clientPhone,
    clientAddress,
    dueDate,
    subtotal,
    taxRate,
    taxAmount,
    invoiceTotal,
    invoiceContents,
    createdAt,
  } = invoice;

  const statusStyle = getStatusStyles(status);

  return (
    <Html>
      <Head>
        <title>{`Invoice ${invoice.invoiceNumber}`}</title>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        Your invoice #{invoiceNumber} for ${invoiceTotal.toFixed(2)} is ready
      </Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded-lg p-8 my-10 mx-auto max-w-[600px]">
            {/* Header with Logo */}
            <Section className="mt-4">
              <Row>
                <Column>
                  <Img
                    src="https://your-company.com/logo.png"
                    width="120"
                    height="50"
                    alt="Your Company"
                    className="object-contain"
                  />
                </Column>
                <Column align="right">
                  <div
                    style={{
                      padding: "4px 12px",
                      borderRadius: "16px",
                      display: "inline-block",
                      backgroundColor: statusStyle.backgroundColor,
                      color: statusStyle.color,
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    {status}
                  </div>
                </Column>
              </Row>
            </Section>

            {/* Invoice Heading */}
            <Section className="mt-1">
              <Heading className="text-2xl font-bold text-gray-800 mb-0">
                Invoice #{invoiceNumber}
              </Heading>
              <Text className="text-gray-500 mt-1">
                Issued on {formatDate(createdAt)} • Due {formatDate(dueDate)}
              </Text>
            </Section>

            {/* Client & Company Info */}
            <Section className="">
              <Row>
                <Column className="pr-1">
                  <Text className="text-xs font-medium text-gray-500 uppercase">
                    Bill To
                  </Text>
                  <Text className="text-base font-medium text-gray-800 mt-2">
                    {clientName}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {clientEmail}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {clientPhone}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1 whitespace-pre-line ">
                    {clientAddress}
                  </Text>
                </Column>
                <Column>
                  <Text className="text-xs font-medium text-gray-500 uppercase">
                    From
                  </Text>
                  <Text className="text-base font-medium text-gray-800 mt-2">
                    Your Company, Inc.
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    contact@yourcompany.com
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    +1 (555) 123-4567
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    123 Business Street
                    <br />
                    City, State ZIP
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Invoice Summary Card */}
            <Section className="mt-2">
              <div
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: "8px",
                  padding: "24px",
                  marginTop: "24px",
                }}
              >
                <Heading
                  as="h3"
                  className="text-lg font-semibold text-gray-800 mb-4"
                >
                  Invoice Summary
                </Heading>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          borderBottom: "1px solid #E5E7EB",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#6B7280",
                        }}
                      >
                        Description
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "12px 16px",
                          borderBottom: "1px solid #E5E7EB",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#6B7280",
                          width: "100px",
                        }}
                      >
                        Qty
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "12px 16px",
                          borderBottom: "1px solid #E5E7EB",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#6B7280",
                          width: "120px",
                        }}
                      >
                        Price
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "12px 16px",
                          borderBottom: "1px solid #E5E7EB",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#6B7280",
                          width: "120px",
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceContents.map(
                      (
                        item: {
                          description: string;
                          quantity: number;
                          price: number;
                          total: number;
                        },
                        index: number
                      ) => (
                        <tr key={index}>
                          <td
                            style={{
                              padding: "16px",
                              borderBottom:
                                index === invoiceContents.length - 1
                                  ? "none"
                                  : "1px solid #E5E7EB",
                              fontSize: "14px",
                              color: "#374151",
                            }}
                          >
                            {item.description}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "16px",
                              borderBottom:
                                index === invoiceContents.length - 1
                                  ? "none"
                                  : "1px solid #E5E7EB",
                              fontSize: "14px",
                              color: "#374151",
                            }}
                          >
                            {item.quantity}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "16px",
                              borderBottom:
                                index === invoiceContents.length - 1
                                  ? "none"
                                  : "1px solid #E5E7EB",
                              fontSize: "14px",
                              color: "#374151",
                            }}
                          >
                            {formatCurrency(item.price)}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              padding: "16px",
                              borderBottom:
                                index === invoiceContents.length - 1
                                  ? "none"
                                  : "1px solid #E5E7EB",
                              fontSize: "14px",
                              color: "#374151",
                            }}
                          >
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      )
                    )}{" "}
                  </tbody>{" "}
                </table>

                {/* Totals */}
                <div style={{ marginTop: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                    }}
                  >
                    <Text className="text-sm text-gray-600">Subtotal</Text>
                    <Text className="text-sm text-gray-800">
                      {formatCurrency(subtotal)}
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                    }}
                  >
                    <Text className="text-sm text-gray-600">
                      Tax ({taxRate}%)
                    </Text>
                    <Text className="text-sm text-gray-800">
                      {formatCurrency(taxAmount)}
                    </Text>
                  </div>
                  <Hr style={{ margin: "16px 0", borderColor: "#E5E7EB" }} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                    }}
                  >
                    <Text className="text-base font-semibold text-gray-800">
                      Total Due
                    </Text>
                    <Text className="text-base font-semibold text-purple-600">
                      {formatCurrency(invoiceTotal)}
                    </Text>
                  </div>
                </div>
              </div>
            </Section>

            {/* Call to Action Buttons */}
            <Section className="mt-8 text-center">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-md"
                href={`${previewUrl}/${invoice.id}`}
              >
                View Invoice
              </Button>
              <div className="mt-4">
                <Link
                  href="#"
                  className="text-sm text-gray-500 underline hover:text-gray-700"
                >
                  Download PDF
                </Link>
              </div>
            </Section>

            {/* Payment Instructions */}
            <Section className="mt-8 mb-8">
              <div
                style={{
                  padding: "16px",
                  borderLeft: "4px solid #8B5CF6",
                  backgroundColor: "#F5F3FF",
                  borderRadius: "0 4px 4px 0",
                }}
              >
                <Text className="text-sm font-medium text-gray-900 mb-2">
                  Payment Instructions
                </Text>
                <Text className="text-sm text-gray-700">
                  Please make payment via bank transfer using the following
                  details:
                </Text>
                <div className="mt-2 text-sm text-gray-700">
                  <div>Bank: Bank of America</div>
                  <div>Account Name: Your Company, Inc.</div>
                  <div>Account Number: XXXX-XXXX-XXXX-XXXX</div>
                  <div>Routing Number: XXXXXXXX</div>
                  <div className="mt-2">
                    Reference: Invoice #{invoiceNumber}
                  </div>
                </div>
              </div>
            </Section>

            <Hr style={{ margin: "32px 0", borderColor: "#E5E7EB" }} />

            {/* Footer */}
            <Section>
              <Text className="text-center text-xs text-gray-500">
                If you have any questions about this invoice, please contact
              </Text>
              <Text className="text-center text-xs text-gray-500">
                <Link
                  href="mailto:billing@yourcompany.com"
                  className="text-purple-600 hover:text-purple-500"
                >
                  billing@yourcompany.com
                </Link>{" "}
                or call us at +1 (555) 123-4567
              </Text>
              <Text className="text-center text-xs text-gray-500 mt-4">
                © 2025 Your Company, Inc. All rights reserved.
              </Text>
              <Text className="text-center text-xs text-gray-500 mt-2">
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

// seed.ts
import { PrismaClient, TransactionType, PaymentMethodType, InvoiceStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { formatDate } from 'date-fns';

const prisma = new PrismaClient();

const CATEGORIES = [
    { id: 1, name: "Office Supplies" },
    { id: 2, name: "Computer Hardware" },
    { id: 3, name: "Software & Licenses" },
    { id: 4, name: "Printing & Stationery" },
    { id: 5, name: "Office Furniture" },
    { id: 6, name: "Electricity Bills" },
    { id: 7, name: "Internet & Telecom" },
    { id: 8, name: "Water Bills" },
    { id: 9, name: "Rent & Lease" },
    { id: 10, name: "Office Maintenance" },
    { id: 11, name: "Salaries & Wages" },
    { id: 12, name: "Employee Benefits" },
    { id: 13, name: "Training & Development" },
    { id: 14, name: "Travel & Transportation" },
    { id: 15, name: "Medical & Insurance" },
    { id: 16, name: "Legal Services" },
    { id: 17, name: "Accounting Services" },
    { id: 18, name: "Consulting Fees" },
    { id: 19, name: "IT Services" },
    { id: 20, name: "Security Services" },
    { id: 21, name: "Advertising" },
    { id: 22, name: "Marketing Materials" },
    { id: 23, name: "Events & Conferences" },
    { id: 24, name: "Client Entertainment" },
    { id: 25, name: "Promotional Items" },
    { id: 26, name: "Cloud Services" },
    { id: 27, name: "Website Maintenance" },
    { id: 28, name: "Software Subscriptions" },
    { id: 29, name: "Data Storage" },
    { id: 30, name: "Cybersecurity" },
    { id: 31, name: "Cleaning Services" },
    { id: 32, name: "Building Repairs" },
    { id: 33, name: "HVAC Maintenance" },
    { id: 34, name: "Pest Control" },
    { id: 35, name: "Waste Management" },
    { id: 36, name: "Office Pantry" },
    { id: 37, name: "Staff Meals" },
    { id: 38, name: "Client Meetings F&B" },
    { id: 39, name: "Events Catering" },
    { id: 40, name: "Water Supply" },
    { id: 41, name: "Licenses & Permits" },
    { id: 42, name: "Registration Fees" },
    { id: 43, name: "Government Charges" },
    { id: 44, name: "Certification Costs" },
    { id: 45, name: "Compliance Fees" },
    { id: 46, name: "Office Insurance" },
    { id: 47, name: "Courier & Postage" },
    { id: 48, name: "Vehicle Maintenance" },
    { id: 49, name: "Books & Subscriptions" },
    { id: 50, name: "Petty Cash Expenses" },
    { id: 51, name: "Product Sales" },
    { id: 52, name: "Service Revenue" },
    { id: 53, name: "Subscription Revenue" },
    { id: 54, name: "Commission Income" },
    { id: 55, name: "Affiliate Earnings" },
    { id: 56, name: "Software Development" },
    { id: 57, name: "App Development" },
    { id: 58, name: "SaaS Revenue" },
    { id: 59, name: "Software Licensing" },
    { id: 60, name: "Open Source Donations" },
    { id: 61, name: "Website Development" },
    { id: 62, name: "E-commerce Development" },
    { id: 63, name: "Web Hosting Services" },
    { id: 64, name: "SEO & Digital Marketing" },
    { id: 65, name: "UI/UX Design Services" },
    { id: 66, name: "Accounting Services" },
    { id: 67, name: "Bookkeeping Fees" },
    { id: 68, name: "Tax Advisory Fees" },
    { id: 69, name: "Payroll Services" },
    { id: 70, name: "Financial Consulting" },
    { id: 71, name: "IT Consulting" },
    { id: 72, name: "Cloud Migration Services" },
    { id: 73, name: "Cybersecurity Services" },
    { id: 74, name: "Tech Support" },
    { id: 75, name: "Freelance Software Projects" },
    { id: 76, name: "AI & ML Development" },
    { id: 77, name: "API Development & Integration" },
    { id: 78, name: "Invoice" },
    {
        id: 79, name: "Conveyance",

    },
    {
        id: 80, name: "Rent",

    }
];



const TAX_TYPES = [
    // GST Rates in India
    { id: "GST-0", name: "GST Exempt", rate: 0 },
    { id: "GST-5", name: "GST 5%", rate: 0.05 },
    { id: "GST-12", name: "GST 12%", rate: 0.12 },
    { id: "GST-18", name: "GST 18%", rate: 0.18 },
    { id: "GST-28", name: "GST 28%", rate: 0.28 },

    // Special GST Categories
    { id: "IGST", name: "IGST", rate: 0.18 }, // Interstate GST
    { id: "CGST", name: "CGST", rate: 0.09 }, // Central GST
    { id: "SGST", name: "SGST", rate: 0.09 }, // State GST
    { id: "UTGST", name: "UTGST", rate: 0.09 }, // Union Territory GST

    // Composite Schemes
    { id: "COMP-1", name: "Composition 1%", rate: 0.01 },
    { id: "COMP-5", name: "Composition 5%", rate: 0.05 },

    // Special Economic Zone
    { id: "SEZ", name: "SEZ (Zero)", rate: 0 },

    // TDS/TCS
    { id: "TDS-2", name: "TDS 2%", rate: 0.02 },
    { id: "TCS-1", name: "TCS 1%", rate: 0.01 },
];

const FY_PERIODS = [
    { start: new Date('2024-04-01'), end: new Date('2025-03-31') },
    { start: new Date('2025-04-01'), end: new Date('2026-03-31') },
    { start: new Date('2026-04-01'), end: new Date('2027-03-31') }
];
// const FY_END = new Date('2026-03-31');

async function seed() {
    try {
        // Create single user (same credentials)
        const user = await prisma.user.upsert({
            where: { email: 'v@gmail.com' },
            update: {},
            create: {
                email: 'v@gmail.com',
                password: '$2a$10$dXiqQMkG6VPIarSr8WKeT.UZLRch.Z0lKa5Q0WOPvXoSdwlouaIU.',
                role: 'USER',
                sessions: {
                    create: {
                        id: 'seed-session-1',
                        expiresAt: faker.date.future(),
                    }
                }
            },
        });

        // Create 50 clients
        const clients = [];
        for (let i = 0; i < 30; i++) {
            const client = await prisma.client.create({
                data: {
                    name: faker.person.fullName(),
                    companyName: i % 2 === 0 ? faker.company.name() : undefined,
                    email: faker.internet.email(),
                    phone1: faker.phone.number(),
                    phone2: i % 3 === 0 ? faker.phone.number() : undefined,
                    streetName: faker.location.streetAddress(),
                    city: faker.location.city(),
                    state: faker.location.state(),
                    zip: faker.location.zipCode(),
                    country: faker.location.country(),
                    user: { connect: { id: user.id } }
                }
            });
            clients.push(client);
        }

        const transactions = [];
        const paymentMethods = ['CASH', 'BANK', 'CHEQUE', 'INVOICE'] as const;

        // Create transactions for each fiscal year
        for (const fiscalYear of FY_PERIODS) {
            // Generate array of months in the financial year
            const months = Array.from({ length: 12 }, (_, index) => {
                const start = new Date(fiscalYear.start);
                start.setMonth(fiscalYear.start.getMonth() + index);
                const end = new Date(start);
                end.setMonth(end.getMonth() + 1);
                end.setDate(0); // Last day of the month
                return { start, end };
            });

            // Create transactions for each month
            for (const { start: monthStart, end: monthEnd } of months) {
                // Create 10 transactions per month, ensuring all payment methods are covered
                for (let i = 0; i < 10; i++) {
                    // Determine transaction type - alternate between income and expense
                    const type = i % 2 === 0 ? TransactionType.INCOME : TransactionType.EXPENSE;

                    // Ensure all payment methods are covered by cycling through them
                    const method = paymentMethods[i % paymentMethods.length];

                    const transaction = await createTransaction(
                        type,
                        method,
                        monthStart,
                        monthEnd
                    );

                    transactions.push(transaction);
                }
            }
        }

        // Helper function to create transactions
        async function createTransaction(
            type: TransactionType,
            method: typeof paymentMethods[number],
            monthStart: Date,
            monthEnd: Date
        ) {
            const amount = faker.number.float({
                min: 1000,
                max: 50000,
                fractionDigits: 2
            });
            const taxType = faker.helpers.arrayElement(TAX_TYPES);
            const category = faker.helpers.arrayElement(CATEGORIES);

            const paymentDetails = {
                type: PaymentMethodType[method],
                ...(method === 'CASH' && {
                    receivedBy: faker.person.fullName(),
                    bankName: null,
                    chequeNo: null,
                    chequeDate: null,
                    invoiceNo: null
                }),
                ...(method === 'BANK' && {
                    bankName: faker.company.name(),
                    transferMode: faker.helpers.arrayElement(['NEFT', 'RTGS', 'IMPS', 'UPI']),
                    receivedBy: null,
                    chequeNo: null,
                    chequeDate: null,
                    invoiceNo: null
                }),
                ...(method === 'CHEQUE' && {
                    chequeNo: `CHQ${faker.string.numeric(8)}`,
                    chequeDate: faker.date.future({ years: 1 }),
                    receivedBy: null,
                    bankName: null,
                    invoiceNo: null
                }),
                ...(method === 'INVOICE' && {
                    invoiceNo: `INV-${faker.string.alphanumeric(6).toUpperCase()}`,
                    receivedBy: null,
                    bankName: null,
                    chequeNo: null,
                    chequeDate: null
                })
            };

            return prisma.transaction.create({
                data: {
                    type,
                    name: `${type} Transaction ${method} ${formatDate(monthStart, 'MMM yyyy')}`,
                    description: faker.finance.transactionDescription(),
                    amount,
                    tax: taxType.id,
                    total: amount + (amount * taxType.rate),
                    date: faker.date.between({
                        from: monthStart,
                        to: monthEnd
                    }),
                    category: category.name,
                    user: { connect: { id: user.id } },
                    attachments: {
                        create: Math.random() < 0.25 ? [{
                            url: faker.internet.url()
                        }] : undefined
                    },
                    paymentMethod: {
                        create: paymentDetails
                    }
                }
            });
        }

        // Create 20 invoices with proper tax types
        const invoices = [];
        for (let i = 0; i < 45; i++) {
            const client = clients[i % clients.length];
            const taxType = faker.helpers.arrayElement(TAX_TYPES);
            const invoiceContents = Array.from({ length: faker.number.int({ min: 5, max: 10 }) }, () => ({
                description: faker.commerce.productDescription(),
                total: faker.number.float({ min: 500, max: 15000, fractionDigits: 2 })
            }));

            const subtotal = invoiceContents.reduce((sum, item) => sum + item.total, 0);
            const taxAmount = subtotal * taxType.rate;

            const invoice = await prisma.invoice.create({
                data: {
                    invoiceNumber: `GT-INV-${(i + 1).toString().padStart(4, '0')}`,
                    status: InvoiceStatus[i < 5 ? 'PAID' : i < 10 ? 'SENT' : 'DRAFT'],
                    clientName: client.name || '',
                    clientCompanyName: client.companyName || '',
                    clientEmail: client.email,
                    clientPhone1: client.phone1,
                    clientPhone2: client.phone2 ?? undefined,
                    clientStreetName: client.streetName,
                    clientCity: client.city,
                    clientState: client.state,
                    clientZip: client.zip,
                    clientCountry: client.country,
                    subtotal,
                    taxRate: taxType.rate * 100,
                    taxAmount,
                    invoiceTotal: subtotal + taxAmount,
                    user: { connect: { id: user.id } },
                    client: { connect: { id: client.id } },
                    invoiceContents: {
                        createMany: {
                            data: invoiceContents
                        }
                    }
                }
            });
            invoices.push(invoice);
        }

        // const employees = [];


        // for (let i = 0; i < 5; i++) {
        //     const firstName = faker.person.firstName();
        //     const lastName = faker.person.lastName();
        //     const employee = await prisma.employee.create({
        //         data: {
        //             name: `${firstName} ${lastName}`,
        //             email: faker.internet.email({ firstName, lastName, provider: 'company.com' }),
        //             userId: user.id
        //         }
        //     });
        //     employees.push(employee);
        // }




        console.log('Successfully seeded for FY 2025-2026:');
        // console.log(`- ${employees.length} employees`);
        console.log(`- 1 user`);
        console.log(`- ${clients.length} clients`);
        console.log(`- ${transactions.length} transactions`);
        console.log(`- ${invoices.length} invoices`);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
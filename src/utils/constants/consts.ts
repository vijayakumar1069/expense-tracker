// utils/constants/consts.ts
import { LayoutDashboard, Receipt, Wallet, FileText } from "lucide-react";
import { NavItem } from "../types";


export const adminNavbarValues: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Expenses",
        href: "/New-Expenses",
        icon: Receipt
    },
    {
        title: "Income",
        href: "/New-Incomes",
        icon: Wallet
    },
    {
        title: "Invoices",
        href: "/New-Invoices",
        icon: FileText
    }
];


// Constants (same as before)
export const CATEGORIES = [
    // Office Supplies & Equipment
    { id: 1, name: "Office Supplies" },
    { id: 2, name: "Computer Hardware" },
    { id: 3, name: "Software & Licenses" },
    { id: 4, name: "Printing & Stationery" },
    { id: 5, name: "Office Furniture" },

    // Utilities & Services
    { id: 6, name: "Electricity Bills" },
    { id: 7, name: "Internet & Telecom" },
    { id: 8, name: "Water Bills" },
    { id: 9, name: "Rent & Lease" },
    { id: 10, name: "Office Maintenance" },

    // Employee Related
    { id: 11, name: "Salaries & Wages" },
    { id: 12, name: "Employee Benefits" },
    { id: 13, name: "Training & Development" },
    { id: 14, name: "Travel & Transportation" },
    { id: 15, name: "Medical & Insurance" },

    // Professional Services
    { id: 16, name: "Legal Services" },
    { id: 17, name: "Accounting Services" },
    { id: 18, name: "Consulting Fees" },
    { id: 19, name: "IT Services" },
    { id: 20, name: "Security Services" },

    // Marketing & Sales
    { id: 21, name: "Advertising" },
    { id: 22, name: "Marketing Materials" },
    { id: 23, name: "Events & Conferences" },
    { id: 24, name: "Client Entertainment" },
    { id: 25, name: "Promotional Items" },

    // Technology
    { id: 26, name: "Cloud Services" },
    { id: 27, name: "Website Maintenance" },
    { id: 28, name: "Software Subscriptions" },
    { id: 29, name: "Data Storage" },
    { id: 30, name: "Cybersecurity" },

    // Facility Management
    { id: 31, name: "Cleaning Services" },
    { id: 32, name: "Building Repairs" },
    { id: 33, name: "HVAC Maintenance" },
    { id: 34, name: "Pest Control" },
    { id: 35, name: "Waste Management" },

    // Food & Beverages
    { id: 36, name: "Office Pantry" },
    { id: 37, name: "Staff Meals" },
    { id: 38, name: "Client Meetings F&B" },
    { id: 39, name: "Events Catering" },
    { id: 40, name: "Water Supply" },

    // Documentation & Compliance
    { id: 41, name: "Licenses & Permits" },
    { id: 42, name: "Registration Fees" },
    { id: 43, name: "Government Charges" },
    { id: 44, name: "Certification Costs" },
    { id: 45, name: "Compliance Fees" },

    // Miscellaneous Office
    { id: 46, name: "Office Insurance" },
    { id: 47, name: "Courier & Postage" },
    { id: 48, name: "Vehicle Maintenance" },
    { id: 49, name: "Books & Subscriptions" },
    { id: 50, name: "Petty Cash Expenses" },
];

export const TAX_TYPES = [
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

export const PAYMENT_METHODS = [
    { id: "CASH", name: "CASH" },
    { id: "BANK", name: "BANK" },
    { id: "CHEQUE", name: "CHEQUE" },
];


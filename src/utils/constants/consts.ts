// utils/constants/consts.ts
import { LayoutDashboard, Receipt, Wallet, FileText } from "lucide-react";
import { NavItem } from "../types";

import {
    Monitor, FileCode, Printer, Armchair,
    Zap, Wifi, Droplets, Building, Wrench,
    Users, Heart, GraduationCap, Car, Stethoscope,
    Scale, Calculator, BrainCircuit, Server, Shield,
    Megaphone, Palette, CalendarDays, PartyPopper, Gift,
    Cloud, Globe, FileKey, Database, Lock,
    Brush, Hammer, Fan, Bug, Recycle,
    UtensilsCrossed, Projector, ChefHat, Coffee,
    FileCheck, FileBadge, Landmark, Award, FileWarning,
    FileStack, Truck, CarFront, BookOpen
} from "lucide-react";
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


export const CATEGORIES = [
    // Office Supplies & Equipment
    { id: 1, name: "Office Supplies", icon: Receipt, color: "#2563eb" },
    { id: 2, name: "Computer Hardware", icon: Monitor, color: "#7c3aed" },
    { id: 3, name: "Software & Licenses", icon: FileCode, color: "#059669" },
    { id: 4, name: "Printing & Stationery", icon: Printer, color: "#dc2626" },
    { id: 5, name: "Office Furniture", icon: Armchair, color: "#d97706" },

    // Utilities & Services
    { id: 6, name: "Electricity Bills", icon: Zap, color: "#ea580c" },
    { id: 7, name: "Internet & Telecom", icon: Wifi, color: "#0284c7" },
    { id: 8, name: "Water Bills", icon: Droplets, color: "#0891b2" },
    { id: 9, name: "Rent & Lease", icon: Building, color: "#4f46e5" },
    { id: 10, name: "Office Maintenance", icon: Wrench, color: "#b45309" },

    // Employee Related
    { id: 11, name: "Salaries & Wages", icon: Users, color: "#0f766e" },
    { id: 12, name: "Employee Benefits", icon: Heart, color: "#be185d" },
    { id: 13, name: "Training & Development", icon: GraduationCap, color: "#7e22ce" },
    { id: 14, name: "Travel & Transportation", icon: Car, color: "#a16207" },
    { id: 15, name: "Medical & Insurance", icon: Stethoscope, color: "#be123c" },

    // Professional Services
    { id: 16, name: "Legal Services", icon: Scale, color: "#1d4ed8" },
    { id: 17, name: "Accounting Services", icon: Calculator, color: "#4338ca" },
    { id: 18, name: "Consulting Fees", icon: BrainCircuit, color: "#0f766e" },
    { id: 19, name: "IT Services", icon: Server, color: "#4c1d95" },
    { id: 20, name: "Security Services", icon: Shield, color: "#9f1239" },

    // Marketing & Sales
    { id: 21, name: "Advertising", icon: Megaphone, color: "#c2410c" },
    { id: 22, name: "Marketing Materials", icon: Palette, color: "#9333ea" },
    { id: 23, name: "Events & Conferences", icon: CalendarDays, color: "#0369a1" },
    { id: 24, name: "Client Entertainment", icon: PartyPopper, color: "#c026d3" },
    { id: 25, name: "Promotional Items", icon: Gift, color: "#e11d48" },

    // Technology
    { id: 26, name: "Cloud Services", icon: Cloud, color: "#0284c7" },
    { id: 27, name: "Website Maintenance", icon: Globe, color: "#4f46e5" },
    { id: 28, name: "Software Subscriptions", icon: FileKey, color: "#7c3aed" },
    { id: 29, name: "Data Storage", icon: Database, color: "#0f766e" },
    { id: 30, name: "Cybersecurity", icon: Lock, color: "#be185d" },

    // Facility Management
    { id: 31, name: "Cleaning Services", icon: Brush, color: "#0891b2" },
    { id: 32, name: "Building Repairs", icon: Hammer, color: "#b45309" },
    { id: 33, name: "HVAC Maintenance", icon: Fan, color: "#1d4ed8" },
    { id: 34, name: "Pest Control", icon: Bug, color: "#7e22ce" },
    { id: 35, name: "Waste Management", icon: Recycle, color: "#15803d" },

    // Food & Beverages
    { id: 36, name: "Office Pantry", icon: Coffee, color: "#ca8a04" },
    { id: 37, name: "Staff Meals", icon: UtensilsCrossed, color: "#ea580c" },
    { id: 38, name: "Client Meetings F&B", icon: Projector, color: "#0f766e" },
    { id: 39, name: "Events Catering", icon: ChefHat, color: "#be185d" },
    { id: 40, name: "Water Supply", icon: Coffee, color: "#1d4ed8" },

    // Documentation & Compliance
    { id: 41, name: "Licenses & Permits", icon: FileCheck, color: "#4338ca" },
    { id: 42, name: "Registration Fees", icon: FileBadge, color: "#9333ea" },
    { id: 43, name: "Government Charges", icon: Landmark, color: "#0369a1" },
    { id: 44, name: "Certification Costs", icon: Award, color: "#059669" },
    { id: 45, name: "Compliance Fees", icon: FileWarning, color: "#dc2626" },

    // Miscellaneous Office
    { id: 46, name: "Office Insurance", icon: FileStack, color: "#7c3aed" },
    { id: 47, name: "Courier & Postage", icon: Truck, color: "#c026d3" },
    { id: 48, name: "Vehicle Maintenance", icon: CarFront, color: "#0f766e" },
    { id: 49, name: "Books & Subscriptions", icon: BookOpen, color: "#b45309" },
    { id: 50, name: "Petty Cash Expenses", icon: Wallet, color: "#be123c" },
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
    { id: "INVOICE", name: "INVOICE" },
];


export const TRANSACTION_TYPES = [
    { id: "EXPENSE", name: "EXPENSE" },
    { id: "INCOME", name: "INCOME" },
];
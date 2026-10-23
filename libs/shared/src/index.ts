export type Status =
  | "Paid"
  | "Pending"
  | "Overdue"
  | "Draft"
  | "Approved"
  | "Delivered";
export interface Customer {
  id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  initials: string;
  color: string;
}
export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
}
/**
 * Business invoice record shared by persistence, routes, and amount calculations.
 * Dates remain ISO date-only strings; localization must not rewrite stored data.
 */
export interface Invoice {
  id: string;
  customerId: string;
  date: string;
  due: string;
  status: Status;
  currency: string;
  items: LineItem[];
}
export const customers: Customer[] = [
  {
    id: "c1",
    name: "Northstar Studio",
    email: "finance@northstar.example",
    contact: "Olivia Bennett",
    address: "24 Alder Street, London, United Kingdom",
    initials: "NS",
    color: "#6475c8",
  },
  {
    id: "c2",
    name: "Meridian Labs",
    email: "accounts@meridian.example",
    contact: "James Walker",
    address: "180 Market Street, Boston, United States",
    initials: "ML",
    color: "#bc8255",
  },
  {
    id: "c3",
    name: "Forma Collective",
    email: "billing@forma.example",
    contact: "Sophie Laurent",
    address: "12 Rue des Arts, Paris, France",
    initials: "FC",
    color: "#588f80",
  },
  {
    id: "c4",
    name: "Acme Technologies",
    email: "finance@acme.example",
    contact: "Ethan Brooks",
    address: "48 Pine Avenue, Austin, United States",
    initials: "AT",
    color: "#9c74aa",
  },
  {
    id: "c5",
    name: "Evergreen & Co.",
    email: "hello@evergreen.example",
    contact: "Emma Wilson",
    address: "9 Harbor Road, Dublin, Ireland",
    initials: "EC",
    color: "#538ca7",
  },
  {
    id: "c6",
    name: "Summit Partners",
    email: "ap@summit.example",
    contact: "Lucas Martin",
    address: "71 Oak Lane, Amsterdam, Netherlands",
    initials: "SP",
    color: "#bd9261",
  },
];
/**
 * Create the deterministic 24-invoice fixture used when browser storage is empty.
 * The first record is INV-2026-1048; fixture ordering is also the initial list order.
 */
export const seedInvoices: Invoice[] = Array.from({ length: 24 }, (_, i) => ({
  id: `INV-${2026}-${String(1048 - i).padStart(4, "0")}`,
  customerId: customers[i % 6].id,
  date:
    i % 6 === 3
      ? "2026-09-20"
      : `2026-10-${String(10 - (i % 9)).padStart(2, "0")}`,
  due:
    i % 6 === 3
      ? "2026-10-05"
      : `2026-10-${String(20 + (i % 9)).padStart(2, "0")}`,
  status: (["Pending", "Paid", "Paid", "Overdue", "Draft", "Paid"] as Status[])[
    i % 6
  ],
  currency: "USD",
  items: [
    {
      description: [
        "Brand strategy & consulting",
        "Platform development",
        "Design system retainer",
        "Infrastructure services",
      ][i % 4],
      quantity: 1,
      rate: [4800, 8250, 3200, 6400, 1800, 12500][i % 6],
    },
  ],
}));
/**
 * Calculate a subtotal from quantity multiplied by rate for every line item.
 * @param invoice - Any object with the invoice line-item shape, including an order.
 * @returns The numeric sum; formatting and currency conversion are not performed.
 */
export const total = (invoice: Pick<Invoice, "items">) =>
  invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
/**
 * Format an amount using the established English financial presentation.
 * @param value - Numeric amount, without conversion or rounding of stored data.
 * @param currency - Intl currency code; defaults to USD.
 * @returns A display string; Arabic UI labels do not change this formatter.
 */
export const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
/**
 * Resolve a fixture customer ID referenced by an invoice.
 * @param id - An existing fixture customer ID.
 * @returns The matching customer. The non-null assertion assumes fixture integrity.
 */
export const customerFor = (id: string) => customers.find((c) => c.id === id)!;
const storageKey = "atlas-invoices-v1";
/**
 * Provide an asynchronous API-shaped facade over browser localStorage.
 * Reads fall back to seed fixtures; creation checks IDs and persists the new collection.
 * This demo has no network backend and does not translate stored business values.
 */
export const mockApi = {
  async listInvoices(): Promise<Invoice[]> {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [...seedInvoices];
  },
  async createInvoice(invoice: Invoice) {
    const current = await this.listInvoices();
    if (current.some((i) => i.id === invoice.id))
      throw new Error("Invoice already exists");
    localStorage.setItem(storageKey, JSON.stringify([invoice, ...current]));
    return invoice;
  },
};
/**
 * Build nine deterministic procurement records for list and detail routes.
 * The line-item shape intentionally allows reuse of the invoice total helper.
 */
export const purchaseOrders = Array.from({ length: 9 }, (_, i) => ({
  id: `PO-2026-${402 - i}`,
  supplier: [
    "Papertrail Supplies",
    "Cloudforge Systems",
    "Fieldwork Equipment",
  ][i % 3],
  date: "2026-10-08",
  status: (["Pending", "Approved", "Delivered"] as Status[])[i % 3],
  items: [
    {
      description: [
        "Office supplies — quarterly order",
        "Cloud infrastructure — annual license",
        "Workspace equipment",
      ][i % 3],
      quantity: 1,
      rate: [2450, 18600, 7200][i % 3],
    },
  ],
}));

export { LocaleProvider, DemoControls, useLocale } from "./i18n";

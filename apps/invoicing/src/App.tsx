import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AppShell, EmptyState } from "@atlas/design-system";
import { mockApi, type Invoice } from "@atlas/shared";
import { Dashboard } from "./pages/Dashboard";
import { Invoices } from "./pages/Invoices";
import { InvoiceDetails } from "./pages/InvoiceDetails";
import { CreateInvoice } from "./pages/CreateInvoice";
import { Customers } from "./pages/Customers";
import { Settings } from "./pages/Settings";
export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    mockApi
      .listInvoices()
      .then(setInvoices)
      .finally(() => setLoaded(true));
  }, []);
  const { pathname } = useLocation();
  const title =
    pathname === "/"
      ? "Overview"
      : pathname.startsWith("/invoices")
        ? "Invoices"
        : pathname.startsWith("/customers")
          ? "Customers"
          : "Settings";
  return (
    <AppShell title={title}>
      {loaded ? (
        <Routes>
          <Route path="/" element={<Dashboard invoices={invoices} />} />
          <Route path="/invoices" element={<Invoices invoices={invoices} />} />
          <Route
            path="/invoices/new"
            element={
              <CreateInvoice
                onCreated={(i) => setInvoices((current) => [i, ...current])}
              />
            }
          />
          <Route
            path="/invoices/:id"
            element={<InvoiceDetails invoices={invoices} />}
          />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="*"
            element={
              <EmptyState
                title="Page not found"
                description="Choose a page from the sidebar."
              />
            }
          />
        </Routes>
      ) : (
        <p>Loading your workspace…</p>
      )}
    </AppShell>
  );
}

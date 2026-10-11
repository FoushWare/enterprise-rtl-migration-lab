import { useState } from "react";
import { MenuItem, Pagination } from "@mui/material";
import { Card, FormField } from "@atlas/design-system";
import { customerFor, type Invoice } from "@atlas/shared";
import { Heading, CreateButton } from "../components/InvoiceUi";
import { InvoiceTable } from "../components/InvoiceTable";
export function Invoices({ invoices }: { invoices: Invoice[] }) {
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("All statuses"),
    [page, setPage] = useState(1);
  const filtered = invoices.filter(
    (i) =>
      (status === "All statuses" || i.status === status) &&
      `${i.id} ${customerFor(i.customerId).name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        title="Invoices"
        description="Manage your invoices, track payments, and keep business moving."
        action={<CreateButton />}
      />
      <Card>
        <div className="toolbar">
          <FormField
            className="search"
            label="Search invoices"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <FormField
            select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            sx={{ width: 180 }}
          >
            {["All statuses", "Paid", "Pending", "Overdue", "Draft"].map(
              (s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ),
            )}
          </FormField>
          <span className="hint" style={{ marginLeft: "auto" }}>
            {filtered.length} invoices
          </span>
        </div>
        <InvoiceTable invoices={filtered.slice((page - 1) * 8, page * 8)} />
        <div className="pagination">
          <span>
            {filtered.length
              ? `${(page - 1) * 8 + 1}–${Math.min(page * 8, filtered.length)} of ${filtered.length}`
              : "0 results"}
          </span>
          <Pagination
            size="small"
            page={page}
            count={Math.max(1, Math.ceil(filtered.length / 8))}
            onChange={(_, p) => setPage(p)}
          />
        </div>
      </Card>
    </>
  );
}

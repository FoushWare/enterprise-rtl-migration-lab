import { useParams } from "react-router-dom";
import {
  Card,
  Button,
  StatusBadge,
  DataTable,
  EmptyState,
} from "@atlas/design-system";
import { customerFor, money, total, type Invoice } from "@atlas/shared";
import { Heading } from "../components/InvoiceUi";
export function InvoiceDetails({ invoices }: { invoices: Invoice[] }) {
  const { id } = useParams();
  const i = invoices.find((i) => i.id === id);
  if (!i)
    return (
      <EmptyState
        title="Invoice not found"
        description="Return to Invoices to select an existing invoice."
      />
    );
  const c = customerFor(i.customerId);
  return (
    <>
      <Heading
        title={i.id}
        description={`Invoice for ${c.name}`}
        action={
          <Button variant="outlined" onClick={() => window.print()}>
            Print invoice
          </Button>
        }
      />
      <Card className="card-pad">
        <StatusBadge status={i.status} />
        <div className="detail-grid">
          <div>
            <small>BILL TO</small>
            <h3>{c.name}</h3>
            <p>{c.contact}</p>
            <p className="hint">
              {c.address}
              <br />
              {c.email}
            </p>
          </div>
          <div>
            <small>ISSUED</small>
            <p>{i.date}</p>
            <small>DUE DATE</small>
            <p>{i.due}</p>
            <small>CURRENCY</small>
            <p>{i.currency}</p>
          </div>
        </div>
        <DataTable
          rows={i.items}
          rowKey={(item) => item.description}
          columns={[
            { label: "DESCRIPTION", render: (item) => item.description },
            { label: "QUANTITY", render: (item) => item.quantity },
            { label: "RATE", render: (item) => money(item.rate, i.currency) },
            {
              label: "AMOUNT",
              render: (item) => money(item.rate * item.quantity, i.currency),
            },
          ]}
        />
        <div className="form-total">
          <span>Total due</span>
          <strong>{money(total(i), i.currency)}</strong>
        </div>
      </Card>
    </>
  );
}

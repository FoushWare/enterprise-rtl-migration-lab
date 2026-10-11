import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MenuItem, IconButton, Alert } from "@mui/material";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { Card, Button, FormField, Modal } from "@atlas/design-system";
import {
  customers,
  mockApi,
  money,
  total,
  type Invoice,
  type LineItem,
} from "@atlas/shared";
import { Heading } from "../components/InvoiceUi";
export function CreateInvoice({
  onCreated,
}: {
  onCreated: (invoice: Invoice) => void;
}) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(""),
    [date, setDate] = useState("2026-10-11"),
    [due, setDue] = useState("2026-11-10"),
    [currency, setCurrency] = useState("USD"),
    [items, setItems] = useState<LineItem[]>([
      { description: "", quantity: 1, rate: 0 },
    ]),
    [errors, setErrors] = useState(false),
    [confirm, setConfirm] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const valid =
    !!customer &&
    !!date &&
    !!due &&
    due >= date &&
    items.every(
      (i) =>
        i.description.trim() &&
        Number.isFinite(i.quantity) &&
        i.quantity > 0 &&
        Number.isFinite(i.rate) &&
        i.rate > 0,
    );
  function update(index: number, key: keyof LineItem, value: string) {
    setItems(
      items.map((i, n) =>
        n === index
          ? { ...i, [key]: key === "description" ? value : Number(value) }
          : i,
      ),
    );
  }
  async function save() {
    setSaving(true);
    try {
      const invoice: Invoice = {
        id: `INV-2026-${Date.now()}`,
        customerId: customer,
        date,
        due,
        currency,
        items,
        status: "Pending",
      };
      await mockApi.createInvoice(invoice);
      onCreated(invoice);
      navigate(`/invoices/${invoice.id}`);
    } catch {
      setError("Unable to save invoice. Please try again.");
      setConfirm(false);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <Heading
        title="Create invoice"
        description="Make your next great project official."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setErrors(true);
          if (valid) setConfirm(true);
        }}
        noValidate
      >
        <Card className="card-pad form-section">
          <h2>Invoice details</h2>
          <div className="form-grid">
            <FormField
              label="Customer"
              select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              error={errors && !customer}
              helperText={
                errors && !customer
                  ? "Select a customer"
                  : "Choose the company you’re billing"
              }
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </FormField>
            <FormField
              label="Currency"
              select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {["USD", "EUR", "GBP"].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </FormField>
            <FormField
              label="Invoice date"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors && !date}
              helperText={errors && !date ? "Invoice date is required" : ""}
            />
            <FormField
              label="Due date"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={due}
              onChange={(e) => setDue(e.target.value)}
              error={errors && (!due || due < date)}
              helperText={
                errors && (!due || due < date)
                  ? "Due date must be on or after the invoice date"
                  : ""
              }
            />
          </div>
        </Card>
        <Card className="card-pad form-section">
          <h2>Line items</h2>
          {items.map((item, index) => (
            <div className="line-item" key={index}>
              <FormField
                label={`Description ${index + 1}`}
                value={item.description}
                onChange={(e) => update(index, "description", e.target.value)}
                error={errors && !item.description.trim()}
                helperText={
                  errors && !item.description.trim()
                    ? "Description is required"
                    : ""
                }
              />
              <FormField
                label={`Quantity ${index + 1}`}
                type="number"
                value={item.quantity}
                onChange={(e) => update(index, "quantity", e.target.value)}
                error={errors && item.quantity <= 0}
                helperText={
                  errors && item.quantity <= 0 ? "Must be positive" : ""
                }
              />
              <FormField
                label={`Rate ${index + 1}`}
                type="number"
                value={item.rate}
                onChange={(e) => update(index, "rate", e.target.value)}
                error={errors && item.rate <= 0}
                helperText={errors && item.rate <= 0 ? "Must be positive" : ""}
              />
              <IconButton
                aria-label={`Remove item ${index + 1}`}
                disabled={items.length === 1}
                onClick={() => setItems(items.filter((_, i) => i !== index))}
              >
                <DeleteOutline />
              </IconButton>
            </div>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() =>
              setItems([...items, { description: "", quantity: 1, rate: 0 }])
            }
          >
            Add line item
          </Button>
          <div className="form-total">
            <span>Total</span>
            <strong>{money(total({ items }), currency)}</strong>
          </div>
        </Card>
        {error && <Alert severity="error">{error}</Alert>}
        <div className="heading-actions" style={{ justifyContent: "flex-end" }}>
          <Button component={Link} to="/invoices" variant="outlined">
            Cancel
          </Button>
          <Button type="submit">Review invoice</Button>
        </div>
      </form>
      <Modal
        title="Confirm invoice"
        open={confirm}
        onClose={() => !saving && setConfirm(false)}
        actions={
          <>
            <Button
              variant="outlined"
              disabled={saving}
              onClick={() => setConfirm(false)}
            >
              Keep editing
            </Button>
            <Button disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Create invoice"}
            </Button>
          </>
        }
      >
        <p>
          Create an invoice for{" "}
          <strong>{customers.find((c) => c.id === customer)?.name}</strong>{" "}
          totaling <strong>{money(total({ items }), currency)}</strong>?
        </p>
        <p className="hint">
          The invoice will be saved to this demo workspace as Pending. No email
          is sent.
        </p>
      </Modal>
    </>
  );
}

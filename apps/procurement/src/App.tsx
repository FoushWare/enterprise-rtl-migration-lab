import { useState } from "react";
import { Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import { MenuItem } from "@mui/material";
import {
  AppShell,
  Card,
  DataTable,
  FormField,
  StatusBadge,
  EmptyState,
} from "@atlas/design-system";
import { purchaseOrders, money, total } from "@atlas/shared";
function Orders() {
  const [status, setStatus] = useState("All statuses");
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ATLAS PROCUREMENT</div>
          <h1>Purchase orders</h1>
          <p>Keep your suppliers, spending, and deliveries in sync.</p>
        </div>
      </div>
      <div className="kpis">
        {[
          [
            "Total committed",
            money(purchaseOrders.reduce((s, o) => s + total(o), 0)),
          ],
          ["Purchase orders", purchaseOrders.length],
          ["Awaiting approval", 3],
          ["Delivered", 3],
        ].map(([label, value]) => (
          <Card className="kpi" key={label}>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="toolbar">
          <FormField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ width: 200 }}
          >
            {["All statuses", "Pending", "Approved", "Delivered"].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </FormField>
        </div>
        <DataTable
          rowKey={(o) => o.id}
          rows={purchaseOrders.filter(
            (o) => status === "All statuses" || o.status === status,
          )}
          columns={[
            {
              label: "ORDER",
              render: (o) => (
                <Link className="invoice-link" to={`/orders/${o.id}`}>
                  {o.id}
                </Link>
              ),
            },
            {
              label: "SUPPLIER",
              render: (o) => (
                <strong style={{ fontSize: 12 }}>{o.supplier}</strong>
              ),
            },
            {
              label: "ORDER DATE",
              render: (o) => <span className="table-date">{o.date}</span>,
            },
            {
              label: "AMOUNT",
              render: (o) => <span className="amount">{money(total(o))}</span>,
            },
            {
              label: "STATUS",
              render: (o) => <StatusBadge status={o.status} />,
            },
          ]}
        />
      </Card>
    </>
  );
}
function Details() {
  const { id } = useParams();
  const order = purchaseOrders.find((o) => o.id === id);
  return order ? (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PURCHASE ORDER</div>
          <h1>{order.id}</h1>
          <p>
            {order.supplier} · Ordered {order.date}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <Card className="card-pad">
        <h2>{order.supplier}</h2>
        <DataTable
          rows={order.items}
          rowKey={(i) => i.description}
          columns={[
            { label: "DESCRIPTION", render: (i) => i.description },
            { label: "QUANTITY", render: (i) => i.quantity },
            { label: "AMOUNT", render: (i) => money(i.rate) },
          ]}
        />
        <div className="form-total">
          <span>Order total</span>
          <strong>{money(total(order))}</strong>
        </div>
      </Card>
    </>
  ) : (
    <EmptyState
      title="Order not found"
      description="Choose an order from the purchase order list."
    />
  );
}
export default function App() {
  const location = useLocation();
  return (
    <AppShell
      title={location.pathname === "/settings" ? "Settings" : "Purchase orders"}
      procurement
    >
      <Routes>
        <Route path="/" element={<Orders />} />
        <Route path="/orders/:id" element={<Details />} />
        <Route
          path="/settings"
          element={
            <Card className="card-pad">
              <h1>Procurement settings</h1>
              <p className="hint">
                Atlas Company · USD · English · United States
              </p>
              <p>Approval is required for orders over $5,000.</p>
            </Card>
          }
        />
        <Route
          path="*"
          element={
            <EmptyState
              title="Page not found"
              description="Choose Purchase orders from the sidebar."
            />
          }
        />
      </Routes>
    </AppShell>
  );
}

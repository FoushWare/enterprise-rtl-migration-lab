import { useState } from "react";
import { Alert, FormControlLabel, Switch } from "@mui/material";
import { Card, Button, FormField } from "@atlas/design-system";
import { Heading } from "../components/InvoiceUi";
export function Settings() {
  const initial = JSON.parse(
    localStorage.getItem("atlas-settings") || "null",
  ) || {
    company: "Atlas Company",
    email: "finance@atlas.example",
    address: "88 Lexington Avenue, New York, United States",
    reminders: true,
  };
  const [form, setForm] = useState(initial),
    [saved, setSaved] = useState(false);
  return (
    <>
      <Heading
        title="Settings"
        description="Your workspace, just the way you like it."
      />
      <form
        className="settings-width"
        onSubmit={(e) => {
          e.preventDefault();
          localStorage.setItem("atlas-settings", JSON.stringify(form));
          setSaved(true);
        }}
      >
        <Card className="card-pad form-section">
          <h2>Company information</h2>
          <div className="form-grid">
            <FormField
              required
              label="Company name"
              value={form.company}
              onChange={(e) => {
                setSaved(false);
                setForm({ ...form, company: e.target.value });
              }}
            />
            <FormField
              required
              label="Billing email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setSaved(false);
                setForm({ ...form, email: e.target.value });
              }}
            />
            <FormField
              required
              label="Company address"
              value={form.address}
              onChange={(e) => {
                setSaved(false);
                setForm({ ...form, address: e.target.value });
              }}
            />
          </div>
        </Card>
        <Card className="card-pad form-section">
          <h2>Application preferences</h2>
          <FormControlLabel
            control={
              <Switch
                checked={form.reminders}
                onChange={(_, value) => {
                  setSaved(false);
                  setForm({ ...form, reminders: value });
                }}
              />
            }
            label="Enable payment reminder preference"
          />
          <p className="hint">English · United States · LTR</p>
          <p className="hint">
            Preferences are stored locally. Reminder delivery is not connected
            in this demo.
          </p>
        </Card>
        {saved && (
          <Alert severity="success" sx={{ marginBottom: 2 }}>
            Settings saved
          </Alert>
        )}
        <Button type="submit">Save changes</Button>
      </form>
    </>
  );
}

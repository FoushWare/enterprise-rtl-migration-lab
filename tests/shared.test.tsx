import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Button,
  Modal,
  DataTable,
  StatusBadge,
  Provider,
} from "@atlas/design-system";
import { mockApi, seedInvoices, total } from "@atlas/shared";
describe("shared contracts", () => {
  it("renders a status and an empty table", () => {
    render(
      <Provider>
        <StatusBadge status="Paid" />
        <DataTable columns={[]} rows={[]} rowKey={() => ""} />
      </Provider>,
    );
    expect(screen.getByText("Paid")).toBeVisible();
    expect(screen.getByText("No results found")).toBeVisible();
  });
  it("button triggers its consumer handler", () => {
    const click = vi.fn();
    render(
      <Provider>
        <Button onClick={click}>Save</Button>
      </Provider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(click).toHaveBeenCalledOnce();
  });
  it("modal can be closed by its labeled control", () => {
    const close = vi.fn();
    render(
      <Provider>
        <Modal title="Review" open onClose={close}>
          Invoice summary
        </Modal>
      </Provider>,
    );
    expect(screen.getByRole("dialog")).toBeVisible();
    fireEvent.click(screen.getByLabelText("Close dialog"));
    expect(close).toHaveBeenCalledOnce();
  });
  it("persists invoices and calculates line item totals", async () => {
    const invoice = {
      ...seedInvoices[0],
      id: "INV-TEST",
      items: [{ description: "Consulting", quantity: 3, rate: 125 }],
    };
    expect(total(invoice)).toBe(375);
    await mockApi.createInvoice(invoice);
    expect((await mockApi.listInvoices())[0]).toEqual(invoice);
    await expect(mockApi.createInvoice(invoice)).rejects.toThrow(
      "already exists",
    );
  });
});

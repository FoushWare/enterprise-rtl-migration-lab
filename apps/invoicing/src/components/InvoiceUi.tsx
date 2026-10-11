import { Link } from "react-router-dom";
import Add from "@mui/icons-material/Add";
import { Button } from "@atlas/design-system";
export function Heading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">ATLAS INVOICE</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export const CreateButton = () => (
  <Button
    component={Link}
    to="/invoices/new"
    startIcon={<Add fontSize="small" />}
  >
    Create invoice
  </Button>
);

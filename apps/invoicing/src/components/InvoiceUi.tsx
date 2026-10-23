import { useLocale } from "@atlas/shared";
import { Link } from "react-router-dom";
import Add from "@mui/icons-material/Add";
import { Button } from "@atlas/design-system";
/**
 * Present a page heading with its supporting text and optional actions.
 * @returns Shared invoice-page heading markup.
 */
export function Heading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const { t } = useLocale();
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{t("ATLAS INVOICE")}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
/**
 * Link to invoice creation while preserving the active demonstration locale.
 * @returns The localized create-invoice action.
 */
export function CreateButton() {
  const { t, demoHref } = useLocale();
  return (
    <Button
      component={Link}
      to={demoHref("/invoices/new")}
      startIcon={<Add fontSize="small" />}
    >
      {t("Create invoice")}
    </Button>
  );
}

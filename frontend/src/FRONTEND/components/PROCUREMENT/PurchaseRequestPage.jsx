import ProcurementDocumentPage from "./shared/ProcurementDocumentPage";
import { procurementConfigs } from "./shared/procurementConfigs";

export default function PurchaseRequestPage() {
  return <ProcurementDocumentPage config={procurementConfigs["purchase-requests"]} />;
}

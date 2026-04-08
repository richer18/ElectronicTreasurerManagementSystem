import ProcurementDocumentPage from "./shared/ProcurementDocumentPage";
import { procurementConfigs } from "./shared/procurementConfigs";

export default function JobOrderRequestPage() {
  return <ProcurementDocumentPage config={procurementConfigs["job-order-requests"]} />;
}

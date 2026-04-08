import ProcurementDocumentPage from "./shared/ProcurementDocumentPage";
import { procurementConfigs } from "./shared/procurementConfigs";

export default function JobOrderPage() {
  return <ProcurementDocumentPage config={procurementConfigs["job-orders"]} />;
}

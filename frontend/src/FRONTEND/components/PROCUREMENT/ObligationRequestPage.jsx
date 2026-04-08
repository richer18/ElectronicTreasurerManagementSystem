import ProcurementDocumentPage from "./shared/ProcurementDocumentPage";
import { procurementConfigs } from "./shared/procurementConfigs";

export default function ObligationRequestPage() {
  return <ProcurementDocumentPage config={procurementConfigs["obligation-requests"]} />;
}

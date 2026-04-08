import ProcurementDocumentPage from "./shared/ProcurementDocumentPage";
import { procurementConfigs } from "./shared/procurementConfigs";

export default function RequisitionIssueSlipPage() {
  return <ProcurementDocumentPage config={procurementConfigs["requisition-issue-slips"]} />;
}

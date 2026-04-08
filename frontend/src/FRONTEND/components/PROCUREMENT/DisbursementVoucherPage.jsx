import ProcurementDocumentPage from "./shared/ProcurementDocumentPage";
import { procurementConfigs } from "./shared/procurementConfigs";

export default function DisbursementVoucherPage() {
  return <ProcurementDocumentPage config={procurementConfigs["disbursement-vouchers"]} />;
}

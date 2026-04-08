import ProcurementDocumentPage from "./shared/ProcurementDocumentPage";
import { procurementConfigs } from "./shared/procurementConfigs";

export default function AbstractOfCanvassPage() {
  return <ProcurementDocumentPage config={procurementConfigs["abstract-of-canvass"]} />;
}

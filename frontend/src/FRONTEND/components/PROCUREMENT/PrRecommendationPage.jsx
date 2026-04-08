import ProcurementDocumentPage from "./shared/ProcurementDocumentPage";
import { procurementConfigs } from "./shared/procurementConfigs";

export default function PrRecommendationPage() {
  return <ProcurementDocumentPage config={procurementConfigs["pr-recommendations"]} />;
}

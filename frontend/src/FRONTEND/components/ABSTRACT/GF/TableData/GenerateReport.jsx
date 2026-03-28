import PropTypes from "prop-types";
import ReceiptCollectionReportDialog from "../../shared/ReceiptCollectionReportDialog";

const collectorOptions = ["FLORA MY", "IRIS", "AGNES", "RICARDO", "AMABELLA"];

const formatReceiptType = (row) => {
  if (String(row.cashier).toUpperCase() === "AMABELLA" && row.report_type === "GF") {
    return "Cash Tickets";
  }

  if (row.report_type === "GF") return "General Fund";
  if (row.report_type === "TF") return "Trust Fund";
  return row.report_type;
};

function GenerateReport({ open, onClose }) {
  return (
    <ReceiptCollectionReportDialog
      open={open}
      onClose={onClose}
      reportType="GF"
      collectorOptions={collectorOptions}
      filePrefix="general-fund-report"
      dialogTitle="Collector Collection Report"
      collectorLabel="Collector"
      receiptFilterLabel="Receipt Filters"
      receiptFromLabel="Receipt No. From"
      receiptToLabel="Receipt No. To"
      receiptTypeColumnLabel="Receipt Type"
      receiptNumberColumnLabel="Receipt No."
      noDataMessage="No receipts found for the selected collector and date filter."
      errorMessage="Failed to load the collector collection report. Please try again."
      formatReceiptType={formatReceiptType}
    />
  );
}

GenerateReport.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default GenerateReport;

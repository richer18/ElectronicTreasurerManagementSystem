import PropTypes from "prop-types";
import ReceiptCollectionReportDialog from "../../shared/ReceiptCollectionReportDialog";

const collectorOptions = ["flora", "angelique", "agnes", "ricardo"];

const formatReceiptType = (row) => {
  if (row.report_type === "CTCI") return "Cedula";
  if (row.report_type === "CTCC") return "Cedula";
  return row.report_type;
};

function GenerateReport({ open, onClose }) {
  return (
    <ReceiptCollectionReportDialog
      open={open}
      onClose={onClose}
      reportType="CTCI"
      collectorOptions={collectorOptions}
      filePrefix="cedula-report"
      dialogTitle="Collector Collection Report"
      collectorLabel="Collector"
      receiptFilterLabel="CTC Filters"
      receiptFromLabel="CTC No. From"
      receiptToLabel="CTC No. To"
      receiptTypeColumnLabel="Receipt Type"
      receiptNumberColumnLabel="CTC No."
      noDataMessage="No cedula records found for the selected collector and date filter."
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

import ReceiptIcon from "@mui/icons-material/Receipt";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {
Alert,
Autocomplete,
Box,
Button,
Card,
Chip,
Checkbox,
Divider,
Dialog,
DialogActions,
DialogContent,
DialogContentText,
DialogTitle,
IconButton,
InputAdornment,
Menu,
MenuItem,
Paper,
Snackbar,
styled,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
TextField,
Tooltip,
Typography,
} from "@mui/material";

import TablePagination from "@mui/material/TablePagination";
// import axios from "axios";
import { saveAs } from "file-saver"; // npm install file-saver
import React, { useEffect, useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import axiosInstance from "../../../api/axiosInstance";
import { BiSolidReport } from "react-icons/bi";
import { IoMdAdd, IoMdDownload, IoMdPrint } from "react-icons/io";
import { IoToday } from "react-icons/io5";
// import * as XLSX from "xlsx"; // npm install xlsx

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import GavelIcon from "@mui/icons-material/Gavel";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckStocks from "./components/CheckStocks";
import DailyReport from "./components/DailyReport";
import AssignAccountableForms from "./components/AssignAccountableForms";
import Inventory from "./components/Inventory";
import IssueForm from "./components/IssueForm";
import Logs from "./components/Logs";
import NewEntryForm from "./components/NewEntryForm";
import PurchaseForm from "./components/PurchaseForm";
import ReturnAccountableForm from "./components/ReturnAccountableForm";
import ReturnHistory from "./components/ReturnHistory";
import RcdPrintTable from "./components/RcdPrintTable";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  whiteSpace: "nowrap",
  fontWeight: 700,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  background: "#f7f9fc",
  color: "#0f2747",
  borderBottom: "2px solid #d6a12b",
  fontSize: 11.5,
}));

// Function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

const normalizeCollectorName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const months = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const years = [
  { label: "2023", value: "2023" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
];

const uiColors = {
  navy: "#0f2747",
  navyHover: "#0b1e38",
  teal: "#0f6b62",
  tealHover: "#0b544d",
  amber: "#d6a12b",
  amberSoft: "rgba(214,161,43,0.14)",
  steel: "#4b5d73",
  sky: "#2f6db5",
  skyHover: "#255894",
  pageBg: "#f5f7fb",
  cardBorder: "#d8e2ee",
  cardBg: "#ffffff",
};

const metricCardStyles = {
  flex: 1,
  borderRadius: "16px",
  color: uiColors.navy,
  backgroundColor: uiColors.cardBg,
  border: `1px solid ${uiColors.cardBorder}`,
  boxShadow: "0 10px 26px rgba(15,39,71,0.08)",
  transition: "all 0.25s ease",
  cursor: "pointer",
  minWidth: 0,
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 16px 34px rgba(15,39,71,0.13)",
    borderColor: "rgba(15,39,71,0.24)",
  },
};

const toolbarButtonSx = (bg, hover) => ({
  px: 3,
  height: 44,
  fontSize: 14,
  fontWeight: 600,
  textTransform: "none",
  borderRadius: 2,
  color: "#fff",
  backgroundColor: bg,
  boxShadow: "0 4px 10px rgba(15, 39, 71, 0.14)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: hover,
    transform: "translateY(-1px)",
  },
});

const secondaryToolbarButtonSx = (accent, soft) => ({
  px: 2.75,
  height: 44,
  fontSize: 14,
  fontWeight: 700,
  textTransform: "none",
  borderRadius: 2,
  color: accent,
  backgroundColor: soft,
  border: `1px solid ${soft}`,
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#fff",
    borderColor: accent,
    transform: "translateY(-1px)",
  },
});

const getWorkflowStatus = (statusValue) => {
  const normalized = String(statusValue || "").trim().toLowerCase();

  if (normalized === "deposit") return "Deposited";
  if (normalized === "approve") return "Approved";
  if (normalized === "remit") return "Submitted";
  if (normalized === "purchase") return "Purchase";
  return "Draft";
};

const isPrintableRcdStatus = (statusValue) => {
  const normalized = String(statusValue || "").trim().toLowerCase();
  return normalized === "remit" || normalized === "deposit" || normalized === "approve";
};

const getWorkflowStatusMeta = (statusValue) => {
  const workflowStatus = getWorkflowStatus(statusValue);

  const meta = {
    Draft: {
      label: "Draft",
      bg: "rgba(214,161,43,0.18)",
      color: "#7a5300",
    },
    Submitted: {
      label: "Submitted",
      bg: "rgba(15,107,98,0.14)",
      color: "#0f6b62",
    },
    Approved: {
      label: "Approved",
      bg: "rgba(46,125,50,0.14)",
      color: "#2e7d32",
    },
    Deposited: {
      label: "Deposited",
      bg: "rgba(2,136,209,0.14)",
      color: "#0277bd",
    },
    Purchase: {
      label: "Purchase",
      bg: "rgba(75,93,115,0.12)",
      color: "#4b5d73",
    },
  };

  return meta[workflowStatus] || meta.Draft;
};

const accountabilitySections = [
  "accountability",
  "assign-form",
  "check-stock",
  "inventory",
  "issue-form",
  "return-form",
  "return-history",
  "purchase-form",
  "logs",
];

function ReportCollectionDeposit() {
    // Dialog states
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [dialogContent, setDialogContent] = useState(null);
      const [dialogTitle, setDialogTitle] = useState("");
    
      // Table states
    
      const [page, setPage] = useState(0);
      const [rowsPerPage, setRowsPerPage] = useState(10);
    
      // Menu & selectedRow states
      const [anchorEl, setAnchorEl] = useState(null);
      const [selectedRow, setSelectedRow] = useState(null);
    
      // Totals
      const [allTotal, setAllTotal] = useState(0);
      const [taxOnBusinessTotal, setTaxOnBusinessTotal] = useState(0);
      const [regulatoryFeesTotal, setRegulatoryFeesTotal] = useState(0);
      const [serviceUserChargesTotal, setServiceUserChargesTotal] = useState(0);
      const [
        receiptsFromEconomicEnterprisesTotal,
        setReceiptsFromEconomicEnterprisesTotal,
      ] = useState(0);
    
      // Popup states
      // State for Popups
      const [openTOTAL, setOpenTOTAL] = useState(false);
      const [openTax, setOpenTax] = useState(false);
      const [openRf, setOpenRf] = useState(false);
      const [openSUC, setOpenSUC] = useState(false);
      const [openRFEE, setOpenRFEE] = useState(false);
      const [openDailyTable, setOpenDailyTable] = useState(false);
    
      // Show/hide different tables
      const [showDailyTable, setShowDailyTable] = useState(false);
      const [showMainTable, setShowMainTable] = useState(true);
      const [showReportTable, setShowReportTable] = useState(false);
      const [dailyTableData, setDailyTableData] = useState([]);
      const [showFilters, setShowFilters] = useState(true);
      const [activeSection, setActiveSection] = useState("overview");
      const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
      const [selectedId, setSelectedId] = useState(null);
      const [month, setMonth] = useState(null);
      const [year, setYear] = useState(null);
      const [filteredData, setFilteredData] = useState([]);
      const [data, setData] = useState([]);
      const [searchQuery, setSearchQuery] = useState("");
      const [pendingSearchQuery, setPendingSearchQuery] = useState("");
      const [rows, setRows] = React.useState([]);
      const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
      });
      const [editFormData, setEditFormData] = useState({
        id: null,
        issued_date: "",
        collector: "",
        type_of_receipt: "",
        receipt_no_from: "",
        receipt_no_to: "",
        total: "",
        status: "Not Remit",
      });
      const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    
      const [reportDialog, setReportDialog] = useState({
        open: false,
        status: "idle", // 'idle' | 'loading' | 'success' | 'error'
        progress: 0,
      });
      const [openPrintPreview, setOpenPrintPreview] = useState(false);
      const [printPayload, setPrintPayload] = useState(null);
      const printPreviewRef = useRef(null);
      const [openPrintSelector, setOpenPrintSelector] = useState(false);
      const [printCollector, setPrintCollector] = useState("");
      const [printDate, setPrintDate] = useState("");
      const [rcdBatches, setRcdBatches] = useState([]);
      const [selectedGenerateBatch, setSelectedGenerateBatch] = useState(null);
      const [suggestedCollections, setSuggestedCollections] = useState([]);
      const [suggestedCollectionsLoading, setSuggestedCollectionsLoading] = useState(false);
      const [batchLoading, setBatchLoading] = useState(false);
      const [batchActionLoading, setBatchActionLoading] = useState(false);
      const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
      const [permissionPassword, setPermissionPassword] = useState("");
      const [permissionAction, setPermissionAction] = useState("");
      const [permissionLoading, setPermissionLoading] = useState(false);
      const [permissionError, setPermissionError] = useState("");
      const [selectedSuggestionKeys, setSelectedSuggestionKeys] = useState([]);
      const [multiImportQueue, setMultiImportQueue] = useState([]);
      const [multiImportIndex, setMultiImportIndex] = useState(0);
      const [multiImportDialogOpen, setMultiImportDialogOpen] = useState(false);
      const [batchStatusDialog, setBatchStatusDialog] = useState({
        open: false,
        batch: null,
        status: "",
        reviewed_by: "",
        deposit_reference: "",
        remarks: "",
      });

      const ChhandleCloseDialog = () => {
    setReportDialog({ ...reportDialog, open: false });
  };

  function getCollectorFromRow(row) {
    return row?.Collector || row?.collector || "";
  }

  function getDateFromRow(row) {
    return row?.issued_date || row?.Date || row?.date || "";
  }

  function toDateKey(value) {
    if (!value) return "";
    if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function sameCollector(entryCollector, targetCollector) {
    return String(entryCollector || "").trim().toLowerCase() === String(targetCollector || "").trim().toLowerCase();
  }


  const handleGenerateReport = () => {
    // Open dialog in loading state
    setReportDialog({
      open: true,
      status: "loading",
      progress: 0,
    });

    // Simulate report generation
    const interval = setInterval(() => {
      setReportDialog((prev) => {
        const newProgress = prev.progress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return { ...prev, status: "success", progress: 100 };
        }
        return { ...prev, progress: newProgress };
      });
    }, 300);
  };

  const fetchEntries = async () => {
    try {
      const response = await axiosInstance.get("/rcd-entries", {
        params: {
          month,
          year,
          search: searchQuery || undefined,
        },
      });
      const rowsFromApi = Array.isArray(response.data) ? response.data : [];
      setFilteredData(rowsFromApi);
    } catch (error) {
      console.error("Failed to load RCD entries:", error);
      setFilteredData([]);
    }
  };

  const fetchBatches = async () => {
    try {
      setBatchLoading(true);
      const response = await axiosInstance.get("/rcd-batches", {
        params: {
          month,
          year,
        },
      });
      setRcdBatches(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load RCD batches:", error);
      setRcdBatches([]);
    } finally {
      setBatchLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchBatches();
  }, [month, year, searchQuery]);

  useEffect(() => {
    const rows = Array.isArray(filteredData) ? filteredData : [];
    const getTotal = (row) => Number(row?.Total ?? row?.total ?? 0);
    const getCollector = (row) => normalizeCollectorName(row?.Collector ?? row?.collector);

    const collectorFlora = normalizeCollectorName("Flora My D. Ferrer");
    const collectorEmily = normalizeCollectorName("Emily E. Credo");
    const collectorRicardo = normalizeCollectorName("Ricardo T Enopia");
    const collectorAgnes = normalizeCollectorName("Agnes B. Ello");

    let all = 0;
    let flora = 0;
    let emily = 0;
    let ricardo = 0;
    let agnes = 0;

    for (const row of rows) {
      const total = getTotal(row);
      const collector = getCollector(row);
      all += total;
      if (collector === collectorFlora) flora += total;
      if (collector === collectorEmily) emily += total;
      if (collector === collectorRicardo) ricardo += total;
      if (collector === collectorAgnes) agnes += total;
    }

    setAllTotal(all);
    setTaxOnBusinessTotal(flora);
    setRegulatoryFeesTotal(emily);
    setReceiptsFromEconomicEnterprisesTotal(ricardo);
    setServiceUserChargesTotal(agnes);
  }, [filteredData]);

  const rcdBatchRows = useMemo(() => {
    const grouped = new Map();

    (Array.isArray(filteredData) ? filteredData : []).forEach((row) => {
      const collector = getCollectorFromRow(row);
      const dateKey = toDateKey(getDateFromRow(row));
      if (!collector || !dateKey) return;

      const key = `${dateKey}__${collector.toLowerCase()}`;
      const amount = Number(row?.Total ?? row?.total ?? 0);
      const rowWorkflowStatus = getWorkflowStatus(row?.Status ?? row?.status);
      const receiptType = row?.Type_Of_Receipt || row?.type_of_receipt || "";

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          date: dateKey,
          collector,
          total: 0,
          entryCount: 0,
          statuses: new Set(),
          receiptTypes: new Set(),
          rows: [],
        });
      }

      const batch = grouped.get(key);
      batch.total += amount;
      batch.entryCount += 1;
      batch.statuses.add(rowWorkflowStatus);
      if (receiptType) batch.receiptTypes.add(receiptType);
      batch.rows.push(row);
    });

    const getBatchStage = (statuses) => {
      if (statuses.has("Deposited")) return "Deposited";
      if (statuses.has("Approved")) return "Approved";
      if (statuses.has("Submitted")) return "Submitted";
      if (statuses.has("Purchase")) return "Purchase";
      return "Draft";
    };

    return Array.from(grouped.values())
      .map((batch) => ({
        ...batch,
        stage: getBatchStage(batch.statuses),
        receiptTypeSummary: Array.from(batch.receiptTypes).join(", "),
      }))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return a.collector.localeCompare(b.collector);
      });
  }, [filteredData]);

  const workflowSummary = useMemo(() => {
    return rcdBatchRows.reduce(
      (acc, batch) => {
        acc.total += batch.total;
        if (batch.stage === "Draft") acc.draft += 1;
        if (batch.stage === "Submitted") acc.submitted += 1;
        if (batch.stage === "Approved") acc.approved += 1;
        if (batch.stage === "Deposited") acc.deposited += 1;
        return acc;
      },
      { total: 0, draft: 0, submitted: 0, approved: 0, deposited: 0 }
    );
  }, [rcdBatchRows]);

  const displayedBatches = useMemo(() => {
    if (Array.isArray(rcdBatches) && rcdBatches.length > 0) {
      return rcdBatches.map((batch) => ({
        key: `batch-${batch.id}`,
        id: batch.id,
        date: batch.report_date,
        collector: batch.collector,
        total: Number(batch.total_amount || 0),
        entryCount: Number(batch.entry_count || 0),
        stage: batch.status || "Draft",
        receiptTypeSummary: batch.remarks || "",
        rows: filteredData.filter((row) => {
          const rowCollector = getCollectorFromRow(row);
          const rowDate = toDateKey(getDateFromRow(row));
          return sameCollector(rowCollector, batch.collector) && rowDate === batch.report_date;
        }),
      }));
    }

    return rcdBatchRows;
  }, [rcdBatches, rcdBatchRows, filteredData]);

  const displayedWorkflowSummary = useMemo(() => {
    return displayedBatches.reduce(
      (acc, batch) => {
        acc.total += Number(batch.total || 0);
        if (batch.stage === "Draft") acc.draft += 1;
        if (batch.stage === "Submitted") acc.submitted += 1;
        if (batch.stage === "Approved") acc.approved += 1;
        if (batch.stage === "Deposited") acc.deposited += 1;
        return acc;
      },
      { total: 0, draft: 0, submitted: 0, approved: 0, deposited: 0 }
    );
  }, [displayedBatches]);

  const getRowId = (row) => row?.id ?? row?.ID ?? null;

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDialogContent(null);
    setDialogTitle("");
  };

  const handleOpenPurchaseForm = () => {
    showSection("purchase-form");
  };

  const handleOpenAssignForm = () => {
    showSection("assign-form");
  };

  const handleOpenReturnForm = () => {
    showSection("return-form");
  };

  // TOTAL POPUP
  const handleClickTotal = () => {
    setOpenTOTAL(true);
  };
//   const handleCloseTOTAL = () => {
//     setOpenTOTAL(false);
//   };
  const handleClickTax = () => {
    setOpenTax(true);
  };
//   const handleCloseTax = () => {
//     setOpenTax(false);
//   };
  const handleClickRF = () => {
    setOpenRf(true);
  };
//   const handleCloseRF = () => {
//     // Fixed name
//     setOpenRf(false);
//   };
  const handleClickSUC = () => {
    setOpenSUC(true);
  };
//   const handleCloseSUC = () => {
//     setOpenSUC(false);
//   };
  const handleClickRFEE = () => {
    setOpenRFEE(true);
  };
//   const handleCloseRFEE = () => {
//     setOpenRFEE(false);
//   };

  // Daily table popup
//   const handleCloseDailyTable = () => {
//     setOpenDailyTable(false);
//   };

  // Table pagination
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

  // Toggle sub-tables
  const showSection = (section) => {
    setActiveSection(section);
    if (section === "daily") {
      setShowDailyTable(true);
      setShowMainTable(false);
      setShowReportTable(false);
      setShowFilters(false);
      return;
    }

    if (section === "financial" || section === "generate-rcd" || section === "review-queue" || section === "deposit-queue") {
      setShowDailyTable(false);
      setShowMainTable(false);
      setShowReportTable(true);
      setShowFilters(false);
      return;
    }

    if (accountabilitySections.includes(section)) {
      setShowDailyTable(false);
      setShowMainTable(false);
      setShowReportTable(false);
      setShowFilters(false);
      return;
    }

    if (section === "overview") {
      setShowDailyTable(false);
      setShowMainTable(false);
      setShowReportTable(false);
      setShowFilters(true);
      return;
    }

    // main/default
    setShowDailyTable(false);
    setShowMainTable(true);
    setShowReportTable(false);
    setShowFilters(true);
  };

  const toggleReportTable = () => {
    showSection("generate-rcd");
  };

  const toggleDailyTable = () => {
    showSection("entries");
  };

  const handleNewEntryClick = () => {
    showSection("main");
    setDialogTitle("New Entry");
    setDialogContent(
      <NewEntryForm
        onSaved={() => {
          fetchEntries();
          fetchBatches();
          handleCloseDialog();
        }}
        onCancel={handleCloseDialog}
      />
    );
    setIsDialogOpen(true);
  };

  const handleImportSuggestedCollection = (suggestion) => {
    setDialogTitle("Import Suggested Collection");
    setDialogContent(
      <NewEntryForm
        initialValues={{
          issued_date: suggestion.collection_date,
          collector: suggestion.collector,
          fund: suggestion.fund === "RPT" ? "200 Special Education Fund" : "100 General Fund",
          type_of_receipt: suggestion.type_of_receipt,
          receipt_no_from: suggestion.receipt_no_from,
          receipt_no_to: suggestion.receipt_no_to,
          total: suggestion.total_amount,
          status: "Not Remit",
        }}
        onSaved={() => {
          fetchEntries();
          fetchBatches();
          if (selectedGenerateBatch) {
            loadSuggestedCollections(selectedGenerateBatch);
          }
          handleCloseDialog();
        }}
        onCancel={handleCloseDialog}
      />
    );
    setIsDialogOpen(true);
  };

  const getSuggestionKey = (suggestion, index) =>
    `${suggestion.module}-${suggestion.type_of_receipt}-${suggestion.receipt_no_from}-${suggestion.receipt_no_to}-${index}`;

  const toggleSuggestionSelection = (suggestionKey) => {
    setSelectedSuggestionKeys((prev) =>
      prev.includes(suggestionKey)
        ? prev.filter((key) => key !== suggestionKey)
        : [...prev, suggestionKey]
    );
  };

  const handleImportSelectedSuggestions = () => {
    const queue = suggestedCollections.filter((suggestion, index) =>
      selectedSuggestionKeys.includes(getSuggestionKey(suggestion, index))
    );

    if (queue.length === 0) {
      setSnackbar({
        open: true,
        message: "Select at least one suggested collection to import.",
        severity: "warning",
      });
      return;
    }

    setMultiImportQueue(queue);
    setMultiImportIndex(0);
    setMultiImportDialogOpen(true);
  };

  const handleMultiImportClose = () => {
    setMultiImportDialogOpen(false);
    setMultiImportQueue([]);
    setMultiImportIndex(0);
  };

  const handleMultiImportSaved = async () => {
    await fetchEntries();
    await fetchBatches();
    if (selectedGenerateBatch) {
      await loadSuggestedCollections(selectedGenerateBatch);
    }

    if (multiImportIndex < multiImportQueue.length - 1) {
      setMultiImportIndex((prev) => prev + 1);
      return;
    }

    setSelectedSuggestionKeys([]);
    handleMultiImportClose();
    setSnackbar({
      open: true,
      message: "Selected suggested collections were imported.",
      severity: "success",
    });
  };

  const handleCheckStockClick = () => {
    showSection("check-stock");
  };

  const handleInventoryClick = () => {
    showSection("inventory");
  };

  const handleIssueFormClick = () => {
    showSection("issue-form");
  };

  const handleLogsClick = () => {
    showSection("logs");
  };

  const handleReturnHistoryClick = () => {
    showSection("return-history");
  };

  const handleBackToMainTable = () => {
    showSection("main");
  };

  const handleBackToAccountability = () => {
    showSection("accountability");
  };

  const isAccountabilitySection = accountabilitySections.includes(activeSection);

  // “Download” logic
  const handleViewClick = () => {
    if (!selectedRow) return;

    const rowDate = selectedRow.issued_date || selectedRow.Date || selectedRow.date || "-";
    const collector = selectedRow.Collector || selectedRow.collector || "-";
    const receiptType = selectedRow.Type_Of_Receipt || selectedRow.type_of_receipt || "-";
    const receiptFrom = selectedRow.Receipt_No_From || selectedRow.receipt_no_from || "-";
    const receiptTo = selectedRow.Receipt_No_To || selectedRow.receipt_no_to || "-";
    const total = Number(selectedRow.Total || selectedRow.total || 0);
    const status = selectedRow.Status || selectedRow.status || "Not Remit";

    setDialogTitle("View Entry");
    setDialogContent(
      <Box sx={{ display: "grid", gap: 1.25, py: 1 }}>
        <Typography><strong>Date:</strong> {formatDate(rowDate)}</Typography>
        <Typography><strong>Collector:</strong> {collector}</Typography>
        <Typography><strong>Type of Receipt:</strong> {receiptType}</Typography>
        <Typography><strong>Receipt No. From:</strong> {receiptFrom}</Typography>
        <Typography><strong>Receipt No. To:</strong> {receiptTo}</Typography>
        <Typography>
          <strong>Total:</strong>{" "}
          {new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2,
          }).format(total)}
        </Typography>
        <Typography><strong>Status:</strong> {status}</Typography>
      </Box>
    );
    setIsDialogOpen(true);
    handleMenuClose();
  };

  const handleEditClick = () => {
    if (!selectedRow) return;
    setEditFormData({
      id: getRowId(selectedRow),
      issued_date: toDateKey(selectedRow?.issued_date || selectedRow?.Date || selectedRow?.date),
      collector: selectedRow?.Collector || selectedRow?.collector || "",
      type_of_receipt: selectedRow?.Type_Of_Receipt || selectedRow?.type_of_receipt || "",
      receipt_no_from: String(selectedRow?.Receipt_No_From || selectedRow?.receipt_no_from || ""),
      receipt_no_to: String(selectedRow?.Receipt_No_To || selectedRow?.receipt_no_to || ""),
      total: String(selectedRow?.Total || selectedRow?.total || ""),
      status: selectedRow?.Status || selectedRow?.status || "Not Remit",
    });
    setOpenUpdateDialog(true);
    handleMenuClose();
  };

  const openPermissionDialog = (action) => {
    setPermissionAction(action);
    setPermissionPassword("");
    setPermissionError("");
    setPermissionDialogOpen(true);
    handleMenuClose();
  };

  const handlePermissionClose = () => {
    setPermissionDialogOpen(false);
    setPermissionPassword("");
    setPermissionError("");
    setPermissionAction("");
  };

  const handlePermissionConfirm = async () => {
    const authUserRaw = localStorage.getItem("authUser");
    let authUser = null;

    try {
      authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
    } catch (error) {
      authUser = null;
    }

    const username = authUser?.username;

    if (!username) {
      setPermissionError("No logged-in user found. Please sign in again.");
      return;
    }

    if (!permissionPassword) {
      setPermissionError("Password is required.");
      return;
    }

    try {
      setPermissionLoading(true);
      setPermissionError("");
      await axiosInstance.post("/rcd/verify-password", {
        username,
        password: permissionPassword,
      });

      setPermissionDialogOpen(false);
      setPermissionPassword("");

      if (permissionAction === "edit") {
        handleEditClick();
        return;
      }

      if (permissionAction === "delete") {
        setSelectedId(getRowId(selectedRow));
        setOpenDeleteDialog(true);
      }
    } catch (error) {
      setPermissionError(
        error?.response?.data?.message || "Password verification failed."
      );
    } finally {
      setPermissionLoading(false);
    }
  };

  const handleEditFieldChange = (name, value) => {
    if (name === "receipt_no_from" || name === "receipt_no_to") {
      setEditFormData((prev) => ({
        ...prev,
        [name]: String(value || "").replace(/\D/g, ""),
      }));
      return;
    }
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getAuthUsername = () => {
    const authUserRaw = localStorage.getItem("authUser");
    if (!authUserRaw) return "";

    try {
      const authUser = JSON.parse(authUserRaw);
      return authUser?.username || "";
    } catch (error) {
      return "";
    }
  };

  const handleSaveUpdate = async () => {
    try {
      if (!editFormData.id) return;
      await axiosInstance.put(`/rcd-entries/${editFormData.id}`, {
        issued_date: editFormData.issued_date,
        collector: editFormData.collector,
        type_of_receipt: editFormData.type_of_receipt,
        receipt_no_from: String(editFormData.receipt_no_from || "").replace(/\D/g, ""),
        receipt_no_to: String(editFormData.receipt_no_to || "").replace(/\D/g, ""),
        total: Number(editFormData.total || 0),
        status: editFormData.status,
        performed_by: getAuthUsername(),
      });
      setOpenUpdateDialog(false);
      await fetchEntries();
      await fetchBatches();
      setSnackbar({
        open: true,
        message: "Entry updated successfully.",
        severity: "success",
      });
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      setSnackbar({
        open: true,
        message: apiMessage || "Failed to update entry.",
        severity: "error",
      });
    }
  };

  const toInt = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const buildAccountabilityRows = ({ collector, targetDateKey, issuedForms }) => {
    const relevantForms = issuedForms.filter((form) => {
      if (!sameCollector(form?.Collector ?? form?.collector, collector)) return false;
      const status = String(form?.Status ?? form?.status ?? "").toUpperCase();
      if (status && status !== "ISSUED") return false;
      const assignDateKey = toDateKey(form?.Date ?? form?.Date_Issued ?? form?.date ?? form?.date_issued);
      return !assignDateKey || assignDateKey <= targetDateKey;
    });

    const latestByType = new Map();
    for (const form of relevantForms) {
      const type = String(form?.Form_Type ?? form?.form_type ?? "").trim();
      if (!type) continue;
      const currentKey = toDateKey(form?.Date ?? form?.Date_Issued ?? form?.date ?? form?.date_issued);
      const existing = latestByType.get(type);
      if (!existing) {
        latestByType.set(type, form);
        continue;
      }
      const existingKey = toDateKey(existing?.Date ?? existing?.Date_Issued ?? existing?.date ?? existing?.date_issued);
      if (currentKey >= existingKey) {
        latestByType.set(type, form);
      }
    }

    const rows = [];
    latestByType.forEach((form, type) => {
      const begQty = toInt(form?.Begginning_Balance_receipt_qty ?? form?.begginning_balance_receipt_qty);
      const begFrom = form?.Begginning_Balance_receipt_from ?? form?.begginning_balance_receipt_from ?? 0;
      const begTo = form?.Begginning_Balance_receipt_to ?? form?.begginning_balance_receipt_to ?? 0;

      const recQty = toInt(form?.Receipt_Range_qty ?? form?.receipt_range_qty);
      const recFrom = form?.Receipt_Range_From ?? form?.receipt_range_from ?? 0;
      const recTo = form?.Receipt_Range_To ?? form?.receipt_range_to ?? 0;

      const issuedQty = toInt(form?.Issued_receipt_qty ?? form?.issued_receipt_qty);
      const issuedFrom = form?.Issued_receipt_from ?? form?.issued_receipt_from ?? 0;
      const issuedTo = form?.Issued_receipt_to ?? form?.issued_receipt_to ?? 0;

      const endQty = toInt(form?.Ending_Balance_receipt_qty ?? form?.ending_balance_receipt_qty);
      const endFrom = form?.Ending_Balance_receipt_from ?? form?.ending_balance_receipt_from ?? 0;
      const endTo = form?.Ending_Balance_receipt_to ?? form?.ending_balance_receipt_to ?? 0;

      if (begQty <= 0 && recQty <= 0 && issuedQty <= 0 && endQty <= 0) return;

      rows.push({
        name: type,
        begQty,
        begFrom,
        begTo,
        recQty,
        recFrom,
        recTo,
        issuedQty,
        issuedFrom,
        issuedTo,
        endQty,
        endFrom,
        endTo,
      });
    });

    return rows;
  };

  const buildPrintPayload = ({ row, issuedForms, rcdEntries }) => {
    const rowDate = row?.issued_date || row?.Date || row?.date || new Date();
    const targetDateKey = toDateKey(rowDate);
    const collector = row?.Collector || row?.collector || "";
    const dateObj = new Date(rowDate);

    const collectorEntries = (Array.isArray(rcdEntries) ? rcdEntries : []).filter((entry) =>
      sameCollector(entry?.collector ?? entry?.Collector, collector)
    );

    const sameDayEntries = collectorEntries.filter(
      (entry) =>
        toDateKey(entry?.issued_date ?? entry?.Date ?? entry?.date) === targetDateKey &&
        isPrintableRcdStatus(entry?.status ?? entry?.Status)
    );

    const collections = sameDayEntries.map((entry) => ({
      type: entry?.type_of_receipt ?? entry?.Type_Of_Receipt ?? "",
      from: entry?.receipt_no_from ?? entry?.Receipt_No_From ?? "",
      to: entry?.receipt_no_to ?? entry?.Receipt_No_To ?? "",
      amount: Number(entry?.total ?? entry?.Total ?? 0),
    }));

    const fallbackCollections = [
      {
        type: row?.type_of_receipt ?? row?.Type_Of_Receipt ?? "",
        from: row?.receipt_no_from ?? row?.Receipt_No_From ?? "",
        to: row?.receipt_no_to ?? row?.Receipt_No_To ?? "",
        amount: Number(row?.total ?? row?.Total ?? 0),
      },
    ].filter(
      (item) => item.type || item.from || item.to || Number(item.amount || 0) > 0
    );

    const finalCollections = collections.length > 0 ? collections : fallbackCollections;

    const totalCollections = finalCollections.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const rowFund = row?.fund || row?.Fund || "";
    const rowSerial = row?.serial_no || row?.Serial_No || "";
    const rowType = row?.type_of_receipt || row?.Type_Of_Receipt || "";
    const rowFrom = toInt(row?.receipt_no_from ?? row?.Receipt_No_From);
    const rowTo = toInt(row?.receipt_no_to ?? row?.Receipt_No_To);

    const matchingIssuedForms = (Array.isArray(issuedForms) ? issuedForms : [])
      .filter((form) => sameCollector(form?.Collector ?? form?.collector, collector))
      .filter((form) => {
        const dateKey = toDateKey(form?.Date ?? form?.date ?? form?.Date_Issued ?? form?.date_issued);
        return dateKey === targetDateKey;
      })
      .filter((form) => {
        const formType = String(form?.Form_Type ?? form?.form_type ?? "").trim().toLowerCase();
        return !rowType || formType === String(rowType).trim().toLowerCase();
      })
      .filter((form) => {
        const serial = String(form?.Serial_No ?? form?.serial_no ?? "");
        return !rowSerial || serial === String(rowSerial);
      })
      .sort((a, b) => Number(b?.ID ?? b?.id ?? 0) - Number(a?.ID ?? a?.id ?? 0));

    const matchingIssuedForm =
      matchingIssuedForms.find((form) => {
        const issuedFrom = toInt(form?.Issued_receipt_from ?? form?.issued_receipt_from);
        const issuedTo = toInt(form?.Issued_receipt_to ?? form?.issued_receipt_to);
        if (rowFrom <= 0 || rowTo <= 0 || issuedFrom <= 0 || issuedTo <= 0) return false;
        return issuedFrom <= rowFrom && issuedTo >= rowTo;
      }) || matchingIssuedForms[0];

    const resolvedFund = rowFund || matchingIssuedForm?.Fund || matchingIssuedForm?.fund || "GENERAL FUND";

    const autoAccountability = buildAccountabilityRows({
      collector,
      targetDateKey,
      issuedForms: Array.isArray(issuedForms) ? issuedForms : [],
    });

    console.log("PRINT PAYLOAD:", {
      collector,
      targetDateKey,
      collections: finalCollections.length,
      autoAccountability: autoAccountability.length,
    });

    return {
      header: {
        municipality: "Municipality Of Zamboanguita",
        fund: resolvedFund,
        officer: collector || "ACCOUNTABLE OFFICER",
        liquidatingOfficer: collector || "ACCOUNTABLE OFFICER",
        bank: "Paul Ree Ambrose A. Martinez",
        reference: "",
        treasurer: "Paul Ree Ambrose A. Martinez",
      },
      formattedDate: formatDate(rowDate),
      shortDate: Number.isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleDateString("en-US"),
      collections: finalCollections,
      totalCollections,
      autoAccountability,
    };
  };

  const handlePrintNow = () => {
    if (!printPreviewRef.current) return;
    const previewElement = printPreviewRef.current.querySelector("#rcd-print-preview-root");
    const previewHtml = previewElement?.outerHTML || "";
    if (!previewHtml || !previewHtml.trim()) {
      setSnackbar({
        open: true,
        message: "Nothing to print. Please re-open Print Preview.",
        severity: "warning",
      });
      return;
    }

    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((node) => node.outerHTML)
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      setSnackbar({
        open: true,
        message: "Unable to initialize print view.",
        severity: "error",
      });
      return;
    }

    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>RCD Print Preview</title>
          ${styles}
          <style>
            @page { margin: 12mm; }
            body { margin: 0; background: #fff; color: #000; }
          </style>
        </head>
        <body>${previewHtml}</body>
      </html>
    `);
    iframeDoc.close();

    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const doPrint = () => {
      const win = iframe.contentWindow;
      if (!win) {
        cleanup();
        return;
      }
      win.focus();
      win.onafterprint = cleanup;
      setTimeout(() => {
        win.print();
      }, 400);
    };

    setTimeout(doPrint, 300);
  };

  const handleSavePdf = async () => {
    if (!printPreviewRef.current) return;
    const previewElement = printPreviewRef.current.querySelector("#rcd-print-preview-root");
    if (!previewElement) {
      setSnackbar({
        open: true,
        message: "Nothing to save. Please open Print Preview first.",
        severity: "warning",
      });
      return;
    }

    const collector = printPayload?.header?.officer || "collector";
    const datePart = (printPayload?.formattedDate || "").replace(/[^a-zA-Z0-9]+/g, "-");
    const filename = `RCD-${collector.replace(/[^a-zA-Z0-9]+/g, "-")}-${datePart || "report"}.pdf`;

    // Use a cloned node with explicit border rules so PDF borders match preview/print.
    const exportRoot = document.createElement("div");
    exportRoot.style.position = "fixed";
    exportRoot.style.left = "-100000px";
    exportRoot.style.top = "0";
    exportRoot.style.background = "#fff";
    exportRoot.style.padding = "0";
    exportRoot.style.margin = "0";

    const clonedNode = previewElement.cloneNode(true);
    const forcedBorderStyle = document.createElement("style");
    forcedBorderStyle.textContent = `
      #rcd-print-preview-root,
      #rcd-print-preview-root * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #rcd-print-preview-root .border,
      #rcd-print-preview-root .border-top,
      #rcd-print-preview-root .border-end,
      #rcd-print-preview-root .border-bottom,
      #rcd-print-preview-root .border-start,
      #rcd-print-preview-root table,
      #rcd-print-preview-root th,
      #rcd-print-preview-root td {
        border-color: #000 !important;
        border-width: 1px !important;
        border-style: solid !important;
      }
      #rcd-print-preview-root table {
        border-collapse: collapse !important;
      }
    `;
    exportRoot.appendChild(forcedBorderStyle);
    exportRoot.appendChild(clonedNode);
    document.body.appendChild(exportRoot);

    const options = {
      margin: 8,
      filename,
      image: { type: "png", quality: 1 },
      html2canvas: { scale: 3, useCORS: true, backgroundColor: "#ffffff", logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };

    try {
      await html2pdf().set(options).from(exportRoot).save();
      setSnackbar({
        open: true,
        message: "PDF saved successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to save PDF:", error);
      setSnackbar({
        open: true,
        message: "Failed to save PDF.",
        severity: "error",
      });
    } finally {
      if (exportRoot.parentNode) {
        exportRoot.parentNode.removeChild(exportRoot);
      }
    }
  };

  const preparePrintForRow = async (row, closeMenu = false) => {
    
  if (!row) return null;

  try {
    const [issuedFormsRes, rcdEntriesRes] = await Promise.all([
      axiosInstance.get("/issued-forms"),
      axiosInstance.get("/rcd-entries"),
    ]);

    // ✅ Safely extract data
    const issuedForms =
      issuedFormsRes?.data?.data || issuedFormsRes?.data || [];

    const rcdEntries =
      rcdEntriesRes?.data?.data || rcdEntriesRes?.data || [];

    const payload = buildPrintPayload({
      row,
      issuedForms,
      rcdEntries,
    });

    // ✅ Validate payload before showing preview
    if (!payload) {
      throw new Error("Payload build failed");
    }

    setPrintPayload(payload);
    setOpenPrintPreview(true);

    if (closeMenu) handleMenuClose();
    return payload;

  } catch (error) {
    console.error("Failed to prepare print payload:", error);

    setSnackbar({
      open: true,
      message: "Unable to load accountability data for printing.",
      severity: "error",
    });

    if (closeMenu) handleMenuClose();
    return null;
  }
};

  const handlePrintClick = async () => {
  if (!selectedRow) {
    setSnackbar({
      open: true,
      message: "Select a row first to print.",
      severity: "info",
    });
    return;
  }

  await preparePrintForRow(selectedRow, true);
};

  const handleToolbarPrintClick = () => {
    const defaultCollector = getCollectorFromRow(selectedRow) || "";
    const defaultDate = toDateKey(getDateFromRow(selectedRow)) || "";
    setPrintCollector(defaultCollector);
    setPrintDate(defaultDate);
    setOpenPrintSelector(true);
  };

  const handleConfirmToolbarPrint = async () => {
  if (!printCollector || !printDate) {
    setSnackbar({
      open: true,
      message: "Please select Date and Collector.",
      severity: "warning",
    });
    return;
  }

  const matchedRow = (filteredData || []).find((row) => {
    const collector = getCollectorFromRow(row);
    const rowDate = toDateKey(getDateFromRow(row));
    return sameCollector(collector, printCollector) && rowDate === printDate;
  });

  if (!matchedRow) {
    setSnackbar({
      open: true,
      message: "No matching record found for selected Date and Collector.",
      severity: "warning",
    });
    return;
  }

    // ✅ Get payload from function
  await preparePrintForRow(matchedRow, false);

  // ✅ Set payload AFTER it’s fully built

  // ✅ Then open preview
  setOpenPrintSelector(false);
};

  const handleSearchClick = () => {
    // Move whatever is typed in pendingSearchQuery into searchQuery
    // This triggers the filter in the useEffect
    setSearchQuery(pendingSearchQuery);
  };

  const handleConfirmDelete = async () => {
    if (selectedId === null || selectedId === undefined) {
      setOpenDeleteDialog(false);
      return;
    }

    try {
      await axiosInstance.delete(`/rcd-entries/${selectedId}`, {
        data: {
          performed_by: getAuthUsername(),
        },
      });
      await fetchEntries();
      await fetchBatches();
      if (selectedGenerateBatch) {
        await loadSuggestedCollections(selectedGenerateBatch);
      }
      setSnackbar({
        open: true,
        message: "Entry deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to delete entry:", error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete entry.",
        severity: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
      setSelectedRow(null);
    }
  };

  const printCollectorOptions = Array.from(
    new Set((filteredData || []).map((row) => getCollectorFromRow(row)).filter(Boolean))
  );

  const printDateOptions = Array.from(
    new Set((filteredData || []).map((row) => toDateKey(getDateFromRow(row))).filter(Boolean))
  ).sort((a, b) => (a > b ? -1 : 1));

  const loadSuggestedCollections = async (batch) => {
    if (!batch?.date || !batch?.collector) {
      setSuggestedCollections([]);
      return;
    }

    try {
      setSuggestedCollectionsLoading(true);
      const response = await axiosInstance.get("/rcd/suggested-collections", {
        params: {
          date: batch.date,
          collector: batch.collector,
        },
      });
      setSuggestedCollections(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load suggested collections:", error);
      setSuggestedCollections([]);
      setSnackbar({
        open: true,
        message: "Unable to load suggested collections.",
        severity: "error",
      });
    } finally {
      setSuggestedCollectionsLoading(false);
    }
  };

  const updateBatchStatus = async (batch, status) => {
    if (!batch?.id) {
      setSnackbar({
        open: true,
        message: "This batch is not yet saved in the database.",
        severity: "warning",
      });
      return;
    }

    try {
      setBatchActionLoading(true);
      const payload = { status };

      if (status === "Approved") {
        payload.reviewed_by = batchStatusDialog.reviewed_by || batch.reviewed_by || null;
        payload.remarks = batchStatusDialog.remarks || batch.remarks || null;
      }

      if (status === "Deposited") {
        payload.deposit_reference = batchStatusDialog.deposit_reference || batch.deposit_reference || null;
        payload.remarks = batchStatusDialog.remarks || batch.remarks || null;
      }

      await axiosInstance.patch(`/rcd-batches/${batch.id}/status`, payload);
      await fetchEntries();
      await fetchBatches();

      const nextSelected =
        selectedGenerateBatch && selectedGenerateBatch.id === batch.id
          ? { ...selectedGenerateBatch, stage: status, ...payload }
          : null;
      if (nextSelected) {
        setSelectedGenerateBatch(nextSelected);
      }

      setSnackbar({
        open: true,
        message: `Batch marked as ${status}.`,
        severity: "success",
      });
      setBatchStatusDialog({
        open: false,
        batch: null,
        status: "",
        reviewed_by: "",
        deposit_reference: "",
        remarks: "",
      });
    } catch (error) {
      console.error("Failed to update batch status:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message || "Failed to update batch status.",
        severity: "error",
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  const openBatchStatusDialog = (batch, status) => {
    setBatchStatusDialog({
      open: true,
      batch,
      status,
      reviewed_by: batch?.reviewed_by || "",
      deposit_reference: batch?.deposit_reference || "",
      remarks: batch?.remarks || "",
    });
  };

  const closeBatchStatusDialog = () => {
    setBatchStatusDialog({
      open: false,
      batch: null,
      status: "",
      reviewed_by: "",
      deposit_reference: "",
      remarks: "",
    });
  };

  const submitBatchStatusDialog = async () => {
    if (!batchStatusDialog.batch || !batchStatusDialog.status) return;
    await updateBatchStatus(batchStatusDialog.batch, batchStatusDialog.status);
  };

  const submittedBatches = displayedBatches.filter((batch) => batch.stage === "Submitted");
  const approvedBatches = displayedBatches.filter((batch) => batch.stage === "Approved");
  const depositedBatches = displayedBatches.filter((batch) => batch.stage === "Deposited");
  const draftBatches = displayedBatches.filter((batch) => batch.stage === "Draft");

  const workflowTabs = [
    { key: "overview", label: "Overview" },
    { key: "entries", label: "Daily Entries" },
    { key: "generate-rcd", label: "Generate RCD" },
    { key: "review-queue", label: "Review Queue" },
    { key: "deposit-queue", label: "Deposit Queue" },
    { key: "accountability", label: "Accountability" },
    { key: "return-history", label: "Return History" },
  ];

  const selectedGenerateBatchSuggestedTotal = suggestedCollections.reduce(
    (sum, item) => sum + Number(item.total_amount || 0),
    0
  );
  const selectedGenerateBatchDifference = selectedGenerateBatch
    ? Number(selectedGenerateBatch.total || 0) - selectedGenerateBatchSuggestedTotal
    : 0;
  const selectedSuggestionCount = selectedSuggestionKeys.length;

  return (
  
  <Box
   sx={{
        flexGrow: 1,
        padding: 3,
        minHeight: "100vh",
        backgroundColor: uiColors.pageBg,
        }}>

        <Paper
          sx={{
            mb: 3,
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(15,39,71,0.98) 0%, rgba(15,39,71,0.92) 58%, rgba(214,161,43,0.25) 100%)",
            color: "white",
            boxShadow: "0 18px 36px rgba(9,30,66,0.24)",
            border: "1px solid rgba(214,161,43,0.45)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
                Report of Collection and Deposit
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.9, opacity: 0.92 }}>
                Treasury accountability tracking, collector balances, stock movement, and daily reporting.
              </Typography>
              <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={month ? `Month: ${months.find((m) => m.value === month)?.label || month}` : "Month: All"}
                  size="small"
                  sx={{ bgcolor: uiColors.amberSoft, color: "#fff" }}
                />
                <Chip
                  label={year ? `Year: ${year}` : "Year: All"}
                  size="small"
                  sx={{ bgcolor: uiColors.amberSoft, color: "#fff" }}
                />
                <Chip
                  label={`Workflow: ${workflowTabs.find((tab) => tab.key === activeSection)?.label || "Daily Entries"}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: `1px solid ${uiColors.cardBorder}`,
            boxShadow: "0 8px 22px rgba(15,39,71,0.06)",
            backgroundColor: uiColors.cardBg,
          }}
        >
          <Box display="flex" gap={1.25} flexWrap="wrap">
            {workflowTabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeSection === tab.key ? "contained" : "outlined"}
                onClick={() => showSection(tab.key)}
                sx={
                  activeSection === tab.key
                    ? toolbarButtonSx(uiColors.navy, uiColors.navyHover)
                    : secondaryToolbarButtonSx(uiColors.navy, "rgba(15,39,71,0.07)")
                }
              >
                {tab.label}
              </Button>
            ))}
          </Box>
        </Paper>

        <Box sx={{ mb: 4 }}>
        {/* Search & Filters Row */}
        <Paper
          sx={{
            p: 2.5,
            mb: 2,
            borderRadius: 3,
            border: `1px solid ${uiColors.cardBorder}`,
            boxShadow: "0 8px 22px rgba(15,39,71,0.06)",
            backgroundColor: uiColors.cardBg,
          }}
        >
        <Box display="flex" alignItems="center" gap={3} sx={{ py: 0.5 }}>
          {showFilters && (
            <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Records"
                placeholder="Name or Receipt Number"
                value={pendingSearchQuery}
                onChange={(e) => setPendingSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: "10px", backgroundColor: "#fff" },
                }}
              />
              <Box display="flex" gap={2}>
                <Autocomplete
                  disablePortal
                  options={months}
                  sx={{ width: 180 }}
                  value={months.find((option) => option.value === month) ?? null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Month"
                      variant="outlined"
                      sx={{ "& .MuiInputBase-root": { borderRadius: "10px" } }}
                    />
                  )}
                  onChange={(e, v) => setMonth(v?.value)}
                />

                <Autocomplete
                  disablePortal
                  options={years}
                  sx={{ width: 150 }}
                  value={years.find((option) => option.value === year) ?? null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Year"
                      variant="outlined"
                      sx={{ "& .MuiInputBase-root": { borderRadius: "10px" } }}
                    />
                  )}
                  onChange={(e, v) => setYear(v?.value)}
                />

                <Button
                  variant="contained"
                  sx={toolbarButtonSx(uiColors.navy, uiColors.navyHover)}
                  onClick={handleSearchClick}
                >
                  Apply Filters
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        </Paper>

        {/* Action Buttons Row */}
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: `1px solid ${uiColors.cardBorder}`,
            boxShadow: "0 8px 22px rgba(15,39,71,0.06)",
            backgroundColor: uiColors.cardBg,
          }}
        >
        <Box display="flex" alignItems="center" gap={2} sx={{ py: 0.5 }}>
          <Box display="flex" gap={2} flexGrow={1}>
            {/* New Entry - Primary CTA */}
            <Tooltip title="Add New Entry" arrow>
              <Button
                variant="contained"
                startIcon={<IoMdAdd size={18} />}
                sx={toolbarButtonSx(uiColors.navy, uiColors.navyHover)}
                onClick={handleNewEntryClick}
              >
                New Entry
              </Button>
            </Tooltip>

            {/* Daily Report */}
            <Tooltip title="Open Daily Entries" arrow>
              <Button
                variant="contained"
                startIcon={<IoToday size={16} />}
                sx={secondaryToolbarButtonSx(uiColors.teal, "rgba(15,107,98,0.12)")}
                onClick={toggleDailyTable}
              >
                Daily Entries
              </Button>
            </Tooltip>

            <Tooltip title="Generate Collector RCD by date" arrow>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon size={16} />}
                sx={secondaryToolbarButtonSx(uiColors.sky, "rgba(47,109,181,0.12)")}
                onClick={toggleReportTable}
              >
                Generate RCD
              </Button>
            </Tooltip>

            <Tooltip title="Review submitted RCD batches" arrow>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon size={16} />}
                sx={secondaryToolbarButtonSx(uiColors.amber, "rgba(214,161,43,0.14)")}
                onClick={() => showSection("review-queue")}
              >
                Review Queue
              </Button>
            </Tooltip>

            <Tooltip title="Prepare approved RCDs for bank deposit" arrow>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon size={16} />}
                sx={secondaryToolbarButtonSx("#8f3d2e", "rgba(143,61,46,0.12)")}
                onClick={() => showSection("deposit-queue")}
              >
                Deposit Queue
              </Button>
            </Tooltip>

            <Tooltip title="Open accountability and stock tools" arrow>
              <Button
                variant="contained"
                startIcon={<BiSolidReport size={18} />}
                onClick={() => showSection("accountability")}
                sx={secondaryToolbarButtonSx(uiColors.steel, "rgba(75,93,115,0.12)")}
              >
                Accountability
              </Button>
            </Tooltip>


          </Box>

          <Box display="flex" gap={2}>
            {/* Financial Report */}
            <Tooltip title="Assign accountable forms" arrow>
              <Button
                variant="contained"
                startIcon={<BiSolidReport size={18} />}
                onClick={handleOpenAssignForm}
                sx={secondaryToolbarButtonSx("#6d4c9a", "rgba(109,76,154,0.12)")}
              >
                Assign Form
              </Button>
            </Tooltip>

            {/* Print */}
            <Tooltip title="Print collector RCD batch" arrow>
              <Button
                variant="contained"
                startIcon={<IoMdPrint size={18} />}
                onClick={handleToolbarPrintClick}
                sx={toolbarButtonSx(uiColors.teal, uiColors.tealHover)}
              >
                Print
              </Button>
            </Tooltip>

            {/* Logs */}
            <Tooltip title="Open inventory logs" arrow>
              <Button
                variant="contained"
                startIcon={<IoMdDownload size={18} />}
                onClick={handleLogsClick}
                sx={secondaryToolbarButtonSx(uiColors.steel, "rgba(75,93,115,0.12)")}
                
              >
                Logs
              </Button>
            </Tooltip>
          </Box>
        </Box>
        </Paper>

        {/* Summary Cards */}
        <Box
          display="flex"
          justifyContent="space-between"
          gap={3}
          sx={{
            mt: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {[
            {
              value: displayedWorkflowSummary.total,
              format: "currency",
              text: "Collection Total",
              caption: `${displayedBatches.length} collector-day batches`,
              icon: <AccountBalanceIcon />,
              accent: uiColors.navy,
              soft: "rgba(15,39,71,0.08)",
              onClick: () => showSection("overview"),
            },
            {
              value: displayedWorkflowSummary.draft,
              format: "count",
              text: "Draft RCD",
              caption: `${draftBatches.length} pending collector-day groups`,
              icon: <BusinessCenterIcon />,
              accent: uiColors.amber,
              soft: "rgba(214,161,43,0.1)",
              onClick: () => showSection("entries"),
            },
            {
              value: displayedWorkflowSummary.submitted,
              format: "count",
              text: "Submitted",
              caption: `${submittedBatches.length} ready for review`,
              icon: <GavelIcon />,
              accent: uiColors.teal,
              soft: "rgba(15,107,98,0.08)",
              onClick: () => showSection("review-queue"),
            },
            {
              value: displayedWorkflowSummary.approved,
              format: "count",
              text: "Approved",
              caption: `${approvedBatches.length} ready for deposit`,
              icon: <StorefrontIcon />,
              accent: "#6d4c9a",
              soft: "rgba(109,76,154,0.08)",
              onClick: () => showSection("deposit-queue"),
            },
            {
              value: displayedWorkflowSummary.deposited,
              format: "count",
              text: "Deposited",
              caption: `${depositedBatches.length} finalized batches`,
              icon: <ReceiptLongIcon />,
              accent: uiColors.sky,
              soft: "rgba(47,109,181,0.08)",
              onClick: () => showSection("deposit-queue"),
            },
          ].map(({ value, format, text, caption, icon, accent, soft, onClick }) => (
            <Card key={text} onClick={onClick} sx={{ ...metricCardStyles }}>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.4,
                  background: `linear-gradient(135deg, ${uiColors.navy}, ${accent})`,
                  color: "#fff",
                  borderBottom: `1px solid ${uiColors.cardBorder}`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.9px",
                    textTransform: "uppercase",
                    opacity: 0.95,
                  }}
                >
                  {text}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ px: 2.5, py: 2.3 }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: uiColors.navy,
                      fontWeight: 800,
                      fontSize: "1.45rem",
                      lineHeight: 1.2,
                      mb: 0.5,
                    }}
                  >
                    {typeof value === "number"
                      ? format === "currency"
                        ? new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                            minimumFractionDigits: 2,
                          }).format(value)
                        : new Intl.NumberFormat("en-PH").format(value)
                      : value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: uiColors.steel,
                      fontWeight: 500,
                    }}
                  >
                    {caption}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    backgroundColor: soft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: accent,
                    "& svg": {
                      fontSize: "1.9rem",
                    },
                  }}
                >
                  {icon}
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", px: 2.5, pb: 2.2 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#edf2f7",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: "68%",
                      height: "100%",
                      backgroundColor: accent,
                      borderRadius: "999px",
                    }}
                  />
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      {activeSection === "overview" && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            boxShadow: "0 10px 26px rgba(15,39,71,0.08)",
            border: `1px solid ${uiColors.cardBorder}`,
            backgroundColor: uiColors.cardBg,
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy, mb: 1 }}>
            Phase 1 RCD Workflow
          </Typography>
          <Typography variant="body2" sx={{ color: uiColors.steel, mb: 2 }}>
            Daily entries are grouped by collector and date. Draft batches move to submitted review, then approved, then deposited after bank remittance.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "grid", gap: 1.25 }}>
            <Typography variant="body2"><strong>Daily Entries:</strong> collector records receipt ranges and totals.</Typography>
            <Typography variant="body2"><strong>Generate RCD:</strong> print one RCD per collector and date using submitted or deposited collection rows only.</Typography>
            <Typography variant="body2"><strong>Review Queue:</strong> custodian checks submitted batches before approval.</Typography>
            <Typography variant="body2"><strong>Deposit Queue:</strong> approved and deposited batches are tracked for remittance.</Typography>
            <Typography variant="body2"><strong>Accountability:</strong> assignments, stock, purchases, issue forms, and logs remain available in one area while Phase 2 and 3 are prepared.</Typography>
          </Box>
        </Paper>
      )}

      {activeSection === "generate-rcd" && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: "0 10px 26px rgba(15,39,71,0.08)",
            overflow: "hidden",
            border: `1px solid ${uiColors.cardBorder}`,
            backgroundColor: uiColors.cardBg,
            mb: 3,
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${uiColors.cardBorder}` }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy }}>
              Generate RCD
            </Typography>
            <Typography variant="body2" sx={{ color: uiColors.steel }}>
              Use one collector-day batch to prepare the RCD preview and compare it with active payment collections.
            </Typography>
          </Box>
          {batchActionLoading && (
            <Box sx={{ px: 2.5, pt: 2 }}>
              <Alert severity="info">Updating batch workflow status...</Alert>
            </Box>
          )}
          {batchLoading && (
            <Box sx={{ px: 2.5, pb: 2 }}>
              <Alert severity="info">Loading saved RCD batches...</Alert>
            </Box>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Collector</StyledTableCell>
                <StyledTableCell>Receipt Types</StyledTableCell>
                <StyledTableCell>Entries</StyledTableCell>
                <StyledTableCell>Total</StyledTableCell>
                <StyledTableCell>Workflow</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedBatches.map((batch) => {
                const batchMeta = getWorkflowStatusMeta(batch.stage);
                const printableRow = batch.rows.find((row) =>
                  isPrintableRcdStatus(row?.status ?? row?.Status)
                ) || batch.rows[0];

                return (
                  <TableRow key={batch.key} hover>
                    <TableCell align="center">{formatDate(batch.date)}</TableCell>
                    <TableCell align="center">{batch.collector}</TableCell>
                    <TableCell align="center">{batch.receiptTypeSummary || "Use suggested collections below"}</TableCell>
                    <TableCell align="center">{batch.entryCount}</TableCell>
                    <TableCell align="center">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                        minimumFractionDigits: 2,
                      }).format(batch.total)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={batchMeta.label}
                        size="small"
                        sx={{ fontWeight: 700, backgroundColor: batchMeta.bg, color: batchMeta.color }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          sx={secondaryToolbarButtonSx(uiColors.navy, "rgba(15,39,71,0.07)")}
                          onClick={() => {
                            setSelectedGenerateBatch(batch);
                            loadSuggestedCollections(batch);
                          }}
                        >
                          Suggestions
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          sx={toolbarButtonSx(uiColors.teal, uiColors.tealHover)}
                          onClick={() => {
                            setSelectedGenerateBatch(batch);
                            setSelectedRow(printableRow);
                            setPrintCollector(batch.collector);
                            setPrintDate(batch.date);
                            loadSuggestedCollections(batch);
                            if (printableRow) {
                              preparePrintForRow(printableRow, false);
                            } else {
                              setSnackbar({
                                open: true,
                                message: "No printable entry found for this batch.",
                                severity: "warning",
                              });
                            }
                          }}
                        >
                          Preview RCD
                        </Button>
                        {batch.stage === "Draft" && (
                          <Button
                            size="small"
                            variant="contained"
                            sx={toolbarButtonSx(uiColors.navy, uiColors.navyHover)}
                            onClick={() => updateBatchStatus(batch, "Submitted")}
                          >
                            Submit
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeSection === "generate-rcd" && selectedGenerateBatch && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            boxShadow: "0 10px 26px rgba(15,39,71,0.08)",
            border: `1px solid ${uiColors.cardBorder}`,
            backgroundColor: uiColors.cardBg,
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy }}>
            Suggested Collections
          </Typography>
          <Typography variant="body2" sx={{ color: uiColors.steel, mb: 2 }}>
            Active payment collections for {selectedGenerateBatch.collector} on {formatDate(selectedGenerateBatch.date)}. Cancelled payments are already excluded.
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 2 }}>
            <Card sx={{ p: 2, minWidth: 220, borderRadius: 3, border: `1px solid ${uiColors.cardBorder}`, boxShadow: "none" }}>
              <Typography variant="caption" sx={{ color: uiColors.steel }}>RCD Batch Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy }}>
                {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(Number(selectedGenerateBatch.total || 0))}
              </Typography>
            </Card>
            <Card sx={{ p: 2, minWidth: 220, borderRadius: 3, border: `1px solid ${uiColors.cardBorder}`, boxShadow: "none" }}>
              <Typography variant="caption" sx={{ color: uiColors.steel }}>Suggested Payment Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy }}>
                {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(selectedGenerateBatchSuggestedTotal)}
              </Typography>
            </Card>
            <Card sx={{ p: 2, minWidth: 220, borderRadius: 3, border: `1px solid ${uiColors.cardBorder}`, boxShadow: "none" }}>
              <Typography variant="caption" sx={{ color: uiColors.steel }}>Difference</Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color:
                    selectedGenerateBatchDifference === 0
                      ? "#2e7d32"
                      : selectedGenerateBatchDifference > 0
                        ? "#8f3d2e"
                        : "#0277bd",
                }}
              >
                {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(selectedGenerateBatchDifference)}
              </Typography>
            </Card>
          </Box>
          <Alert
            severity={selectedGenerateBatchDifference === 0 ? "success" : "warning"}
            sx={{ mb: 2 }}
          >
            {selectedGenerateBatchDifference === 0
              ? "RCD batch total matches the active payment collection suggestions."
              : `RCD batch total differs from suggested active collections by ${new Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                  minimumFractionDigits: 2,
                }).format(selectedGenerateBatchDifference)}.`}
          </Alert>
          {suggestedCollectionsLoading ? (
            <Alert severity="info">Loading suggested collections...</Alert>
          ) : suggestedCollections.length === 0 ? (
            <Alert severity="warning">No active payment collections matched this collector-date batch.</Alert>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  mb: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: uiColors.steel }}>
                  Selected suggestions: {selectedSuggestionCount}
                </Typography>
                <Box display="flex" gap={1.25} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    sx={secondaryToolbarButtonSx(uiColors.navy, "rgba(15,39,71,0.07)")}
                    onClick={() =>
                      setSelectedSuggestionKeys(
                        suggestedCollections.map((suggestion, index) =>
                          getSuggestionKey(suggestion, index)
                        )
                      )
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outlined"
                    sx={secondaryToolbarButtonSx(uiColors.steel, "rgba(75,93,115,0.12)")}
                    onClick={() => setSelectedSuggestionKeys([])}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    sx={toolbarButtonSx(uiColors.navy, uiColors.navyHover)}
                    onClick={handleImportSelectedSuggestions}
                  >
                    Import Selected
                  </Button>
                </Box>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 3, border: `1px solid ${uiColors.cardBorder}`, boxShadow: "none" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Select</StyledTableCell>
                    <StyledTableCell>Module</StyledTableCell>
                    <StyledTableCell>Fund</StyledTableCell>
                    <StyledTableCell>Type</StyledTableCell>
                    <StyledTableCell>Receipt From</StyledTableCell>
                    <StyledTableCell>Receipt To</StyledTableCell>
                    <StyledTableCell>Count</StyledTableCell>
                    <StyledTableCell>Total</StyledTableCell>
                    <StyledTableCell>Action</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suggestedCollections.map((item, index) => (
                    <TableRow key={`${item.module}-${item.type_of_receipt}-${index}`} hover>
                      <TableCell align="center">
                        <Checkbox
                          checked={selectedSuggestionKeys.includes(getSuggestionKey(item, index))}
                          onChange={() => toggleSuggestionSelection(getSuggestionKey(item, index))}
                        />
                      </TableCell>
                      <TableCell align="center">{item.module}</TableCell>
                      <TableCell align="center">{item.fund}</TableCell>
                      <TableCell align="center">{item.type_of_receipt}</TableCell>
                      <TableCell align="center">{item.receipt_no_from || "-"}</TableCell>
                      <TableCell align="center">{item.receipt_no_to || "-"}</TableCell>
                      <TableCell align="center">{item.receipt_count}</TableCell>
                      <TableCell align="center">
                        {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(Number(item.total_amount || 0))}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          sx={toolbarButtonSx(uiColors.navy, uiColors.navyHover)}
                          onClick={() => handleImportSuggestedCollection(item)}
                        >
                          Import Entry
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}
        </Paper>
      )}

      {activeSection === "review-queue" && (
        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 10px 26px rgba(15,39,71,0.08)", border: `1px solid ${uiColors.cardBorder}`, mb: 3 }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${uiColors.cardBorder}` }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy }}>
              Review Queue
            </Typography>
            <Typography variant="body2" sx={{ color: uiColors.steel }}>
              Submitted batches should be reviewed by the RCD custodian before approval.
            </Typography>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Collector</StyledTableCell>
                <StyledTableCell>Entries</StyledTableCell>
                <StyledTableCell>Total</StyledTableCell>
                <StyledTableCell>Receipt Types</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submittedBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No submitted RCD batches for review.</TableCell>
                </TableRow>
              ) : (
                submittedBatches.map((batch) => (
                  <TableRow key={batch.key} hover>
                    <TableCell align="center">{formatDate(batch.date)}</TableCell>
                    <TableCell align="center">{batch.collector}</TableCell>
                    <TableCell align="center">{batch.entryCount}</TableCell>
                    <TableCell align="center">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                        minimumFractionDigits: 2,
                      }).format(batch.total)}
                    </TableCell>
                    <TableCell align="center">{batch.receiptTypeSummary || "-"}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        sx={toolbarButtonSx(uiColors.teal, uiColors.tealHover)}
                        onClick={() => openBatchStatusDialog(batch, "Approved")}
                      >
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeSection === "deposit-queue" && (
        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 10px 26px rgba(15,39,71,0.08)", border: `1px solid ${uiColors.cardBorder}`, mb: 3 }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${uiColors.cardBorder}` }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy }}>
              Deposit Queue
            </Typography>
            <Typography variant="body2" sx={{ color: uiColors.steel }}>
              Approved batches are ready for remittance, while deposited batches remain visible for tracking.
            </Typography>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Collector</StyledTableCell>
                <StyledTableCell>Stage</StyledTableCell>
                <StyledTableCell>Total</StyledTableCell>
                <StyledTableCell>Entries</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...approvedBatches, ...depositedBatches].length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No approved or deposited RCD batches found.</TableCell>
                </TableRow>
              ) : (
                [...approvedBatches, ...depositedBatches].map((batch) => {
                  const batchMeta = getWorkflowStatusMeta(batch.stage);
                  return (
                    <TableRow key={batch.key} hover>
                      <TableCell align="center">{formatDate(batch.date)}</TableCell>
                      <TableCell align="center">{batch.collector}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={batchMeta.label}
                          size="small"
                          sx={{ fontWeight: 700, backgroundColor: batchMeta.bg, color: batchMeta.color }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                          minimumFractionDigits: 2,
                        }).format(batch.total)}
                      </TableCell>
                      <TableCell align="center">{batch.entryCount}</TableCell>
                      <TableCell align="center">
                        {batch.stage === "Approved" ? (
                          <Button
                            size="small"
                            variant="contained"
                            sx={toolbarButtonSx(uiColors.sky, uiColors.skyHover)}
                            onClick={() => openBatchStatusDialog(batch, "Deposited")}
                          >
                            Mark Deposited
                          </Button>
                        ) : (
                          <Typography variant="body2" sx={{ color: uiColors.steel }}>
                            Finalized
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {isAccountabilitySection && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            boxShadow: "0 10px 26px rgba(15,39,71,0.08)",
            border: `1px solid ${uiColors.cardBorder}`,
            backgroundColor: uiColors.cardBg,
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: uiColors.navy, mb: 1 }}>
            Accountability Workspace
          </Typography>
          <Typography variant="body2" sx={{ color: uiColors.steel, mb: 2 }}>
            Assignment, inventory, issued forms, stock checking, purchases, returns, and logs stay here while the RCD workflow is separated into entries, review, and deposit queues.
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button variant={activeSection === "assign-form" ? "contained" : "outlined"} sx={secondaryToolbarButtonSx("#6d4c9a", "rgba(109,76,154,0.12)")} onClick={handleOpenAssignForm}>
              Assign Form
            </Button>
            <Button variant={activeSection === "check-stock" ? "contained" : "outlined"} sx={secondaryToolbarButtonSx(uiColors.sky, "rgba(47,109,181,0.12)")} onClick={handleCheckStockClick}>
              Check Stock
            </Button>
            <Button variant={activeSection === "inventory" ? "contained" : "outlined"} sx={secondaryToolbarButtonSx(uiColors.amber, "rgba(214,161,43,0.14)")} onClick={handleInventoryClick}>
              Inventory
            </Button>
            <Button variant={activeSection === "issue-form" ? "contained" : "outlined"} sx={secondaryToolbarButtonSx("#8f3d2e", "rgba(143,61,46,0.12)")} onClick={handleIssueFormClick}>
              Issue Form
            </Button>
            <Button variant={activeSection === "return-form" ? "contained" : "outlined"} sx={secondaryToolbarButtonSx(uiColors.teal, "rgba(15,107,98,0.12)")} onClick={handleOpenReturnForm}>
              Return Form
            </Button>
            <Button variant={activeSection === "return-history" ? "contained" : "outlined"} sx={secondaryToolbarButtonSx("#5f4b32", "rgba(95,75,50,0.12)")} onClick={handleReturnHistoryClick}>
              Return History
            </Button>
            <Button variant={activeSection === "purchase-form" ? "contained" : "outlined"} sx={secondaryToolbarButtonSx(uiColors.steel, "rgba(75,93,115,0.12)")} onClick={handleOpenPurchaseForm}>
              Purchase Form
            </Button>
            <Button variant={activeSection === "logs" ? "contained" : "outlined"} sx={secondaryToolbarButtonSx("#6d4c9a", "rgba(109,76,154,0.12)")} onClick={handleLogsClick}>
              Logs
            </Button>
          </Box>
        </Paper>
      )}


      {activeSection === "daily" && <DailyReport onBack={handleBackToMainTable} />}
      {activeSection === "check-stock" && <CheckStocks onBack={handleBackToAccountability} />}
      {activeSection === "assign-form" && (
        <AssignAccountableForms
          onSaved={() => {
            setSnackbar({
              open: true,
              message: "Accountable form assigned successfully.",
              severity: "success",
            });
            handleBackToAccountability();
          }}
          onCancel={handleBackToAccountability}
        />
      )}
      {activeSection === "inventory" && <Inventory onBack={handleBackToAccountability} />}
      {activeSection === "issue-form" && <IssueForm onBack={handleBackToAccountability} />}
      {activeSection === "return-form" && (
        <ReturnAccountableForm
          onSaved={() => {
            setSnackbar({
              open: true,
              message: "Accountable form return saved successfully.",
              severity: "success",
            });
            handleBackToAccountability();
          }}
          onCancel={handleBackToAccountability}
        />
      )}
      {activeSection === "purchase-form" && (
        <PurchaseForm
          onSaved={() => {
            setSnackbar({
              open: true,
              message: "Purchase saved successfully.",
              severity: "success",
            });
            handleBackToAccountability();
          }}
          onCancel={handleBackToAccountability}
        />
      )}
      {activeSection === "logs" && <Logs onBack={handleBackToAccountability} />}
      {activeSection === "return-history" && <ReturnHistory onBack={handleBackToAccountability} />}

      {showMainTable && <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 4,
                  boxShadow: "0 10px 26px rgba(15,39,71,0.08)",
                  overflow: "hidden",
                  border: `1px solid ${uiColors.cardBorder}`,
                  backgroundColor: uiColors.cardBg,
                  "& .MuiTableCell-root": {
                    py: 2,
                    px: 2,
                  },
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>DATE</StyledTableCell>
                      <StyledTableCell>Name Of Collector</StyledTableCell>
                      <StyledTableCell>Type Of Receipt</StyledTableCell>
                      <StyledTableCell>Receipt No. From</StyledTableCell>
                      <StyledTableCell>Receipt No. To</StyledTableCell>
                      <StyledTableCell>TOTAL</StyledTableCell>
                      <StyledTableCell>Workflow Status</StyledTableCell>
                      <StyledTableCell>ACTION</StyledTableCell>
                    </TableRow>
                  </TableHead>
      
                  <TableBody>
                    {filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            transition: "background-color 0.2s ease",
                            "&:hover": {
                              backgroundColor: "#f7f9fc",
                            },
                            "&:nth-of-type(even)": {
                              backgroundColor: "rgba(15,39,71,0.02)",
                            },
                          }}
                        >
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600} color="#334e68">
                              {formatDate(row.issued_date || row.Date || row.date)}
                            </Typography>
                          </TableCell>
      
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600} color="#102a43">
                              {row.Collector || row.collector}
                            </Typography>
                          </TableCell>
      
                          <TableCell align="center">
                            <Typography variant="body2" color="#486581">
                              {row.Type_Of_Receipt || row.type_of_receipt}
                            </Typography>
                          </TableCell>
      
                          <TableCell align="center">
                            <Typography variant="body2" color="#486581">
                              {row.Receipt_No_From || row.receipt_no_from}
                            </Typography>
                          </TableCell>
      
                          <TableCell align="center">
                            <Typography variant="body2" color="#486581">
                              {row.Receipt_No_To || row.receipt_no_to}
                            </Typography>
                          </TableCell>
      
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="#0f6b62"
                            >
                              {new Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: "PHP",
                                minimumFractionDigits: 2,
                              }).format(Number(row.Total || row.total || 0))}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            {(() => {
                              const statusMeta = getWorkflowStatusMeta(row.Status || row.status);
                              return (
                                <Chip
                                  label={statusMeta.label}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    minWidth: 92,
                                    color: statusMeta.color,
                                    backgroundColor: statusMeta.bg,
                                    border: "1px solid rgba(15,39,71,0.08)",
                                  }}
                                />
                              );
                            })()}
                          </TableCell>
      
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="contained"
                              onClick={(event) => handleMenuClick(event, row)}
                              sx={{
                                textTransform: "none",
                                px: 2,
                                py: 0.75,
                                fontSize: "0.75rem",
                                borderRadius: 2,
                                fontWeight: 700,
                                backgroundColor: uiColors.navy,
                                boxShadow: "0 4px 10px rgba(15,39,71,0.18)",
                                "&:hover": {
                                  backgroundColor: uiColors.navyHover,
                                },
                              }}
                            >
                              Actions
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
      
                {/* Pagination */}
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  alignItems="center"
                  m={2}
                  sx={{
                    borderTop: "1px solid #e6edf3",
                    pt: 1,
                    mt: 0,
                  }}
                >
                  <TablePagination
                    rowsPerPageOptions={[10, 15, 20, 30, 50, 100]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    // onPageChange={handleChangePage}
                    // onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Box>
              </TableContainer>}

               {/* Single menu for ACTIONS */}
                    <Menu
                      id="simple-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => openPermissionDialog("edit")}>Update</MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event propagation
                          openPermissionDialog("delete");
                        }}
                      >
                        Delete
                      </MenuItem>
                      <MenuItem onClick={handleViewClick}>View</MenuItem>
                      <MenuItem onClick={handlePrintClick}>Print</MenuItem>
                    </Menu>
                    {/* Popup for "Add" or "View" content */}
                    <Dialog
                      open={isDialogOpen}
                      onClose={handleCloseDialog}
                      maxWidth="md"
                      fullWidth
                    >
                      <DialogTitle
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {dialogTitle || "Form"}
                        <IconButton onClick={handleCloseDialog} size="small" aria-label="close">
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </DialogTitle>
                      <DialogContent>{dialogContent}</DialogContent>
                    </Dialog>
                    <Dialog
                      open={multiImportDialogOpen}
                      onClose={handleMultiImportClose}
                      maxWidth="md"
                      fullWidth
                    >
                      <DialogTitle
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {`Import Suggested Collection ${multiImportIndex + 1} of ${multiImportQueue.length}`}
                        <IconButton onClick={handleMultiImportClose} size="small" aria-label="close">
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </DialogTitle>
                      <DialogContent>
                        {multiImportQueue[multiImportIndex] && (
                          <NewEntryForm
                            key={`${getSuggestionKey(multiImportQueue[multiImportIndex], multiImportIndex)}-${multiImportIndex}`}
                            initialValues={{
                              issued_date: multiImportQueue[multiImportIndex].collection_date,
                              collector: multiImportQueue[multiImportIndex].collector,
                              fund:
                                multiImportQueue[multiImportIndex].fund === "RPT"
                                  ? "200 Special Education Fund"
                                  : "100 General Fund",
                              type_of_receipt: multiImportQueue[multiImportIndex].type_of_receipt,
                              receipt_no_from: multiImportQueue[multiImportIndex].receipt_no_from,
                              receipt_no_to: multiImportQueue[multiImportIndex].receipt_no_to,
                              total: multiImportQueue[multiImportIndex].total_amount,
                              status: "Not Remit",
                            }}
                            onSaved={handleMultiImportSaved}
                            onCancel={handleMultiImportClose}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={permissionDialogOpen}
                      onClose={handlePermissionClose}
                      maxWidth="xs"
                      fullWidth
                    >
                      <DialogTitle>Permission Required</DialogTitle>
                      <DialogContent>
                        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
                          <Alert severity="warning">
                            Enter your password to {permissionAction === "delete" ? "delete" : "edit"} this RCD entry.
                          </Alert>
                          <TextField
                            label="Password"
                            type="password"
                            value={permissionPassword}
                            onChange={(e) => setPermissionPassword(e.target.value)}
                            error={Boolean(permissionError)}
                            helperText={permissionError || ""}
                            fullWidth
                          />
                        </Box>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handlePermissionClose}>Cancel</Button>
                        <Button
                          variant="contained"
                          onClick={handlePermissionConfirm}
                          disabled={permissionLoading}
                        >
                          {permissionLoading ? "Verifying..." : "Confirm"}
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <Dialog
                      open={batchStatusDialog.open}
                      onClose={closeBatchStatusDialog}
                      maxWidth="sm"
                      fullWidth
                    >
                      <DialogTitle>
                        {batchStatusDialog.status === "Approved"
                          ? "Approve RCD Batch"
                          : "Mark Batch Deposited"}
                      </DialogTitle>
                      <DialogContent>
                        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
                          {batchStatusDialog.status === "Approved" && (
                            <TextField
                              label="Reviewed By"
                              value={batchStatusDialog.reviewed_by}
                              onChange={(e) =>
                                setBatchStatusDialog((prev) => ({
                                  ...prev,
                                  reviewed_by: e.target.value,
                                }))
                              }
                              fullWidth
                            />
                          )}
                          {batchStatusDialog.status === "Deposited" && (
                            <TextField
                              label="Deposit Reference / Slip No."
                              value={batchStatusDialog.deposit_reference}
                              onChange={(e) =>
                                setBatchStatusDialog((prev) => ({
                                  ...prev,
                                  deposit_reference: e.target.value,
                                }))
                              }
                              fullWidth
                            />
                          )}
                          <TextField
                            label="Remarks"
                            value={batchStatusDialog.remarks}
                            onChange={(e) =>
                              setBatchStatusDialog((prev) => ({
                                ...prev,
                                remarks: e.target.value,
                              }))
                            }
                            multiline
                            minRows={3}
                            fullWidth
                          />
                        </Box>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={closeBatchStatusDialog}>Cancel</Button>
                        <Button
                          variant="contained"
                          onClick={submitBatchStatusDialog}
                          disabled={batchActionLoading}
                        >
                          {batchActionLoading ? "Saving..." : "Confirm"}
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <Dialog
                      open={openUpdateDialog}
                      onClose={() => setOpenUpdateDialog(false)}
                      maxWidth="sm"
                      fullWidth
                    >
                      <DialogTitle>Update Entry</DialogTitle>
                      <DialogContent>
                        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
                          <Alert severity="info">
                            To protect accountable-form balances, only total and workflow status can be edited here.
                          </Alert>
                          <TextField
                            label="Date"
                            type="date"
                            value={editFormData.issued_date}
                            onChange={(e) => handleEditFieldChange("issued_date", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            disabled
                            fullWidth
                          />
                          <TextField
                            label="Collector"
                            value={editFormData.collector}
                            onChange={(e) => handleEditFieldChange("collector", e.target.value)}
                            disabled
                            fullWidth
                          />
                          <TextField
                            label="Type of Receipt"
                            value={editFormData.type_of_receipt}
                            onChange={(e) => handleEditFieldChange("type_of_receipt", e.target.value)}
                            disabled
                            fullWidth
                          />
                          <TextField
                            label="Receipt No. From"
                            value={editFormData.receipt_no_from}
                            onChange={(e) => handleEditFieldChange("receipt_no_from", e.target.value)}
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                            disabled
                            fullWidth
                          />
                          <TextField
                            label="Receipt No. To"
                            value={editFormData.receipt_no_to}
                            onChange={(e) => handleEditFieldChange("receipt_no_to", e.target.value)}
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                            disabled
                            fullWidth
                          />
                          <TextField
                            label="Total"
                            type="number"
                            value={editFormData.total}
                            onChange={(e) => handleEditFieldChange("total", e.target.value)}
                            inputProps={{ min: 0, step: "0.01" }}
                            fullWidth
                          />
                          <TextField
                            select
                            label="Status"
                            value={editFormData.status}
                            onChange={(e) => handleEditFieldChange("status", e.target.value)}
                            fullWidth
                          >
                            <MenuItem value="Not Remit">Draft</MenuItem>
                            <MenuItem value="Remit">Submitted</MenuItem>
                            <MenuItem value="Approve">Approved</MenuItem>
                            <MenuItem value="Deposit">Deposited</MenuItem>
                          </TextField>
                        </Box>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveUpdate}>
                          Save Changes
                        </Button>
                      </DialogActions>
                    </Dialog>

                    <Dialog
                      open={openPrintPreview}
                      onClose={() => setOpenPrintPreview(false)}
                      maxWidth="lg"
                      fullWidth
                    >
                      <DialogContent>
                        <div ref={printPreviewRef}>
                          <RcdPrintTable
                            payload={printPayload}
                            onClose={() => setOpenPrintPreview(false)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={openPrintSelector}
                      onClose={() => setOpenPrintSelector(false)}
                      maxWidth="xs"
                      fullWidth
                    >
                      <DialogTitle>Select Date and Collector</DialogTitle>
                      <DialogContent>
                        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
                          <TextField
                            select
                            label="Date"
                            value={printDate}
                            onChange={(e) => setPrintDate(e.target.value)}
                            fullWidth
                          >
                            {printDateOptions.map((dateKey) => (
                              <MenuItem key={dateKey} value={dateKey}>
                                {formatDate(dateKey)}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            select
                            label="Collector"
                            value={printCollector}
                            onChange={(e) => setPrintCollector(e.target.value)}
                            fullWidth
                          >
                            {printCollectorOptions.map((collector) => (
                              <MenuItem key={collector} value={collector}>
                                {collector}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setOpenPrintSelector(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleConfirmToolbarPrint}>
                          Print
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Box>
                      {/*Snackbar Component (with prop fixes)*/}
                      <Snackbar
                        open={snackbar.open}
                        autoHideDuration={6000}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      >
                        <Alert
                          onClose={() => setSnackbar({ ...snackbar, open: false })}
                          severity={snackbar.severity}
                          variant="filled"
                          sx={{ width: "100%" }}
                        >
                          {snackbar.message}
                        </Alert>
                      </Snackbar>
                    </Box>

                
                
                    <Dialog
                      open={openDeleteDialog}
                      onClose={() => setOpenDeleteDialog(false)}
                      maxWidth="xs"
                      fullWidth
                    >
                      <DialogTitle>Confirm Delete</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          Are you sure you want to delete this record? This action cannot be
                          undone.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmDelete}
                          color="error"
                          variant="contained"
                        >
                          Confirm Delete
                        </Button>
                      </DialogActions>
                      
                    </Dialog>
                   



    </Box>
  )
}

export default ReportCollectionDeposit

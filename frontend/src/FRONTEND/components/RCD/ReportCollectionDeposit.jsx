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
import React, { useEffect, useRef, useState } from "react";
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
      const [activeSection, setActiveSection] = useState("main");
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

       const ChhandleCloseDialog = () => {
    setReportDialog({ ...reportDialog, open: false });
  };


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

  useEffect(() => {
    fetchEntries();
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
    setDialogTitle("Purchase Form");
    setDialogContent(<PurchaseForm />);
    setIsDialogOpen(true);
  };

  const handleOpenAssignForm = () => {
    setDialogTitle("Assign Accountable Form");
    setDialogContent(<AssignAccountableForms />);
    setIsDialogOpen(true);
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

    if (section === "financial") {
      setShowDailyTable(false);
      setShowMainTable(false);
      setShowReportTable(true);
      setShowFilters(false);
      return;
    }

    if (section === "check-stock" || section === "inventory" || section === "issue-form" || section === "logs") {
      setShowDailyTable(false);
      setShowMainTable(false);
      setShowReportTable(false);
      setShowFilters(false);
      return;
    }

    // main/default
    setShowDailyTable(false);
    setShowMainTable(true);
    setShowReportTable(false);
    setShowFilters(true);
  };

  const toggleReportTable = () => {
    showSection("financial");
  };

  const toggleDailyTable = () => {
    showSection("daily");
  };

  const handleNewEntryClick = () => {
    showSection("main");
    setDialogTitle("New Entry");
    setDialogContent(
      <NewEntryForm
        onSaved={() => {
          fetchEntries();
          handleCloseDialog();
        }}
        onCancel={handleCloseDialog}
      />
    );
    setIsDialogOpen(true);
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

  const handleBackToMainTable = () => {
    showSection("main");
  };

  // “Download” logic
  const getCollectorFromRow = (row) => row?.Collector || row?.collector || "";
  const getDateFromRow = (row) => row?.issued_date || row?.Date || row?.date || "";

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
      });
      setOpenUpdateDialog(false);
      await fetchEntries();
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

  const toDateKey = (value) => {
    if (!value) return "";
    if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const sameCollector = (entryCollector, targetCollector) =>
    String(entryCollector || "").trim().toLowerCase() === String(targetCollector || "").trim().toLowerCase();

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
      (entry) => toDateKey(entry?.issued_date ?? entry?.Date ?? entry?.date) === targetDateKey
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

    setFilteredData((prev) =>
      prev.filter((row) => String(getRowId(row)) !== String(selectedId))
    );
    setOpenDeleteDialog(false);
    setSelectedId(null);
    setSelectedRow(null);
    setSnackbar({
      open: true,
      message: "Record removed from table.",
      severity: "success",
    });
  };

  const printCollectorOptions = Array.from(
    new Set((filteredData || []).map((row) => getCollectorFromRow(row)).filter(Boolean))
  );

  const printDateOptions = Array.from(
    new Set((filteredData || []).map((row) => toDateKey(getDateFromRow(row))).filter(Boolean))
  ).sort((a, b) => (a > b ? -1 : 1));

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
                  label={showMainTable ? "Main Table" : activeSection.toUpperCase()}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }}
                />
              </Box>
            </Box>
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
            <Tooltip title="Generate Daily Report" arrow>
              <Button
                variant="contained"
                startIcon={<IoToday size={16} />}
                sx={secondaryToolbarButtonSx(uiColors.teal, "rgba(15,107,98,0.12)")}
                onClick={toggleDailyTable}
              >
                Daily Report
              </Button>
            </Tooltip>

            {/* Check Receipt */}
            <Tooltip title="Generate Receipt Report" arrow>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon size={16} />}
                sx={secondaryToolbarButtonSx(uiColors.sky, "rgba(47,109,181,0.12)")}
                onClick={handleCheckStockClick}
              >
                Check Stock
              </Button>
            </Tooltip>

            {/* Inventory */}
            <Tooltip title="Generate Receipt Report" arrow>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon size={16} />}
                sx={secondaryToolbarButtonSx(uiColors.amber, "rgba(214,161,43,0.14)")}
                onClick={handleInventoryClick}
              >
                Inventory
              </Button>
            </Tooltip>

            {/* Issue */}
            <Tooltip title="Generate Receipt Report" arrow>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon size={16} />}
                sx={secondaryToolbarButtonSx("#8f3d2e", "rgba(143,61,46,0.12)")}
                onClick={handleIssueFormClick}
              >
                Issue Form
              </Button>
            </Tooltip>

            {/* Purchase Form */}
            <Tooltip title="Financial Reports" arrow>
              <Button
                variant="contained"
                startIcon={<BiSolidReport size={18} />}
                onClick={handleOpenPurchaseForm}
                sx={secondaryToolbarButtonSx(uiColors.steel, "rgba(75,93,115,0.12)")}
              >
                Purchase Form
              </Button>
            </Tooltip>


          </Box>

          <Box display="flex" gap={2}>
            {/* Financial Report */}
            <Tooltip title="Financial Reports" arrow>
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
            <Tooltip title="Print Report" arrow>
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
            <Tooltip title="Export Data" arrow>
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
            flexDirection: { xs: "column", sm: "row" }, // Responsive layout
          }}
        >
          {[
            {
              value: allTotal,
              text: "Total Collection",
              icon: <AccountBalanceIcon />,
              accent: uiColors.navy,
              soft: "rgba(15,39,71,0.08)",
              onClick: handleClickTotal,
            },
            {
              value: taxOnBusinessTotal,
              text: "Flora My D. Ferrer",
              icon: <BusinessCenterIcon />,
              accent: uiColors.teal,
              soft: "rgba(15,107,98,0.08)",
              onClick: handleClickTax,
            },
            {
              value: regulatoryFeesTotal,
              text: "Emily E. Credo",
              icon: <GavelIcon />,
              accent: uiColors.amber,
              soft: "rgba(214,161,43,0.1)",
              onClick: handleClickRF,
            },
            {
              value: receiptsFromEconomicEnterprisesTotal,
              text: "Ricardo T Enopia",
              icon: <StorefrontIcon />,
              accent: "#6d4c9a",
              soft: "rgba(109,76,154,0.08)",
              onClick: handleClickRFEE,
            },
            {
              value: serviceUserChargesTotal,
              text: "Agnes B. Ello",
              icon: <ReceiptLongIcon />,
              accent: uiColors.sky,
              soft: "rgba(47,109,181,0.08)",
              onClick: handleClickSUC,
            },
          ].map(({ value, text, icon, accent, soft, onClick }) => (
            <Card
              key={text}
              onClick={onClick}
              sx={{
                ...metricCardStyles,
              }}
            >
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
                      ? new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                          minimumFractionDigits: 2,
                        }).format(value)
                      : value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: uiColors.steel,
                      fontWeight: 500,
                    }}
                  >
                    Click to view details
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


      {activeSection === "daily" && <DailyReport onBack={handleBackToMainTable} />}
      {activeSection === "check-stock" && <CheckStocks />}
      {activeSection === "inventory" && <Inventory onBack={handleBackToMainTable} />}
      {activeSection === "issue-form" && <IssueForm onBack={handleBackToMainTable} />}
      {activeSection === "logs" && <Logs />}

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
                      <StyledTableCell>Status</StyledTableCell>
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
                            <Chip
                              label={row.Status || row.status || "Not Remit"}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                minWidth: 92,
                                color: "#0f2747",
                                backgroundColor:
                                  String(row.Status || row.status || "").toLowerCase() === "remit"
                                    ? "rgba(46,125,50,0.14)"
                                    : String(row.Status || row.status || "").toLowerCase() === "deposit"
                                      ? "rgba(2,136,209,0.14)"
                                      : "rgba(214,161,43,0.18)",
                                border: "1px solid rgba(15,39,71,0.08)",
                              }}
                            />
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
                      <MenuItem onClick={handleEditClick}>Update</MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event propagation
                          setSelectedId(getRowId(selectedRow));
                          setOpenDeleteDialog(true);
                          handleMenuClose();
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
                      open={openUpdateDialog}
                      onClose={() => setOpenUpdateDialog(false)}
                      maxWidth="sm"
                      fullWidth
                    >
                      <DialogTitle>Update Entry</DialogTitle>
                      <DialogContent>
                        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
                          <TextField
                            label="Date"
                            type="date"
                            value={editFormData.issued_date}
                            onChange={(e) => handleEditFieldChange("issued_date", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                          <TextField
                            label="Collector"
                            value={editFormData.collector}
                            onChange={(e) => handleEditFieldChange("collector", e.target.value)}
                            fullWidth
                          />
                          <TextField
                            label="Type of Receipt"
                            value={editFormData.type_of_receipt}
                            onChange={(e) => handleEditFieldChange("type_of_receipt", e.target.value)}
                            fullWidth
                          />
                          <TextField
                            label="Receipt No. From"
                            value={editFormData.receipt_no_from}
                            onChange={(e) => handleEditFieldChange("receipt_no_from", e.target.value)}
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                            fullWidth
                          />
                          <TextField
                            label="Receipt No. To"
                            value={editFormData.receipt_no_to}
                            onChange={(e) => handleEditFieldChange("receipt_no_to", e.target.value)}
                            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
                            <MenuItem value="Remit">Remit</MenuItem>
                            <MenuItem value="Not Remit">Not Remit</MenuItem>
                            <MenuItem value="Deposit">Deposit</MenuItem>
                            <MenuItem value="Approve">Approve</MenuItem>
                            <MenuItem value="Purchase">Purchase</MenuItem>
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

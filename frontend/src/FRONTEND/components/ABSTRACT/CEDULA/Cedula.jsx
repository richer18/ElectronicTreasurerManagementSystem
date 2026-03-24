import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PercentIcon from "@mui/icons-material/Percent";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axiosInstance from "../../../../api/axiosInstance";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import { saveAs } from "file-saver";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import { BiSolidReport } from "react-icons/bi";
import { IoMdAdd, IoMdDownload } from "react-icons/io";
import { IoToday } from "react-icons/io5";

import Cedulas from "../../../../components/MD-Components/FillupForm/Cedula";
import PopupDialog from "../../../../components/MD-Components/Popup/PopupDialogCedula_FORM";
import DailyTable from "./TableData/DailyTable";
import ReportTable from "./TableData/ReportTable";

import CedulaFundDialog from "../../../../components/MD-Components/Popup/CedulaFundDialog";

import GenerateReport from "./TableData/GenerateReport";
import { useMaterialUIController } from "../../../../context";
// ------------------------
//  Styled components
// ------------------------
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  whiteSpace: "nowrap",
  fontWeight: 700,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: 11.5,
  background: "#f7f9fc",
  color: "#0f2747",
  borderBottom: "2px solid #d6a12b",
  position: "sticky",
  top: 0,
  zIndex: 1,
}));
// ------------------------
//  Month / Year Options
// ------------------------
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

// ------------------------
//  Helper: Format date
// ------------------------
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  const options = { month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatFixed2 = (value) => toNumber(value).toFixed(2);
const formatPeso = (value) =>
  `₱ ${toNumber(String(value ?? "").replace(/[^\d.-]/g, "")).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ------------------------
//   Main Component
// ------------------------
function Cedula({ ...props }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const uiColors = useMemo(
    () => ({
      navy: darkMode ? "#4f7bb5" : "#0f2747",
      navyHover: darkMode ? "#3f6aa3" : "#0b1e38",
      steel: darkMode ? "#7c8fa6" : "#4b5d73",
      steelHover: darkMode ? "#6b7f97" : "#3c4c60",
      teal: darkMode ? "#3aa08f" : "#0f6b62",
      tealHover: darkMode ? "#2f8b7c" : "#0b544d",
      amber: darkMode ? "#d19a3f" : "#a66700",
      amberHover: darkMode ? "#b7832f" : "#8c5600",
      red: darkMode ? "#d06666" : "#b23b3b",
      redHover: darkMode ? "#b85656" : "#8f2f2f",
      bg: darkMode ? "#0f1117" : "#f5f7fb",
      cardGradients: darkMode
        ? [
            "linear-gradient(135deg, #1c2a3a, #2f4f7f)",
            "linear-gradient(135deg, #1b3d38, #2a8a7f)",
            "linear-gradient(135deg, #2a3440, #4b5d73)",
            "linear-gradient(135deg, #3d2a0c, #a66700)",
          ]
        : [
            "linear-gradient(135deg, #0f2747, #2f4f7f)",
            "linear-gradient(135deg, #0f6b62, #2a8a7f)",
            "linear-gradient(135deg, #4b5d73, #6a7f99)",
            "linear-gradient(135deg, #a66700, #c98a2a)",
          ],
    }),
    [darkMode]
  );
  // 1. Full data from server
  const [data, setData] = useState([]);
  // 2. Filtered data for the table
  const [filteredData, setFilteredData] = useState([]);

  // 3. Search states:
  //    a) what user is typing
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  //    b) what we actually filter on
  const [searchQuery, setSearchQuery] = useState("");

  // 4. Month/year filters
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [day, setDay] = useState(null);

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);

  // Toggle sub-tables
  const [showMainTable, setShowMainTable] = useState(true);
  const [showReportTable, setShowReportTable] = useState(false);
  const [showDailyTable, setShowDailyTable] = useState(false);

  // Menu & selectedRow states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [showFilters, setShowFilters] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [viewRow, setViewRow] = useState(null);

  const [reportDialog, setReportDialog] = useState({
    open: false,
    status: "idle", // 'idle' | 'loading' | 'success' | 'error'
    progress: 0,
  });

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

  const fetchCedulaData = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get("/cedula");
      const rows = Array.isArray(response.data) ? response.data : [];
      setData(rows);
      setFilteredData(rows);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setFilteredData([]);
    }
  }, []);

  // ------------------------
  //  1) Fetch data once
  // ------------------------
  useEffect(() => {
    fetchCedulaData();
  }, [fetchCedulaData]);

  // ------------------------
  //  2) Filter by Month , Day, & Year
  // ------------------------
  const getFilteredDataByMonthYear = () => {
    if (!month || !year) return filteredData;

    return filteredData.filter((row) => {
      if (!row.DATE) return false;
      const rowDate = new Date(row.DATE);

      const monthMatches = rowDate.getMonth() + 1 === Number(month);
      const yearMatches = rowDate.getFullYear() === Number(year);
      const dayMatches = day ? rowDate.getDate() === Number(day) : true;

      return monthMatches && yearMatches && dayMatches;
    });
  };

  // ------------------------
  //  2) Filter data on searchQuery & month/year
  // ------------------------
  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    let newFiltered = data;
    const normalize = (value) => String(value ?? "").toLowerCase();

    // (a) Filter by searchQuery
    if (searchQuery?.trim()) {
      const q = searchQuery.trim().toLowerCase();
      newFiltered = newFiltered.filter((row) => {
        return (
          normalize(row?.NAME).includes(q) ||
          normalize(row?.CTCNO ?? row?.["CTC NO"]).includes(q) ||
          normalize(row?.LOCAL_TIN ?? row?.["LOCAL TIN"]).includes(q) ||
          normalize(row?.CASHIER).includes(q)
        );
      });
    }

    // (b) Filter by month, day, and year
    if (month || year || day) {
      newFiltered = newFiltered.filter((row) => {
        if (!row.DATE) return false;
        const rowDate = new Date(row.DATE);
        const rowMonth = rowDate.getMonth() + 1;
        const rowDay = rowDate.getDate();
        const rowYear = rowDate.getFullYear();

        const monthMatches = month ? rowMonth === parseInt(month) : true;
        const dayMatches = day ? rowDay === parseInt(day) : true;
        const yearMatches = year ? rowYear === parseInt(year) : true;

        return monthMatches && dayMatches && yearMatches;
      });
    }

    setFilteredData(newFiltered);
    setPage(0); // reset pagination when filters change
  }, [data, searchQuery, month, day, year]);
  // ------------------------
  //  3) Table pagination
  // ------------------------
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // ------------------------
  //  4) Dialog / Form
  // ------------------------
  const handleClickOpen = (content) => {
    setDialogContent(content);
    setIsDialogOpen(true);
  };
  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleEditClick = () => {
    if (!selectedRow) return;

    setDialogContent(
      <Cedulas
        data={{
          ...selectedRow,
          ctcno: selectedRow.CTCNO ?? selectedRow["CTC NO"],
        }}
        mode="edit"
        onSaved={fetchCedulaData}
        onClose={handleClose}
      />
    );
    setIsDialogOpen(true);
    handleMenuClose();
  };

  // Menu open
  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };
  // Menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // “View” from the menu
  const handleViewClick = () => {
    if (!selectedRow) return;
    setViewRow(selectedRow);
    handleMenuClose();
  };

  // Close the “View” dialog
  const handleCloseDialog = () => {
    setViewRow(null);
  };

  // ------------------------
  //  5) Subtable toggles
  // ------------------------
  const toggleReportTable = () => {
    setShowReportTable(true);
    setShowMainTable(false);
    setShowDailyTable(false);
    setShowFilters(false);
  };
  const toggleDailyTable = () => {
    setShowDailyTable(true);
    setShowMainTable(false);
    setShowReportTable(false);
    setShowFilters(false); // Hide filters
  };

  const handleBack = () => {
    setShowReportTable(false);
    setShowDailyTable(false);
    setShowMainTable(true);
    setShowFilters(true);
  };

  // ------------------------
  //  6) Summations
  // ------------------------
  const totalBasic =
    "₱" +
    filteredData
      .reduce((acc, row) => acc + parseFloat(row.BASIC ?? 0), 0)
      .toFixed(2);

  const totalTaxDue =
    "₱" +
    filteredData
      .reduce((acc, row) => acc + parseFloat(row.TAX_DUE ?? 0), 0)
      .toFixed(2);

  const totalInterest =
    "₱" +
    filteredData
      .reduce((acc, row) => acc + parseFloat(row.INTEREST ?? 0), 0)
      .toFixed(2);

  const totalAmount =
    "₱" +
    filteredData
      .reduce((acc, row) => acc + parseFloat(row.TOTALAMOUNTPAID ?? 0), 0)
      .toFixed(2);

  // ------------------------
  //  7) Download logic
  // ------------------------
  const handleDownload = () => {
    if (!month || !year) {
      setSnackbar({
        open: true,
        message: "Please select both month and year before downloading.",
        severity: "warning",
      });
      return;
    }

    const filteredExportData = getFilteredDataByMonthYear();

    if (filteredExportData.length === 0) {
      setSnackbar({
        open: true,
        message:
          "No data available to download for the selected month and year.",
        severity: "info",
      });
      return;
    }

    // Convert date to Philippine Time and human-readable format
    const formattedData = filteredExportData.map((item) => {
      return {
        ...item,
        DATE: new Date(item.DATE).toLocaleString("en-US", {
          timeZone: "Asia/Manila", // Set timezone to PHT
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    const file = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([file], { type: "application/octet-stream" });
    const fileName = `Cedula_Report_${months.find((m) => m.value === month)?.label}_${year}.xlsx`;
    saveAs(blob, fileName);
  };

  // ------------------------
  //  8) Handler for the Search button
  // ------------------------
  const handleSearchClick = () => {
    // Move whatever is typed in pendingSearchQuery into searchQuery
    // This triggers the filter in the useEffect
    setSearchQuery(pendingSearchQuery);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      const response = await axiosInstance.delete(
        `/deleteCedula/${encodeURIComponent(selectedId)}`
      );

      setSnackbar({
        open: true,
        message: response?.data?.message || "Record deleted successfully.",
        severity: "success",
      });
      await fetchCedulaData();
    } catch (error) {
      console.error("Error deleting record:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Error deleting record.",
        severity: "error",
      });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedId(null);
      handleMenuClose();
    }
  };

  // ------------------------
  //  UI Rendering
  // ------------------------
  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: { xs: 2, md: 3 },
        minHeight: "100vh",
        backgroundColor: uiColors.bg,
      }}
    >
      <Box sx={{ mb: 4 }}>
        {/* Toolbar Section */}
        <Box display="flex" flexDirection="column" gap={2.5}>
          {/* Search & Filters Row */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            {showFilters && (
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                flexGrow={1}
                flexWrap="wrap"
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Search Records"
                  placeholder="Name, CTC number, local TIN, or cashier"
                  value={pendingSearchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPendingSearchQuery(value);
                    setSearchQuery(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchClick();
                    }
                  }}
                  sx={{
                    minWidth: { xs: "100%", md: 280 },
                    "& .MuiInputBase-input": {
                      color: (theme) => theme.palette.text.primary,
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: (theme) => theme.palette.text.secondary,
                      opacity: 1,
                    },
                    "& .MuiInputLabel-root": {
                      color: (theme) => theme.palette.text.secondary,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: (theme) => theme.palette.text.primary,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: (theme) => theme.palette.divider,
                    },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: (theme) => theme.palette.text.secondary,
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: (theme) => theme.palette.text.primary,
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                    root: {
                      sx: { borderRadius: "8px" },
                    },
                  }}
                />

                <Box display="flex" gap={2} flexWrap="wrap">
                  <Autocomplete
                    disablePortal
                    options={months}
                    sx={{ width: { xs: "100%", sm: 180 } }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Month"
                        variant="outlined"
                        sx={{
                          "& .MuiInputBase-input": {
                            color: (theme) => theme.palette.text.primary,
                          },
                          "& .MuiInputLabel-root": {
                            color: (theme) => theme.palette.text.secondary,
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: (theme) => theme.palette.text.primary,
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: (theme) => theme.palette.divider,
                          },
                          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: (theme) => theme.palette.text.secondary,
                          },
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: (theme) => theme.palette.text.primary,
                          },
                        }}
                      />
                    )}
                    onChange={(e, v) => setMonth(v?.value)}
                  />
                  {/* Day Filter */}

                  <Autocomplete
                    disablePortal
                    options={[...Array(31)].map((_, i) => ({
                      label: `${i + 1}`,
                      value: i + 1,
                    }))}
                    sx={{ width: { xs: "100%", sm: 140 } }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Day"
                        variant="outlined"
                        sx={{
                          "& .MuiInputBase-input": {
                            color: (theme) => theme.palette.text.primary,
                          },
                          "& .MuiInputLabel-root": {
                            color: (theme) => theme.palette.text.secondary,
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: (theme) => theme.palette.text.primary,
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: (theme) => theme.palette.divider,
                          },
                          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: (theme) => theme.palette.text.secondary,
                          },
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: (theme) => theme.palette.text.primary,
                          },
                        }}
                      />
                    )}
                    onChange={(e, v) => setDay(v?.value)}
                  />

                  <Autocomplete
                    disablePortal
                    options={years}
                    sx={{ width: { xs: "100%", sm: 150 } }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Year"
                        variant="outlined"
                        sx={{
                          "& .MuiInputBase-input": {
                            color: (theme) => theme.palette.text.primary,
                          },
                          "& .MuiInputLabel-root": {
                            color: (theme) => theme.palette.text.secondary,
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: (theme) => theme.palette.text.primary,
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: (theme) => theme.palette.divider,
                          },
                          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: (theme) => theme.palette.text.secondary,
                          },
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: (theme) => theme.palette.text.primary,
                          },
                        }}
                      />
                    )}
                    onChange={(e, v) => setYear(v?.value)}
                  />

                  <Button
                     variant="contained"
                  sx={{
                    px: 4,
                    height: "56px",
                    borderRadius: "8px",
                    boxShadow: "none",
                    width: { xs: "100%", sm: "auto" },
                    backgroundColor: uiColors.navy,
                    "&:hover": {
                      backgroundColor: uiColors.navyHover,
                      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                    onClick={handleSearchClick}
                    startIcon={<SearchIcon />}
                  >
                    Apply Filters
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {/* Action Buttons Row */}
          <Box display="flex" alignItems="center" gap={2} sx={{ py: 1 }}>
            <Box display="flex" gap={2} flexGrow={1} flexWrap="wrap">
              {/* New Entry - Primary CTA */}
              <Tooltip title="Add New Entry" arrow>
                <Button
                  variant="contained"
                  startIcon={<IoMdAdd size={18} />}
                  sx={{
                    px: 3.5,
                    backgroundColor: uiColors.navy,
                    color: "white",
                    "&:hover": {
                      backgroundColor: uiColors.navyHover,
                      transform: "translateY(-1px)",
                      boxShadow: "0 3px 10px rgba(15, 39, 71, 0.3)",
                    },
                    textTransform: "none",
                    fontSize: 15,
                    fontWeight: 600,
                    borderRadius: "10px",
                    minWidth: "130px",
                    height: "44px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 6px rgba(15, 39, 71, 0.2)",
                  }}
                  onClick={() =>
                    handleClickOpen(
                      <Cedulas onClose={handleClose} onSaved={fetchCedulaData} />
                    )
                  }
                >
                  New Entry
                </Button>
              </Tooltip>

              {/* Daily Report */}
              <Tooltip title="Generate Daily Report" arrow>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<IoToday size={16} />}
                  sx={{
                    px: 3.5,
                    backgroundColor: uiColors.teal,
                    color: "white",
                    "&:hover": {
                      backgroundColor: uiColors.tealHover,
                      transform: "translateY(-1px)",
                    },
                    textTransform: "none",
                    fontSize: 15,
                    fontWeight: 600,
                    borderRadius: "10px",
                    minWidth: "130px",
                    height: "44px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 6px rgba(15, 107, 98, 0.2)",
                  }}
                  onClick={toggleDailyTable}
                >
                  Daily Report
                </Button>
              </Tooltip>

              {/* Check Receipt */}
              <Tooltip title="Generate Receipt Report" arrow>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ReceiptIcon size={16} />}
                  sx={{
                    px: 3.5,
                    backgroundColor: uiColors.steel,
                    color: "white",
                    "&:hover": {
                      backgroundColor: uiColors.steelHover,
                      transform: "translateY(-1px)",
                    },
                    textTransform: "none",
                    fontSize: 15,
                    fontWeight: 600,
                    borderRadius: "10px",
                    minWidth: "130px",
                    height: "44px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 6px rgba(75, 93, 115, 0.2)",
                  }}
                  onClick={handleGenerateReport}
                >
                  Check Receipt
                </Button>
              </Tooltip>
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              {/* Financial Report */}
              <Tooltip title="Financial Reports" arrow>
                <Button
                  variant="contained"
                  startIcon={<BiSolidReport size={18} />}
                  onClick={toggleReportTable}
                  sx={{
                    px: 3,
                    height: 44,
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: "all 0.2s ease",
                    backgroundColor: uiColors.red,
                    color: "white",
                    "&:hover": {
                      backgroundColor: uiColors.redHover,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Financial Report
                </Button>
              </Tooltip>

              {/* Download */}
              <Tooltip title="Export Data" arrow>
                <Button
                  variant="contained"
                  startIcon={<IoMdDownload size={18} />}
                  onClick={handleDownload}
                  sx={{
                    px: 3,
                    height: 44,
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: "none",
                    color: "white",
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: "all 0.2s ease",
                    backgroundColor: uiColors.amber,
                    "&:hover": {
                      backgroundColor: uiColors.amberHover,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Download
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Box>

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
              value: formatPeso(totalAmount),
              text: "Total Revenue",
              icon: <AccountBalanceIcon />,
              gradient: uiColors.cardGradients[0],
            },
            {
              value: formatPeso(totalBasic),
              text: "Basic Income",
              icon: <MonetizationOnIcon />,
              gradient: uiColors.cardGradients[1],
            },
            {
              value: formatPeso(totalTaxDue),
              text: "Tax Liability",
              icon: <ReceiptLongIcon />,
              gradient: uiColors.cardGradients[2],
            },
            {
              value: formatPeso(totalInterest),
              text: "Accrued Interest",
              icon: <PercentIcon />,
              gradient: uiColors.cardGradients[3],
            },
          ].map(({ value, text, icon, gradient }) => (
            <Card
              key={text}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: "16px",
                background: gradient,
                color: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                minWidth: 0,
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-50%",
                  right: "-50%",
                  width: "100%",
                  height: "100%",
                  background: "rgba(255,255,255,0.08)",
                  transform: "rotate(25deg)",
                  transition: "all 0.4s ease",
                },
                "&:hover::before": {
                  transform: "rotate(25deg) translate(15%, 15%)",
                },
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      opacity: 0.9,
                      mb: 0.5,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {text}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      lineHeight: 1.2,
                      mb: 1,
                    }}
                  >
                    {typeof value === "number"
                      ? `₱ ${value.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    opacity: 0.2,
                    position: "absolute",
                    right: 20,
                    top: 20,
                    "& svg": {
                      fontSize: "3rem",
                    },
                  }}
                >
                  {icon}
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1.5 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "4px",
                    backgroundColor: "rgba(255,255,255,0.3)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: "70%", // Adjust dynamically if needed
                      height: "100%",
                      backgroundColor: "white",
                      borderRadius: "2px",
                    }}
                  />
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Sub-tables */}
      {showDailyTable && (
        <DailyTable
          onBack={handleBack}
          setShowFilters={setShowFilters}
        />
      )}
      {showReportTable && (
        <ReportTable onBack={handleBack} setShowFilters={setShowFilters} />
      )}

      {/* Main Table */}
      {showMainTable && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: 3,
            backgroundColor: (theme) => theme.palette.background.paper,
            "& .MuiTableCell-root": {
              py: 2,
              color: (theme) => theme.palette.text.primary,
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>DATE</StyledTableCell>
                <StyledTableCell>CTC NO</StyledTableCell>
                <StyledTableCell>LOCAL TIN</StyledTableCell>
                <StyledTableCell>NAME</StyledTableCell>
                <StyledTableCell>BASIC</StyledTableCell>
                <StyledTableCell>TAX DUE</StyledTableCell>
                <StyledTableCell>INTEREST</StyledTableCell>
                <StyledTableCell>TOTAL</StyledTableCell>
                <StyledTableCell>CASHIER</StyledTableCell>
                <StyledTableCell>ACTION</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell align="center" colSpan={10}>
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, idx) => (
                    <TableRow key={row?.CTC_ID || row?.["CTC NO"] || row?.id || idx}>
                      <TableCell align="center">{formatDate(row?.DATE)}</TableCell>
                      <TableCell align="center">{row?.CTCNO || row?.["CTC NO"] || "-"}</TableCell>
                      <TableCell align="center">{row?.LOCAL_TIN || row?.["LOCAL TIN"] || "-"}</TableCell>
                      <TableCell align="center">{row?.NAME || "-"}</TableCell>
                      <TableCell align="center">{formatFixed2(row?.BASIC)}</TableCell>
                      <TableCell align="center">{formatFixed2(row?.TAX_DUE)}</TableCell>
                      <TableCell align="center">{formatFixed2(row?.INTEREST)}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                            minimumFractionDigits: 2,
                          }).format(toNumber(row?.TOTAL ?? row?.TOTALAMOUNTPAID))}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{row?.CASHIER || "-"}</TableCell>
                      <TableCell align="center">
                        <Button
                          aria-controls="simple-menu"
                          aria-haspopup="true"
                          onClick={(event) => handleMenuClick(event, row)}
                          variant="contained"
                          color="primary"
                        >
                          ACTIONS
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>

          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            m={1}
          >
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </TableContainer>
      )}

      {/* Single menu for ACTIONS */}
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewClick}>View</MenuItem>
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            const targetId = selectedRow?.CTC_ID ?? selectedRow?.["CTC NO"] ?? selectedRow?.CTCNO ?? null;
            setSelectedId(targetId);
            setOpenDeleteDialog(true);
            handleMenuClose();
          }}
        >
          Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log("Download", selectedRow);
            handleMenuClose();
          }}
        >
          Download
        </MenuItem>
      </Menu>

      {/* Dialog */}
      {isDialogOpen && (
        <PopupDialog open={isDialogOpen} onClose={handleClose}>
          {dialogContent}
        </PopupDialog>
      )}

      {!!viewRow && (
        <CedulaFundDialog
          open={Boolean(viewRow)}
          onClose={handleCloseDialog}
          data={viewRow}
        />
      )}

      {/* Confirmation Dialog */}
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

      <Box {...props}>
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

      <GenerateReport
        open={reportDialog.open}
        onClose={ChhandleCloseDialog}
        status={reportDialog.status}
        progress={reportDialog.progress}
      />
    </Box>
  );
}

export default Cedula;

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from "@mui/icons-material/PieChart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Tooltip,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { format, parseISO } from "date-fns";
import { saveAs } from "file-saver";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BiSolidReport } from "react-icons/bi";
import { IoMdAdd, IoMdDownload } from "react-icons/io";
import { IoToday } from "react-icons/io5";
import { MdSummarize } from "react-icons/md";
import * as XLSX from "xlsx";
import axios from "../../../../api/axiosInstance";
import { useMaterialUIController } from "../../../../context";
import RealPropertyTaxAbstract from "../../../../components/MD-Components/FillupForm/AbstractRPT";
import {
  default as PopupDialog,
  default as PopupDialogView,
} from "../../../../components/MD-Components/Popup/PopupDialogRPT_FORM";
import DailyTable from "./TableData/DailyTable";
import BarangaySharesTable from "./TableData/BarangaySharesTable";
import GenerateReport from "./TableData/GenerateReport";
import ReportTable from "./TableData/ReportTable";
import SummaryTable from "./TableData/Summary";

const StyledTableCell = styled(TableCell)(() => ({
  whiteSpace: "nowrap",
  fontWeight: 700,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: 11.5,
  background: "#f7f9fc",
  color: "#0f2747",
  borderBottom: "2px solid #d6a12b",
}));

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
  { label: "2030", value: "2030" },
];

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatMoney = (value, options = {}) => {
  const amount = Number(value || 0);
  const normalized = options.absolute ? Math.abs(amount) : amount;
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalized);
};

const shouldIncludeRptReportRow = (row) => {
  const includeInReport = row?.include_in_report ?? row?.INCLUDE_IN_REPORT;
  if (includeInReport !== undefined && includeInReport !== null) {
    return Number(includeInReport) !== 0;
  }

  const isVoid = row?.is_void ?? row?.IS_VOID;
  if (Number(isVoid || 0) === 1) {
    return false;
  }

  const isCancelled = row?.is_cancelled ?? row?.IS_CANCELLED;
  if (Number(isCancelled || 0) === 1) {
    return false;
  }

  const paymentStatus = (row?.payment_status_ct ?? row?.PAYMENT_STATUS_CT ?? "")
    .toString()
    .trim()
    .toUpperCase();

  return paymentStatus !== "CNL";
};

const initialFormData = {
  date: "",
  barangay: "",
  cashier: "",
  currentYear: "",
  currentPenalties: "",
  currentDiscounts: "",
  prevYear: "",
  prevPenalties: "",
  priorYears: "",
  priorPenalties: "",
  total: 0,
  share: 0,
  additionalCurrentYear: "",
  additionalCurrentPenalties: "",
  additionalCurrentDiscounts: "",
  additionalPrevYear: "",
  additionalPrevPenalties: "",
  additionalPriorYears: "",
  additionalPriorPenalties: "",
  additionalTotal: 0,
  gfTotal: 0,
  name: "",
  receipt: "",
  status: "",
};

function Row({ row }) {
  // 🟢 State Management
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedRow, setSelectedRow] = React.useState(null);

  const [selectedRowView, setSelectedRowView] = React.useState(null);
  // const [openDialog, setOpenDialog] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const [rows, setRows] = React.useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [openDialogView, setOpenDialogView] = React.useState(false);

  // 🟢 Menu Handlers
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // 🟢 View Dialog Handlers
  const handleView = (row) => {
    setSelectedRowView(row);
    setOpenDialogView(true);
    handleMenuClose();
  };

  const handleClose = () => {
    setOpenDialogView(false);
    setSelectedRowView(null);
  };

  // 🟢 Edit Dialog Handlers
  const handleEdit = (row) => {
    // ✅ Convert ISO date to yyyy-MM-dd format
    const formattedDate = format(parseISO(row.date), "yyyy-MM-dd");

    // ✅ Map snake_case keys to camelCase keys
    const formattedRow = {
      id: row.id,
      date: formattedDate,
      barangay: row.barangay,
      cashier: row.cashier,
      currentYear: row.current_year,
      currentPenalties: row.current_penalties,
      currentDiscounts: row.current_discounts,
      prevYear: row.prev_year,
      prevPenalties: row.prev_penalties,
      priorYears: row.prior_years,
      priorPenalties: row.prior_penalties,
      total: row.total,
      share: row.share,
      additionalCurrentYear: row.additional_current_year,
      additionalCurrentPenalties: row.additional_penalties,
      additionalCurrentDiscounts: row.additional_discounts,
      additionalPrevYear: row.additional_prev_year,
      additionalPrevPenalties: row.additional_prev_penalties,
      additionalPriorYears: row.additional_prior_years,
      additionalPriorPenalties: row.additional_prior_penalties,
      additionalTotal: row.additional_total,
      gfTotal: row.gf_total,
      name: row.name,
      receipt: row.receipt_no, // ✅ Match `receipt_no` to `receipt`
      status: row.status,
      advanced_payment: row.advanced_payment,
      comments: row.comments,
    };

    console.log("Formatted Row for Edit:", formattedRow); // Debugging

    setSelectedRow(formattedRow);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setSelectedRow(null);
  };

  const handleUpdate = (updatedData) => {
    console.log("Updated Data:", updatedData);
    setEditDialogOpen(false);
  };

  // 🟢 Delete Function
  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      // ✅ Send DELETE request to Laravel endpoint
      const response = await axios.delete(`/deleteRPT/${selectedId}`);

      // ✅ Show success message
      alert(response.data.message || "Record deleted successfully");

      // ✅ Update UI state by removing the deleted row
      setRows((prevRows) => prevRows.filter((row) => row.id !== selectedId));
    } catch (error) {
      console.error("Error deleting record:", error);
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Error deleting record"
      );
    } finally {
      // ✅ Close the delete confirmation dialog
      setOpenDeleteDialog(false);
      setSelectedId(null);
    }
  };

  return (
    <>
      {/* 🟢 Table Row */}
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell align="center">{formatDate(row.date)}</TableCell>
        <TableCell align="center">{row.paid_by || row.name}</TableCell>
        <TableCell align="center">{row.receipt_no}</TableCell>
        <TableCell align="center">{formatMoney(row.current_year)}</TableCell>
        <TableCell align="center">{formatMoney(row.current_penalties)}</TableCell>
        <TableCell align="center">
          {formatMoney(row.current_discounts, { absolute: true })}
        </TableCell>
        <TableCell align="center">{formatMoney(row.prev_year)}</TableCell>
        <TableCell align="center">{formatMoney(row.prev_penalties)}</TableCell>
        <TableCell align="center">{formatMoney(row.prior_years)}</TableCell>
        <TableCell align="center">{formatMoney(row.prior_penalties)}</TableCell>
        <TableCell align="center">
          {" "}
          <Typography variant="body2" fontWeight={600} color="success.main">
            {formatMoney(row.total)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Button
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
            variant="contained"
            sx={{
              textTransform: "none",
              px: 2,
              py: 0.75,
              fontSize: "0.75rem",
              borderRadius: 2,
            }}
          >
            Actions
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleView(row)}>View</MenuItem>
            <MenuItem onClick={() => handleEdit(row)}>Edit</MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation(); // Prevent event propagation
                setSelectedId(rows.id);
                setOpenDeleteDialog(true);
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </TableCell>
      </TableRow>

      {/* 🟢 View Dialog */}
      <Dialog
        open={openDialogView}
        onClose={handleClose}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>Receipt Details</DialogTitle>
        <DialogContent>
          {selectedRowView && (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 4,
                boxShadow: 3,
                maxHeight: "70vh",
                overflowY: "auto",
                width: "100%",
                "& .MuiTableCell-root": { py: 2, px: 3 },
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    {[
                      "Date",
                      "Name of Taxpayer",
                      "Paid By",
                      "Receipt No.",
                      "Current Year",
                      "Penalties",
                      "Discounts",
                      "Immediate Preceding Year",
                      "Penalties",
                      "Prior Years",
                      "Penalties",
                      "Total",
                      "Barangay",
                      "25% Share",
                      "Additional Current Year",
                      "Additional Penalties",
                      "Additional Discounts",
                      "Additional Prev Year",
                      "Additional Prev Penalties",
                      "Additional Prior Years",
                      "Additional Prior Penalties",
                      "Additional Total",
                      "GF and SEF",
                      "Status",
                      "Cashier",
                    ].map((header) => (
                      <StyledTableCell
                        key={header}
                        align="center"
                        sx={{ fontWeight: "bold" }}
                      >
                        {header}
                      </StyledTableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center">
                      {formatDate(selectedRowView.date)}
                    </TableCell>
                    <TableCell align="center">{selectedRowView.name}</TableCell>
                    <TableCell align="center">
                      {selectedRowView.paid_by}
                    </TableCell>
                    <TableCell align="center">
                      {selectedRowView.receipt_no}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.current_year)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.current_penalties)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.current_discounts, {
                        absolute: true,
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.prev_year)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.prev_penalties)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.prior_years)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.prior_penalties)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.total)}
                    </TableCell>
                    <TableCell align="center">
                      {selectedRowView.barangay}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.share)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.additional_current_year)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.additional_penalties)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.additional_discounts, {
                        absolute: true,
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.additional_prev_year)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.additional_prev_penalties)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.additional_prior_years)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.additional_prior_penalties)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.additional_total)}
                    </TableCell>
                    <TableCell align="center">
                      {formatMoney(selectedRowView.gf_total)}
                    </TableCell>
                    <TableCell align="center">
                      {selectedRowView.status}
                    </TableCell>
                    <TableCell align="center">
                      {selectedRowView.cashier}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* 🟢 Edit Dialog (Only Render When selectedRow Exists) */}
      {/* 🟢 Edit Dialog */}
      {selectedRow && (
        <PopupDialogView
          open={editDialogOpen}
          onClose={handleCloseEdit}
          title="Edit Record"
        >
          <RealPropertyTaxAbstract
            data={selectedRow}
            onSave={handleUpdate}
            onCancel={handleCloseEdit}
          />
        </PopupDialogView>
      )}
    </>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    date: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    receipt_no: PropTypes.string.isRequired,
    current_year: PropTypes.number.isRequired,
    current_penalties: PropTypes.number.isRequired,
    current_discounts: PropTypes.number.isRequired,
    prev_year: PropTypes.number.isRequired,
    prev_penalties: PropTypes.number.isRequired,
    prior_years: PropTypes.number.isRequired,
    prior_penalties: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    barangay: PropTypes.string.isRequired,
    share: PropTypes.number.isRequired,
    additional_current_year: PropTypes.number.isRequired,
    additional_penalties: PropTypes.number.isRequired,
    additional_discounts: PropTypes.number.isRequired,
    additional_prev_year: PropTypes.number.isRequired,
    additional_prev_penalties: PropTypes.number.isRequired,
    additional_prior_years: PropTypes.number.isRequired,
    additional_prior_penalties: PropTypes.number.isRequired,
    additional_total: PropTypes.number.isRequired,
    gf_total: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    cashier: PropTypes.string.isRequired,
  }).isRequired,
};

function RealPropertyTax() {
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
      cardGradients: [
        "linear-gradient(135deg, #0f2747, #2f4f7f)",
        "linear-gradient(135deg, #0f6b62, #2a8a7f)",
        "linear-gradient(135deg, #4b5d73, #6a7f99)",
        "linear-gradient(135deg, #a66700, #c98a2a)",
        "linear-gradient(135deg, #1c2a3a, #2f4f7f)",
        "linear-gradient(135deg, #2a3440, #4b5d73)",
      ],
    }),
    [darkMode]
  );
  const [total, setTotal] = useState(0);
  const [gfTotal, setGfTotal] = useState(0);
  const [sefTotal, setSEFTotal] = useState(0);
  const [shareTotal, setShareTotal] = useState(0);
  const dailyButtonRef = useRef(null);
  const [showDailyTable, setShowDailyTable] = useState(false);
  const [showMainTable, setShowMainTable] = useState(true);
  const [showSummaryTable, setShowSummaryTable] = useState(false);
  const [showBarangaySharesTable, setShowBarangaySharesTable] = useState(false);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [dailyTableData, setDailyTableData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showReportTable, setShowReportTable] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(true);

  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadMonth, setDownloadMonth] = useState(null);
  const [downloadYear, setDownloadYear] = useState(null);

  const [reportDialog, setReportDialog] = useState({
    open: false,
    status: "idle", // 'idle' | 'loading' | 'success' | 'error'
    progress: 0,
  });

  const filteredSummaryTotals = useMemo(
    () =>
      filteredData.reduce(
        (acc, row) => {
          acc.total += Number(row?.gf_total || 0);
          acc.shareTotal += Number(row?.share || 0);
          acc.gfTotal += Number(row?.total || 0);
          acc.sefTotal += Number(row?.additional_total || 0);
          return acc;
        },
        { total: 0, shareTotal: 0, gfTotal: 0, sefTotal: 0 }
      ),
    [filteredData]
  );

  const handleCloseDialog = () => {
    setReportDialog({ ...reportDialog, open: false });
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

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

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // General Fund
        const { data: gfData } = await axios.get("/TotalGeneralFund");
        const totalGF = gfData.reduce(
          (sum, entry) => sum + parseFloat(entry.total || 0),
          0
        );
        setGfTotal(totalGF);

        // SEF Fund
        const { data: sefData } = await axios.get("/TotalSEFFund");
        const totalSEF = sefData.reduce(
          (sum, entry) => sum + parseFloat(entry.additional_total || 0),
          0
        );
        setSEFTotal(totalSEF);

        // Share Fund
        const { data: sharesData } = await axios.get("/TotalShareFund");
        const totalShares = sharesData.reduce(
          (sum, entry) => sum + parseFloat(entry.share || 0),
          0
        );
        setShareTotal(totalShares);

        // Listings
        const { data: listingsData } = await axios.get("/TotalFund");
        const totalListingsGF = listingsData.reduce(
          (sum, listing) => sum + parseFloat(listing.gf_total || 0),
          0
        );
        setTotal(totalListingsGF);
      } catch (error) {
        console.error("Error fetching totals:", error);
      }
    };
    fetchListings();

    const parseNumber = (value) => parseFloat(value) || 0;

    const computedTotal =
      parseNumber(formData.currentYear) +
      parseNumber(formData.currentPenalties) -
      parseNumber(formData.currentDiscounts) +
      parseNumber(formData.prevYear) +
      parseNumber(formData.prevPenalties) +
      parseNumber(formData.priorYears) +
      parseNumber(formData.priorPenalties);

    const computedAdditionalTotal =
      parseNumber(formData.additionalCurrentYear) +
      parseNumber(formData.additionalCurrentPenalties) -
      parseNumber(formData.additionalCurrentDiscounts) +
      parseNumber(formData.additionalPrevYear) +
      parseNumber(formData.additionalPrevPenalties) +
      parseNumber(formData.additionalPriorYears) +
      parseNumber(formData.additionalPriorPenalties);

    setFormData((prevData) => ({
      ...prevData,
      total: computedTotal,
      additionalTotal: computedAdditionalTotal,
      share: computedTotal * 0.25,
      gfTotal: computedTotal + computedAdditionalTotal,
    }));
  }, [
    formData.currentYear,
    formData.currentPenalties,
    formData.currentDiscounts,
    formData.prevYear,
    formData.prevPenalties,
    formData.priorYears,
    formData.priorPenalties,
    formData.additionalCurrentYear,
    formData.additionalCurrentPenalties,
    formData.additionalCurrentDiscounts,
    formData.additionalPrevYear,
    formData.additionalPrevPenalties,
    formData.additionalPriorYears,
    formData.additionalPriorPenalties,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/allData");
        const rows = Array.isArray(response.data)
          ? response.data.filter(shouldIncludeRptReportRow)
          : [];
        setData(rows);
        setFilteredData(rows);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [showDailyTable, showSummaryTable, showBarangaySharesTable, showMainTable]);

  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    setFilteredData(applyClientFilters(data));
    setPage(0); // reset pagination when filters change
  }, [data, searchQuery, month, year]);

  const toggleDailyTable = () => {
    setShowDailyTable(true);
    setShowMainTable(false);
    setShowSummaryTable(false);
    setShowReportTable(false);
    setShowBarangaySharesTable(false);
    setShowFilters(false);
  };

  const toggleSummaryTable = () => {
    setShowSummaryTable(true);
    setShowMainTable(false);
    setShowDailyTable(false);
    setShowReportTable(false);
    setShowBarangaySharesTable(false);
    setShowFilters(false);
  };

  const toggleReportTable = () => {
    setShowReportTable(true);
    setShowMainTable(false);
    setShowDailyTable(false);
    setShowSummaryTable(false);
    setShowBarangaySharesTable(false);
    setShowFilters(false);
  };

  const toggleBarangaySharesTable = () => {
    setShowBarangaySharesTable(true);
    setShowMainTable(false);
    setShowDailyTable(false);
    setShowSummaryTable(false);
    setShowReportTable(false);
    setShowFilters(false);
  };

  const handleSave = async (savedData) => {
    // Implement your save logic here
    console.log("Saved data:", savedData);
    // Close the dialog after saving
    setIsDialogOpen(false);
    // Optionally, refresh data or update UI
    // fetchData(); // If you have a fetchData function to refresh the data
  };

  const getFilteredDataByMonthYear = () => {
    if (!month || !year) return filteredData;

    return filteredData.filter((row) => {
      if (!row.date) return false;
      const rowDate = new Date(row.date);
      return (
        rowDate.getMonth() + 1 === Number(month) &&
        rowDate.getFullYear() === Number(year)
      );
    });
  };

  const applyClientFilters = (
    rows,
    activeMonth = month,
    activeYear = year
  ) => {
    if (!Array.isArray(rows)) {
      return [];
    }

    let newFiltered = rows.filter(shouldIncludeRptReportRow);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      newFiltered = newFiltered.filter((row) => {
        const rowName = (row?.name ?? "").toLowerCase();
        const rowCtcNo = (row?.receipt_no ?? "").toString().toLowerCase();
        return rowName.includes(q) || rowCtcNo.includes(q);
      });
    }

    if (activeMonth || activeYear) {
      newFiltered = newFiltered.filter((row) => {
        if (!row.date) return false;
        const rowDate = new Date(row.date);
        const rowMonth = rowDate.getMonth() + 1;
        const rowYear = rowDate.getFullYear();

        const monthMatches = activeMonth ? rowMonth === parseInt(activeMonth) : true;
        const yearMatches = activeYear ? rowYear === parseInt(activeYear) : true;
        return monthMatches && yearMatches;
      });
    }

    return newFiltered;
  };

  const handleDownload = () => {
    setDownloadMonth(month);
    setDownloadYear(year);
    setDownloadDialogOpen(true);
  };

  const handleDownloadConfirm = async () => {
    if (!downloadMonth || !downloadYear) {
      setSnackbar({
        open: true,
        message: "Please select both month and year before downloading.",
        severity: "warning",
      });
      return;
    }

    let filteredExportData = [];

    try {
      const response = await axios.get("/allData");

      filteredExportData = applyClientFilters(
        Array.isArray(response.data) ? response.data : [],
        downloadMonth,
        downloadYear
      );
    } catch (error) {
      console.error("Error fetching downloadable real property tax data:", error);
      setSnackbar({
        open: true,
        message: "Failed to prepare the download.",
        severity: "error",
      });
      return;
    }

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
        DATE: new Date(item.date ?? item.DATE).toLocaleString("en-US", {
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
    const fileName = `Real_Property_Tax_Report_${months.find((m) => m.value === downloadMonth)?.label}_${downloadYear}.xlsx`;
    saveAs(blob, fileName);
    setDownloadDialogOpen(false);
  };

  const handleClickOpen = (content) => {
    setIsDialogOpen(true);
    setShowMainTable(true);
    setShowDailyTable(false);
    setShowSummaryTable(false);
    setShowBarangaySharesTable(false);
    setShowFilters(false);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBack = () => {
    setShowReportTable(false);
    setShowDailyTable(false);
    setShowSummaryTable(false);
    setShowBarangaySharesTable(false);
    setShowMainTable(true);
    setShowFilters(true);
  };

  const handleSearchClick = () => {
    // Move whatever is typed in pendingSearchQuery into searchQuery
    // This triggers the filter in the useEffect
    setSearchQuery(pendingSearchQuery);
  };

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
        {/* Search & Filters Row */}
        <Box display="flex" alignItems="center" gap={2} sx={{ py: 2 }} flexWrap="wrap">
          {showFilters && (
            <Box display="flex" alignItems="center" gap={2} flexGrow={1} flexWrap="wrap">
              <TextField
                fullWidth
                variant="outlined"
                label="Search Records"
                placeholder="Name or Receipt Number"
                value={pendingSearchQuery}
                onChange={(e) => setPendingSearchQuery(e.target.value)}
                sx={{
                  minWidth: { xs: "100%", md: 280 },
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
                  sx={{ width: 180 }}
                  value={months.find((option) => option.value === month) ?? null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Month"
                      variant="outlined"
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

        {/* Modern Action Buttons Row */}
        <Box display="flex" alignItems="center" gap={2} sx={{ py: 1 }}>
          {/* Primary Actions Group */}
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
                onClick={handleClickOpen}
              >
                New Entry
              </Button>
            </Tooltip>

            {/* Daily Report */}
            <Tooltip title="Generate Daily Report" arrow>
              <Button
                variant="contained"
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

          <Box
            display="flex"
            flexWrap="wrap"
            gap={2}
            justifyContent="flex-start"
          >
            {/* Barangay Shares */}
            <Tooltip title="Barangay Sharing Reports" arrow>
              <Button
                variant="contained"
                startIcon={<MdSummarize size={18} />}
                onClick={toggleBarangaySharesTable}
                sx={{
                  px: 3,
                  height: 44,
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  backgroundColor: uiColors.teal,
                  color: "#fff",
                  boxShadow: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: uiColors.tealHover,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Barangay Shares
              </Button>
            </Tooltip>

            {/* Summary Report */}
            <Tooltip title="Summary Reports" arrow>
              <Button
                variant="contained"
                startIcon={<AssessmentIcon fontSize="small" />}
                onClick={toggleSummaryTable}
                sx={{
                  px: 3,
                  height: 44,
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  backgroundColor: uiColors.steel,
                  color: "#fff",
                  boxShadow: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: uiColors.steelHover,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Summary Report
              </Button>
            </Tooltip>

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

        {/* Enhanced Summary Cards */}
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
              value: filteredSummaryTotals.total,
              text: "Total Revenue",
              icon: <AccountBalanceIcon fontSize="large" />,
            },
            {
              value: filteredSummaryTotals.shareTotal,
              text: "25% Share Income",
              icon: <PieChartIcon fontSize="large" />,
            },
            {
              value: filteredSummaryTotals.gfTotal,
              text: "General Fund",
              icon: <AccountTreeIcon fontSize="large" />,
            },
            {
              value: filteredSummaryTotals.sefTotal,
              text: "SEF",
              icon: <SchoolIcon fontSize="large" />,
            },
          ].map(({ value, text, icon }, index) => (
            <Card
              key={text}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: "16px",
                background: uiColors.cardGradients[index % uiColors.cardGradients.length],
                color: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                cursor: "pointer",
                minWidth: 0, // Prevent overflow
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-50%",
                  right: "-50%",
                  width: "100%",
                  height: "100%",
                  background: "rgba(255,255,255,0.1)",
                  transform: "rotate(30deg)",
                  transition: "all 0.4s ease",
                },
                "&:hover::before": {
                  transform: "rotate(30deg) translate(20%, 20%)",
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
                      ? new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                          minimumFractionDigits: 2,
                        }).format(value)
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
                      fontSize: "3.5rem",
                    },
                  }}
                >
                  {icon}
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 1.5,
                }}
              >
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
                      width: "70%", // You can make this dynamic based on your data
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

      {showSummaryTable && (
        <SummaryTable
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onBack={handleBack}
        />
      )}
      {showBarangaySharesTable && (
        <BarangaySharesTable
          data={data}
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onBack={handleBack}
        />
      )}
      {showReportTable && (
        <ReportTable
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onBack={handleBack}
        />
      )}
      {showDailyTable && (
        <DailyTable
          month={month}
          year={year}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onDataFiltered={setDailyTableData}
          onBack={handleBack}
        />
      )}
      {showMainTable && (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: 6,
            overflow: "hidden",
            "& .MuiTableCell-root": {
              py: 2,
            },
          }}
        >
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <StyledTableCell>DATE</StyledTableCell>
                <StyledTableCell>NAME OF TAXPAYER</StyledTableCell>
                <StyledTableCell>RECEIPT NO.</StyledTableCell>
                <StyledTableCell>Current Year</StyledTableCell>
                <StyledTableCell>Penalties</StyledTableCell>
                <StyledTableCell>Discounts</StyledTableCell>
                <StyledTableCell>Immediate Preceding Year</StyledTableCell>
                <StyledTableCell>Penalties</StyledTableCell>
                <StyledTableCell>Prior Years</StyledTableCell>
                <StyledTableCell>Penalties</StyledTableCell>
                <StyledTableCell>TOTAL</StyledTableCell>
                <StyledTableCell>ACTIONS</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <Row key={row.id} row={row} />
                ))}
            </TableBody>
          </Table>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            m={1}
          >
            <TablePagination
              rowsPerPageOptions={[10, 15, 20, 50, 100]}
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
      {/* DIALOG OPENER */}
      {isDialogOpen && (
        <PopupDialog onClose={handleClose}>
          <RealPropertyTaxAbstract onSave={handleSave} onClose={handleClose} />
        </PopupDialog>
      )}

      <Box>
        {/*Snackbar Component (with prop fixes)*/}
        <Dialog
          open={downloadDialogOpen}
          onClose={() => setDownloadDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Download Real Property Tax Report</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
              <Autocomplete
                options={months}
                value={months.find((option) => option.value === downloadMonth) ?? null}
                onChange={(e, value) => setDownloadMonth(value?.value ?? null)}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => <TextField {...params} label="Month" fullWidth />}
                sx={{ minWidth: 220, flex: 1 }}
              />
              <Autocomplete
                options={years}
                value={years.find((option) => option.value === downloadYear) ?? null}
                onChange={(e, value) => setDownloadYear(value?.value ?? null)}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => <TextField {...params} label="Year" fullWidth />}
                sx={{ minWidth: 220, flex: 1 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDownloadDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleDownloadConfirm}>
              Download
            </Button>
          </DialogActions>
        </Dialog>

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
        onClose={handleCloseDialog}
        status={reportDialog.status}
        progress={reportDialog.progress}
      />
    </Box>
  );
}

export default RealPropertyTax;

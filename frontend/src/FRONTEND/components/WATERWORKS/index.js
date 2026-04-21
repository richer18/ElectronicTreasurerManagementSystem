import AssessmentIcon from "@mui/icons-material/Assessment";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  Typography,
  styled,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoMdDownload } from "react-icons/io";
import { IoToday } from "react-icons/io5";
import { MdSummarize } from "react-icons/md";
import dayjs from "dayjs";
import axiosInstance from "../../../api/axiosInstance";
import { useMaterialUIController } from "../../../context";
import GeneralFundPaymentEditForm from "../../../components/MD-Components/FillupForm/GeneralFundPaymentEditForm";
import DailyReportButton from "./components/actions/daily-report";
import DownloadButton from "./components/actions/download";
import NewEntryButton from "./components/actions/new-entry";
import RegisterButton from "./components/actions/register";
import TicketButton from "./components/actions/ticket";
import TicketStatusButton from "./components/actions/ticket-status";
import WaterBillingButton from "./components/actions/water-billing";
import WaterCardButton from "./components/actions/water-card";
import EntryPopupDialog from "./components/entry/component/EntryPopupDialog";
import RegisterPopupDialog from "./components/register/component/RegisterPopupDialog";
import TicketPopupDialog from "./components/tickets/component/TicketPopupDialog";

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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function Index() {
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
      ],
    }),
    [darkMode]
  );

  const [showFilters] = useState(true);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({
    totalCollections: 0,
    allPayments: 0,
    receipts: 0,
    meterPayments: 0,
    penaltyPayments: 0,
    taxpayers: 0,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedPaymentRows, setSelectedPaymentRows] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editingWaterAccount, setEditingWaterAccount] = useState(false);
  const [waterAccountForm, setWaterAccountForm] = useState({
    accountNumber: "",
    waterMeter: "",
    waterConnectionType: "",
    address: "",
    fullName: "",
  });
  const [savingWaterAccount, setSavingWaterAccount] = useState(false);
  const [rowActionAnchorEl, setRowActionAnchorEl] = useState(null);
  const [rowActionTarget, setRowActionTarget] = useState(null);
  const [openWaterCardDialog, setOpenWaterCardDialog] = useState(false);
  const [selectedWaterCardOption, setSelectedWaterCardOption] = useState(null);
  const [waterCardSearchInput, setWaterCardSearchInput] = useState("");
  const [waterCardOptions, setWaterCardOptions] = useState([]);
  const [loadingWaterCardOptions, setLoadingWaterCardOptions] = useState(false);

  const [openEntryDialog, setOpenEntryDialog] = useState(false);
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [openTicketDialog, setOpenTicketDialog] = useState(false);
  const [openDailyReportDialog, setOpenDailyReportDialog] = useState(false);
  const [openBillingDialog, setOpenBillingDialog] = useState(false);
  const [openTicketStatusDialog, setOpenTicketStatusDialog] = useState(false);
  const [dailyReportDate, setDailyReportDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dailyReportData, setDailyReportData] = useState({ rows: [], summary: {} });
  const [dailyReportLoading, setDailyReportLoading] = useState(false);
  const [billingData, setBillingData] = useState({ rows: [], summary: {} });
  const [billingLoading, setBillingLoading] = useState(false);
  const [ticketSummary, setTicketSummary] = useState({
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    high_priority: 0,
    total: 0,
  });
  const [ticketRows, setTicketRows] = useState([]);
  const [ticketStatusFilter, setTicketStatusFilter] = useState("");
  const [ticketStatusLoading, setTicketStatusLoading] = useState(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/waterworks/payments", {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search: searchQuery || undefined,
          month: month || undefined,
          year: year || undefined,
        },
      });
      setPayments(Array.isArray(response.data?.data) ? response.data.data : []);
      setTotalRows(Number(response.data?.meta?.total || 0));
      setPaymentSummary(
        response.data?.summary || {
          totalCollections: 0,
          allPayments: 0,
          receipts: 0,
          meterPayments: 0,
          penaltyPayments: 0,
          taxpayers: 0,
        }
      );
    } catch (error) {
      console.error("Failed to load waterworks payments:", error);
      setPayments([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [month, page, rowsPerPage, searchQuery, year]);

  const loadWaterCardOptions = useCallback(async (search = "") => {
    setLoadingWaterCardOptions(true);
    try {
      const response = await axiosInstance.get("/waterworks/taxpayers", {
        params: {
          search: search || undefined,
          limit: 100,
        },
      });
      const options = Array.isArray(response.data) ? response.data : [];
      setWaterCardOptions(
        options.map((item) => ({
          ...item,
          key: item.localTin || item.taxpayer,
          label: item.localTin ? `${item.taxpayer} - ${item.localTin}` : item.taxpayer,
        }))
      );
    } catch (error) {
      console.error("Failed to load water card taxpayers:", error);
      setWaterCardOptions([]);
    } finally {
      setLoadingWaterCardOptions(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    if (!openWaterCardDialog) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      loadWaterCardOptions(waterCardSearchInput);
    }, 250);

    return () => clearTimeout(timeout);
  }, [loadWaterCardOptions, openWaterCardDialog, waterCardSearchInput]);

  const taxpayerReceiptRows = useMemo(() => {
    const grouped = new Map();

    selectedPaymentRows.forEach((payment) => {
      const key = [
        payment.receiptNo || "",
        payment.paymentDate || "",
        payment.collector || payment.userId || "",
      ].join("|");

      if (!grouped.has(key)) {
        grouped.set(key, {
          paymentId: payment.paymentId,
          receiptNo: payment.receiptNo || "-",
          paymentDate: payment.paymentDate,
          collector: payment.collector || payment.userId || "-",
          month: dayjs(payment.paymentDate).isValid()
            ? dayjs(payment.paymentDate).format("MMM YYYY")
            : "-",
          used: "-",
          amount: 0,
          surcharge: 0,
          interest: 0,
          totalDue: 0,
        });
      }

      const current = grouped.get(key);
      const amount = Number(payment.amount || 0);

      if (!current.paymentId && payment.paymentId) {
        current.paymentId = payment.paymentId;
      }

      if (String(payment.sourceId || "") === "827") {
        current.surcharge += amount;
      } else {
        current.amount += amount;
      }

      current.totalDue += amount;
    });

    return Array.from(grouped.values()).sort(
      (a, b) => dayjs(a.paymentDate).valueOf() - dayjs(b.paymentDate).valueOf()
    );
  }, [selectedPaymentRows]);

  const handleApplyFilters = () => {
    setPage(0);
    setSearchQuery(pendingSearchQuery);
  };

  const summaryCards = useMemo(() => {
    return [
      {
        text: "Total Collections",
        value: formatCurrency(paymentSummary.totalCollections),
        icon: <MdSummarize size={30} />,
        gradient: uiColors.cardGradients[0],
      },
      {
        text: "All Payments",
        value: Number(paymentSummary.allPayments || 0).toLocaleString(),
        icon: <ReceiptIcon fontSize="large" />,
        gradient: uiColors.cardGradients[1],
      },
      {
        text: "Receipts",
        value: Number(paymentSummary.receipts || 0).toLocaleString(),
        icon: <AssessmentIcon fontSize="large" />,
        gradient: uiColors.cardGradients[2],
      },
      {
        text: "Meter Payments",
        value: Number(paymentSummary.meterPayments || 0).toLocaleString(),
        icon: <IoMdDownload size={30} />,
        gradient: uiColors.cardGradients[3],
      },
      {
        text: "Water Penalties",
        value: Number(paymentSummary.penaltyPayments || 0).toLocaleString(),
        icon: <IoToday size={28} />,
        gradient: "linear-gradient(135deg, #1f3b57, #375a7f)",
      },
      {
        text: "Taxpayers",
        value: Number(paymentSummary.taxpayers || 0).toLocaleString(),
        icon: <MdSummarize size={26} />,
        gradient: "linear-gradient(135deg, #21413a, #2f7c6b)",
      },
    ];
  }, [paymentSummary, uiColors.cardGradients]);

  const handleCloseEntryDialog = async () => {
    setOpenEntryDialog(false);
    await loadPayments();
  };

  const handleCloseRegisterDialog = async () => {
    setOpenRegisterDialog(false);
    await loadPayments();
  };

  const handleCloseTicketDialog = async () => {
    setOpenTicketDialog(false);
    await loadPayments();
  };

  const handleOpenWaterCardPicker = () => {
    setSelectedWaterCardOption(null);
    setWaterCardOptions([]);
    setWaterCardSearchInput("");
    setOpenWaterCardDialog(true);
  };

  const openPaymentDetails = async (paymentLike) => {
    if (!paymentLike?.taxpayer && !paymentLike?.localTin) {
      return;
    }

    setSelectedPayment(paymentLike);
    setSelectedPaymentRows([]);
    setSelectedAccount(null);
    setViewLoading(true);

    try {
      const response = await axiosInstance.get("/waterworks/taxpayer-payments", {
        params: {
          taxpayer: paymentLike.taxpayer || undefined,
          local_tin: paymentLike.localTin || undefined,
        },
      });

      setSelectedPaymentRows(Array.isArray(response.data?.payments) ? response.data.payments : []);
      setSelectedAccount(response.data?.account || null);
    } catch (error) {
      console.error("Failed to load taxpayer water payments:", error);
      setSelectedPaymentRows([]);
      setSelectedAccount(null);
    } finally {
      setViewLoading(false);
    }
  };

  const loadDailyReport = useCallback(async (dateValue) => {
    setDailyReportLoading(true);
    try {
      const response = await axiosInstance.get("/waterworks/reports/daily", {
        params: { date: dateValue },
      });
      setDailyReportData({
        rows: Array.isArray(response.data?.rows) ? response.data.rows : [],
        summary: response.data?.summary || {},
      });
    } catch (error) {
      console.error("Failed to load waterworks daily report:", error);
      setDailyReportData({ rows: [], summary: {} });
    } finally {
      setDailyReportLoading(false);
    }
  }, []);

  const loadBillingReport = useCallback(async () => {
    setBillingLoading(true);
    try {
      const response = await axiosInstance.get("/waterworks/reports/billing", {
        params: {
          month: month || undefined,
          year: year || undefined,
          search: searchQuery || undefined,
        },
      });
      setBillingData({
        rows: Array.isArray(response.data?.rows) ? response.data.rows : [],
        summary: response.data?.summary || {},
      });
    } catch (error) {
      console.error("Failed to load waterworks billing report:", error);
      setBillingData({ rows: [], summary: {} });
    } finally {
      setBillingLoading(false);
    }
  }, [month, searchQuery, year]);

  const loadTicketStatus = useCallback(async (statusValue = "") => {
    setTicketStatusLoading(true);
    try {
      const [summaryResponse, listResponse] = await Promise.all([
        axiosInstance.get("/waterworks/tickets/summary"),
        axiosInstance.get("/waterworks/tickets", {
          params: {
            status: statusValue || undefined,
          },
        }),
      ]);

      setTicketSummary(
        summaryResponse.data || {
          open: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
          high_priority: 0,
          total: 0,
        }
      );
      setTicketRows(Array.isArray(listResponse.data) ? listResponse.data : []);
    } catch (error) {
      console.error("Failed to load waterworks ticket status:", error);
      setTicketRows([]);
    } finally {
      setTicketStatusLoading(false);
    }
  }, []);

  const handleDownloadPayments = async () => {
    try {
      const response = await axiosInstance.get("/waterworks/payments/export", {
        params: {
          search: searchQuery || undefined,
          month: month || undefined,
          year: year || undefined,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposition = response.headers["content-disposition"] || "";
      const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);

      link.href = url;
      link.setAttribute("download", fileNameMatch?.[1] || "waterworks-payments.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download waterworks export:", error);
    }
  };

  const handleOpenSelectedWaterCard = async () => {
    if (!selectedWaterCardOption) {
      return;
    }

    setOpenWaterCardDialog(false);
    await openPaymentDetails({
      taxpayer: selectedWaterCardOption.taxpayer,
      localTin: selectedWaterCardOption.localTin,
      paymentDate: selectedWaterCardOption.latestPaymentDate,
      paymentId: selectedWaterCardOption.paymentId,
    });
  };

  const handleOpenWaterAccountEdit = () => {
    setWaterAccountForm({
      accountNumber: selectedAccount?.accountNumber || "",
      waterMeter: selectedAccount?.waterMeter || "",
      waterConnectionType: selectedAccount?.waterConnectionType || "",
      address: selectedAccount?.address || "",
      fullName: selectedAccount?.fullName || selectedPayment?.taxpayer || "",
    });
    setEditingWaterAccount(true);
  };

  const handleSaveWaterAccount = async () => {
    if (!selectedAccount?.accountNumber) {
      window.alert("No water account selected.");
      return;
    }

    setSavingWaterAccount(true);
    try {
      const response = await axiosInstance.put(
        `/account/${selectedAccount.accountNumber}`,
        waterAccountForm
      );

      const updatedAccount = response.data?.account || {};

      setSelectedAccount((prev) => ({
        ...(prev || {}),
        accountNumber: updatedAccount.accountNumber || waterAccountForm.accountNumber,
        waterMeter: updatedAccount.waterMeter || "",
        waterConnectionType: updatedAccount.waterConnectionType || "",
        address: updatedAccount.address || "",
        fullName: updatedAccount.fullName || waterAccountForm.fullName,
      }));

      setSelectedPayment((prev) =>
        prev
          ? {
              ...prev,
              taxpayer: updatedAccount.fullName || waterAccountForm.fullName,
            }
          : prev
      );

      setEditingWaterAccount(false);
    } catch (error) {
      console.error("Failed to update water account:", error);
      window.alert(error.response?.data?.message || "Failed to update water account.");
    } finally {
      setSavingWaterAccount(false);
    }
  };

  const handleEditWaterCardRow = (row) => {
    if (!row?.paymentId) {
      return;
    }

    setEditingPayment({ paymentId: row.paymentId });
  };

  const handleDeleteWaterCardRow = async (row) => {
    if (!row?.paymentId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete water payment receipt ${row.receiptNo || row.paymentId}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axiosInstance.delete(`/waterworks/payment-edit/${row.paymentId}`);
      await loadPayments();

      if (selectedPayment) {
        await openPaymentDetails(selectedPayment);
      }
    } catch (error) {
      console.error("Failed to delete water payment:", error);
      window.alert("Failed to delete water payment.");
    }
  };

  const handleOpenRowActionMenu = (event, row) => {
    setRowActionAnchorEl(event.currentTarget);
    setRowActionTarget(row);
  };

  const handleCloseRowActionMenu = () => {
    setRowActionAnchorEl(null);
    setRowActionTarget(null);
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
        <Typography variant="h5" sx={{ fontWeight: 800, color: uiColors.navy, mb: 0.5 }}>
          Waterworks Department
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage billing, account registration, entries, ticket workflows, and all recorded water payments.
        </Typography>

        <Box display="flex" alignItems="center" gap={2} sx={{ py: 2 }} flexWrap="wrap">
          {showFilters && (
            <Box display="flex" alignItems="center" gap={2} flexGrow={1} flexWrap="wrap">
              <TextField
                fullWidth
                variant="outlined"
                label="Search Payments"
                placeholder="Taxpayer, receipt no., collector, tin, or water fee type"
                value={pendingSearchQuery}
                onChange={(e) => setPendingSearchQuery(e.target.value)}
                sx={{
                  minWidth: { xs: "100%", md: 280 },
                  "& .MuiInputBase-input": { color: (theme) => theme.palette.text.primary },
                  "& .MuiInputLabel-root": { color: (theme) => theme.palette.text.secondary },
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: "8px" },
                }}
              />

              <Box display="flex" gap={2} flexWrap="wrap">
                <Autocomplete
                  disablePortal
                  options={months}
                  sx={{ width: 180 }}
                  value={months.find((item) => item.value === month) || null}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Month" variant="outlined" />
                  )}
                  onChange={(e, value) => {
                    setPage(0);
                    setMonth(value?.value || null);
                  }}
                />

                <Autocomplete
                  disablePortal
                  options={years}
                  sx={{ width: 150 }}
                  value={years.find((item) => item.value === year) || null}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Year" variant="outlined" />
                  )}
                  onChange={(e, value) => {
                    setPage(0);
                    setYear(value?.value || null);
                  }}
                />

                <Button
                  variant="contained"
                  sx={{
                    px: 3,
                    height: "56px",
                    color: "white",
                    borderRadius: "8px",
                    boxShadow: "none",
                    textTransform: "none",
                    fontWeight: 600,
                    backgroundColor: uiColors.navy,
                    "&:hover": {
                      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
                      backgroundColor: uiColors.navyHover,
                    },
                  }}
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    px: 3,
                    height: "56px",
                    color: "white",
                    borderRadius: "8px",
                    boxShadow: "none",
                    textTransform: "none",
                    fontWeight: 600,
                    backgroundColor: uiColors.steel,
                    "&:hover": {
                      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
                      backgroundColor: uiColors.steelHover,
                    },
                  }}
                  onClick={() => {
                    setPage(0);
                    setPendingSearchQuery("");
                    setSearchQuery("");
                    setMonth(null);
                    setYear(null);
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={2} sx={{ py: 1 }} flexWrap="wrap">
          <Box display="flex" gap={2} flexGrow={1} flexWrap="wrap">
            <NewEntryButton uiColors={uiColors} onClick={() => setOpenEntryDialog(true)} />
            <RegisterButton uiColors={uiColors} onClick={() => setOpenRegisterDialog(true)} />
            <TicketButton uiColors={uiColors} onClick={() => setOpenTicketDialog(true)} />
            <DailyReportButton
              uiColors={uiColors}
              onClick={async () => {
                setOpenDailyReportDialog(true);
                await loadDailyReport(dailyReportDate);
              }}
            />
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <WaterBillingButton
              uiColors={uiColors}
              onClick={async () => {
                setOpenBillingDialog(true);
                await loadBillingReport();
              }}
            />
            <WaterCardButton uiColors={uiColors} onClick={handleOpenWaterCardPicker} />
            <TicketStatusButton
              uiColors={uiColors}
              onClick={async () => {
                setTicketStatusFilter("");
                setOpenTicketStatusDialog(true);
                await loadTicketStatus("");
              }}
            />
            <DownloadButton uiColors={uiColors} onClick={handleDownloadPayments} />
          </Box>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          gap={3}
          sx={{ mt: 4, flexDirection: { xs: "column", sm: "row" }, flexWrap: "wrap" }}
        >
          {summaryCards.map(({ text, value, icon, gradient }) => (
            <Card
              key={text}
              sx={{
                flex: 1,
                minWidth: 190,
                p: 3,
                borderRadius: "16px",
                background: gradient,
                color: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.03)" },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="subtitle2">{text}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {value}
                  </Typography>
                </Box>
                <Box sx={{ opacity: 0.2 }}>{icon}</Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          boxShadow: 6,
          mt: 4,
          border: "1px solid rgba(15, 39, 71, 0.08)",
          overflow: "hidden",
          "& .MuiTableCell-root": { py: 2 },
        }}
      >
        <Table
          sx={{ minWidth: 980, tableLayout: "fixed" }}
          size="small"
          aria-label="waterworks payments table"
        >
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ width: 300 }}>Name of Taxpayer</StyledTableCell>
              <StyledTableCell sx={{ width: 150 }}>Receipt No</StyledTableCell>
              <StyledTableCell sx={{ width: 120 }}>Collector</StyledTableCell>
              <StyledTableCell sx={{ width: 170 }}>Local Tin</StyledTableCell>
              <StyledTableCell sx={{ width: 130 }}>Amount</StyledTableCell>
              <StyledTableCell sx={{ width: 120 }}>Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1.5}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary">
                      Loading water payments...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : payments.length > 0 ? (
              payments.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell align="center" sx={{ width: 300 }}>
                    <Typography
                      fontWeight={700}
                      sx={{
                        maxWidth: 280,
                        mx: "auto",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                  >
                      {row.taxpayer || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 150 }}>{row.receiptNo || "-"}</TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>{row.collector || row.userId || "-"}</TableCell>
                  <TableCell align="center" sx={{ width: 170 }}>{row.localTin || "-"}</TableCell>
                  <TableCell align="center" sx={{ width: 130 }}>{formatCurrency(row.amount)}</TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon fontSize="small" />}
                        onClick={() => openPaymentDetails(row)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setEditingPayment(row)}
                        sx={{
                          textTransform: "none",
                          backgroundColor: uiColors.navy,
                          "&:hover": {
                            backgroundColor: uiColors.navyHover,
                          },
                        }}
                      >
                        Update
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>
                  No Waterworks payments matched the current filters.
                  {searchQuery ? ` Search term: ${searchQuery}` : ""}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />

      <EntryPopupDialog open={openEntryDialog} handleClose={handleCloseEntryDialog} />
      <RegisterPopupDialog
        open={openRegisterDialog}
        handleClose={handleCloseRegisterDialog}
      />
      <TicketPopupDialog open={openTicketDialog} handleClose={handleCloseTicketDialog} />

      <Dialog
        open={openDailyReportDialog}
        onClose={() => setOpenDailyReportDialog(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 800 }}
        >
          Daily Waterworks Report
          <Button onClick={() => setOpenDailyReportDialog(false)} sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
            <TextField
              label="Report Date"
              type="date"
              value={dailyReportDate}
              onChange={(event) => setDailyReportDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              onClick={() => loadDailyReport(dailyReportDate)}
              sx={{ textTransform: "none" }}
            >
              Load Report
            </Button>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 2 }}>
            {[
              ["Receipts", Number(dailyReportData.summary?.receipts || 0).toLocaleString()],
              ["Collectors", Number(dailyReportData.summary?.collectors || 0).toLocaleString()],
              ["Taxpayers", Number(dailyReportData.summary?.taxpayers || 0).toLocaleString()],
              ["Total Amount", formatCurrency(dailyReportData.summary?.totalAmount || 0)],
            ].map(([label, value]) => (
              <Card key={label} sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
              </Card>
            ))}
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Receipt No</StyledTableCell>
                  <StyledTableCell>Taxpayer</StyledTableCell>
                  <StyledTableCell>Collector</StyledTableCell>
                  <StyledTableCell>Local Tin</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailyReportLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Loading report...</TableCell>
                  </TableRow>
                ) : dailyReportData.rows.length > 0 ? (
                  dailyReportData.rows.map((row) => (
                    <TableRow key={`${row.paymentId}-${row.receiptNo}`}>
                      <TableCell align="center">{row.receiptNo || "-"}</TableCell>
                      <TableCell align="center">{row.taxpayer || "-"}</TableCell>
                      <TableCell align="center">{row.collector || "-"}</TableCell>
                      <TableCell align="center">{row.localTin || "-"}</TableCell>
                      <TableCell align="center">{formatCurrency(row.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No daily report data found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openBillingDialog}
        onClose={() => setOpenBillingDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 800 }}
        >
          Water Billing Report
          <Button onClick={() => setOpenBillingDialog(false)} sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 2 }}>
            {[
              ["Categories", Number(billingData.summary?.categories || 0).toLocaleString()],
              ["Payments", Number(billingData.summary?.paymentCount || 0).toLocaleString()],
              ["Receipts", Number(billingData.summary?.receiptCount || 0).toLocaleString()],
              ["Total Amount", formatCurrency(billingData.summary?.totalAmount || 0)],
            ].map(([label, value]) => (
              <Card key={label} sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
              </Card>
            ))}
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Description</StyledTableCell>
                  <StyledTableCell>Source ID</StyledTableCell>
                  <StyledTableCell>Payments</StyledTableCell>
                  <StyledTableCell>Receipts</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billingLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Loading billing report...</TableCell>
                  </TableRow>
                ) : billingData.rows.length > 0 ? (
                  billingData.rows.map((row) => (
                    <TableRow key={row.sourceId}>
                      <TableCell align="center">{row.description || "-"}</TableCell>
                      <TableCell align="center">{row.sourceId || "-"}</TableCell>
                      <TableCell align="center">{row.paymentCount || 0}</TableCell>
                      <TableCell align="center">{row.receiptCount || 0}</TableCell>
                      <TableCell align="center">{formatCurrency(row.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No billing data found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openTicketStatusDialog}
        onClose={() => setOpenTicketStatusDialog(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 800 }}
        >
          Ticket Status
          <Button onClick={() => setOpenTicketStatusDialog(false)} sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(6, 1fr)" }, gap: 2, mb: 2 }}>
            {[
              ["Open", Number(ticketSummary.open || 0).toLocaleString()],
              ["In Progress", Number(ticketSummary.in_progress || 0).toLocaleString()],
              ["Resolved", Number(ticketSummary.resolved || 0).toLocaleString()],
              ["Closed", Number(ticketSummary.closed || 0).toLocaleString()],
              ["High Priority", Number(ticketSummary.high_priority || 0).toLocaleString()],
              ["Total", Number(ticketSummary.total || 0).toLocaleString()],
            ].map(([label, value]) => (
              <Card key={label} sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
              </Card>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            {[
              ["", "All"],
              ["OPEN", "Open"],
              ["IN_PROGRESS", "In Progress"],
              ["RESOLVED", "Resolved"],
              ["CLOSED", "Closed"],
            ].map(([value, label]) => (
              <Button
                key={label}
                variant={ticketStatusFilter === value ? "contained" : "outlined"}
                onClick={async () => {
                  setTicketStatusFilter(value);
                  await loadTicketStatus(value);
                }}
                sx={{ textTransform: "none" }}
              >
                {label}
              </Button>
            ))}
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Ticket No</StyledTableCell>
                  <StyledTableCell>Taxpayer</StyledTableCell>
                  <StyledTableCell>Concern</StyledTableCell>
                  <StyledTableCell>Priority</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Assigned To</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ticketStatusLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Loading ticket status...</TableCell>
                  </TableRow>
                ) : ticketRows.length > 0 ? (
                  ticketRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell align="center">{row.ticket_no}</TableCell>
                      <TableCell align="center">{row.taxpayer_name || "-"}</TableCell>
                      <TableCell align="center">{row.concern_type}</TableCell>
                      <TableCell align="center">{row.priority}</TableCell>
                      <TableCell align="center">{row.status}</TableCell>
                      <TableCell align="center">{row.assigned_to || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No tickets found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openWaterCardDialog}
        onClose={() => setOpenWaterCardDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
          }}
        >
          Select Tax Payer
          <Button
            onClick={() => setOpenWaterCardDialog(false)}
            size="small"
            startIcon={<CloseIcon />}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            <Autocomplete
              fullWidth
              openOnFocus
              options={waterCardOptions}
              value={selectedWaterCardOption}
              onChange={(event, value) => setSelectedWaterCardOption(value)}
              inputValue={waterCardSearchInput}
              onInputChange={(event, value) => setWaterCardSearchInput(value)}
              getOptionLabel={(option) => option?.label || ""}
              isOptionEqualToValue={(option, value) => option.key === value.key}
              loading={loadingWaterCardOptions}
              noOptionsText={
                waterCardSearchInput.trim() === ""
                  ? "No taxpayers found"
                  : "No matching taxpayer found"
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Tax Payer"
                  placeholder="NAME - Local Tin"
                  helperText="Choose a taxpayer to open the Water Card."
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: uiColors.navy }}>
                      {option.taxpayer || "-"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.localTin || "No Local Tin"}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenWaterCardDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleOpenSelectedWaterCard}
            variant="contained"
            disabled={!selectedWaterCardOption}
            sx={{ textTransform: "none" }}
          >
            Open Water Card
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
          }}
        >
          {selectedPayment?.taxpayer
            ? `Water Payments - ${selectedPayment.taxpayer}`
            : "Water Payment Details"}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              onClick={handleOpenWaterAccountEdit}
              size="small"
              variant="contained"
              disabled={!selectedAccount?.accountNumber}
              sx={{ textTransform: "none" }}
            >
              Edit
            </Button>
            <Button
              onClick={() => setSelectedPayment(null)}
              size="small"
              startIcon={<CloseIcon />}
              sx={{ textTransform: "none" }}
            >
              Close
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Box
              sx={{
                maxWidth: 840,
                mx: "auto",
                p: { xs: 1.5, md: 2.5 },
                bgcolor: "#f1e3c2",
                border: "1px solid #b79b62",
                boxShadow: "0 12px 28px rgba(15,23,42,0.12)",
              }}
            >
              {viewLoading ? (
                <Box
                  sx={{
                    minHeight: 260,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography color="#111827">Loading water card...</Typography>
                </Box>
              ) : (
                <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
                  gap: 2,
                  alignItems: "start",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontWeight: 900,
                      color: "#111827",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ZAMBOANGUITA WATERWORKS DEPARTMENT
                  </Typography>
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontWeight: 800,
                      color: "#1f2937",
                      fontSize: "0.92rem",
                      mb: 1.5,
                    }}
                  >
                    STATEMENT OF ACCOUNT
                  </Typography>

                  <Box sx={{ display: "grid", gap: 0.8 }}>
                    {[
                      ["Permittee", selectedPayment.taxpayer || "-"],
                      ["Address", selectedAccount?.address || "-"],
                    ].map(([label, value]) => (
                      <Box
                        key={label}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "84px 1fr",
                          alignItems: "end",
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: "0.85rem", color: "#111827" }}>
                          {label}:
                        </Typography>
                        <Box sx={{ borderBottom: "1px solid #111827", minHeight: 24, px: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, color: "#111827" }}>{value}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gap: 0.8 }}>
                  {[
                    ["Account No.", selectedAccount?.accountNumber || "-"],
                    ["Meter No.", selectedAccount?.waterMeter || "-"],
                    ["Connection", selectedAccount?.waterConnectionType || "-"],
                    ["Local TIN", selectedPayment.localTin || "-"],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "96px 1fr",
                        alignItems: "end",
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: "0.85rem", color: "#111827" }}>
                        {label}
                      </Typography>
                      <Box sx={{ borderBottom: "1px solid #111827", minHeight: 24, px: 0.5 }}>
                        <Typography sx={{ fontWeight: 700, color: "#111827" }}>{value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  border: "1px solid #7c6a45",
                  bgcolor: "rgba(255,255,255,0.22)",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 0.9fr 1fr 0.9fr 0.9fr 1fr 1fr 1fr 1.2fr",
                    borderBottom: "1px solid #7c6a45",
                    "& > div": {
                      px: 0.75,
                      py: 0.7,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "#111827",
                      textAlign: "center",
                      borderRight: "1px solid #7c6a45",
                    },
                    "& > div:last-of-type": {
                      borderRight: "none",
                    },
                  }}
                >
                  {[
                    "Month",
                    "Used",
                    "Amount",
                    "Surcharge",
                    "Interest",
                    "Total Due",
                    "Date Paid",
                    "O.R. Number",
                    "Action",
                  ].map((label) => (
                    <Box key={label}>{label}</Box>
                  ))}
                </Box>

                {taxpayerReceiptRows.length > 0 ? (
                  taxpayerReceiptRows.map((row, index) => (
                    <Box
                      key={`${row.receiptNo}-${index}`}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 0.9fr 1fr 0.9fr 0.9fr 1fr 1fr 1fr 1.2fr",
                        borderBottom:
                          index === taxpayerReceiptRows.length - 1
                            ? "none"
                            : "1px solid rgba(124,106,69,0.72)",
                        "& > div": {
                          px: 0.75,
                          py: 0.72,
                          fontSize: "0.76rem",
                          color: "#111827",
                          textAlign: "center",
                          borderRight: "1px solid rgba(124,106,69,0.72)",
                          minHeight: 34,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        },
                        "& > div:last-of-type": {
                          borderRight: "none",
                        },
                      }}
                    >
                      <Box>{row.month}</Box>
                      <Box>{row.used}</Box>
                      <Box>{row.amount > 0 ? formatCurrency(row.amount) : "-"}</Box>
                      <Box>{row.surcharge > 0 ? formatCurrency(row.surcharge) : "-"}</Box>
                      <Box>{row.interest > 0 ? formatCurrency(row.interest) : "-"}</Box>
                      <Box>{formatCurrency(row.totalDue)}</Box>
                      <Box>{dayjs(row.paymentDate).isValid() ? dayjs(row.paymentDate).format("MM/DD/YY") : "-"}</Box>
                      <Box>{row.receiptNo}</Box>
                      <Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(event) => handleOpenRowActionMenu(event, row)}
                          sx={{
                            minWidth: 0,
                            px: 1.4,
                            py: 0.45,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "none",
                            borderColor: uiColors.navy,
                            color: uiColors.navy,
                          }}
                        >
                          Action
                        </Button>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: "center", color: "#111827" }}>
                    No water payments found for this taxpayer.
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  mt: 1.5,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  gap: 1.25,
                }}
              >
                {[
                  ["Receipts", new Set(selectedPaymentRows.map((item) => item.receiptNo).filter(Boolean)).size],
                  [
                    "Collector",
                    selectedPayment.collector ||
                      selectedPayment.userId ||
                      selectedPaymentRows[0]?.collector ||
                      selectedPaymentRows[0]?.userId ||
                      "-",
                  ],
                  [
                    "Total Water Payments",
                    formatCurrency(
                      selectedPaymentRows.reduce((sum, item) => sum + Number(item.amount || 0), 0)
                    ),
                  ],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      p: 1.2,
                      border: "1px solid #7c6a45",
                      bgcolor: "rgba(255,255,255,0.18)",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#374151" }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: "#111827" }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSelectedPayment(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={rowActionAnchorEl}
        open={Boolean(rowActionAnchorEl)}
        onClose={handleCloseRowActionMenu}
      >
        <MenuItem
          onClick={() => {
            if (rowActionTarget) {
              handleEditWaterCardRow(rowActionTarget);
            }
            handleCloseRowActionMenu();
          }}
        >
          Update
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (rowActionTarget) {
              handleDeleteWaterCardRow(rowActionTarget);
            }
            handleCloseRowActionMenu();
          }}
          sx={{ color: uiColors.red }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(editingPayment)}
        onClose={() => setEditingPayment(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
          }}
        >
          Update Water Payment
          <Button
            onClick={() => setEditingPayment(null)}
            size="small"
            startIcon={<CloseIcon />}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {editingPayment && (
            <GeneralFundPaymentEditForm
              data={{ payment_id: editingPayment.paymentId }}
              endpointBase="waterworks/payment-edit"
              title="Edit Water Payment"
              enableReceiptTypeEdit={false}
              onSaved={async () => {
                setEditingPayment(null);
                await loadPayments();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingWaterAccount}
        onClose={() => setEditingWaterAccount(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
          }}
        >
          Edit Statement Of Account
          <Button
            onClick={() => setEditingWaterAccount(false)}
            size="small"
            startIcon={<CloseIcon />}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
            <TextField
              label="Account No."
              value={waterAccountForm.accountNumber}
              onChange={(event) =>
                setWaterAccountForm((prev) => ({ ...prev, accountNumber: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Meter No."
              value={waterAccountForm.waterMeter}
              onChange={(event) =>
                setWaterAccountForm((prev) => ({ ...prev, waterMeter: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Connection"
              value={waterAccountForm.waterConnectionType}
              onChange={(event) =>
                setWaterAccountForm((prev) => ({ ...prev, waterConnectionType: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Address"
              value={waterAccountForm.address}
              onChange={(event) =>
                setWaterAccountForm((prev) => ({ ...prev, address: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Permittee"
              value={waterAccountForm.fullName}
              onChange={(event) =>
                setWaterAccountForm((prev) => ({ ...prev, fullName: event.target.value }))
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditingWaterAccount(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveWaterAccount}
            variant="contained"
            disabled={savingWaterAccount}
            sx={{ textTransform: "none" }}
          >
            {savingWaterAccount ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Index;

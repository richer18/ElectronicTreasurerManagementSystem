import {
  AccessTime,
  Add,
  Badge,
  Business,
  BusinessCenter,
  CalendarMonth,
  Cancel,
  CheckCircle,
  Close,
  Description,
  LocationOn,
  Person,
  QrCode2,
  VerifiedUser,
  Visibility,
  Download,
  Pending,
  Search,
  Storefront,
  TrendingUp,
  UploadFile,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance, { ensureCsrfCookie } from "../../../../api/axiosInstance";
import { useMaterialUIController } from "../../../../context";
import ModalBusiness from "./components/Modal";

const fallbackApplications = [
  {
    id: "BPLS-SAMPLE-1",
    businessIdentificationNumber: "BIN-2026-0001",
    businessName: "San Isidro Rice Depot",
    owner: "Maricel T. Ramos",
    barangay: "Poblacion",
    businessType: "Single Proprietorship",
    permitType: "New",
    lineOfBusiness: "Retail - Agricultural Supply",
    status: "released",
    registrationStatus: "ISSUED",
    step: "Permit Released",
    completeness: 100,
    submittedAt: "08 Apr 2026",
    dueNote: "Ready for claiming",
    amount: "PHP 6,420.00",
    amountPaid: "PHP 6,420.00",
    initials: "SR",
  },
  {
    id: "BPLS-SAMPLE-2",
    businessIdentificationNumber: "BIN-2026-0002",
    businessName: "Northbay Hardware Center",
    owner: "Eduardo V. Miguel",
    barangay: "San Roque",
    businessType: "Corporation",
    permitType: "Renewal",
    lineOfBusiness: "Construction Supply",
    status: "assessment",
    registrationStatus: "FOR ASSESSMENT",
    step: "Tax and Fee Assessment",
    completeness: 72,
    submittedAt: "07 Apr 2026",
    dueNote: "For BPLO review today",
    amount: "PHP 12,880.00",
    amountPaid: "PHP 12,880.00",
    initials: "NH",
  },
];

const emptySummary = {
  applicationsToday: 0,
  pendingEvaluation: 0,
  assessedFees: 0,
  releasedPermits: 0,
  needsAssessment: 0,
  forCompliance: 0,
  readyToRelease: 0,
  collectionsTotal: 0,
  paidTransactions: 0,
};

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

const currency = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const resolveCardStatus = (status) => {
  const value = String(status || "ACTIVE").toUpperCase();

  if (value.includes("EXPIRE")) {
    return { label: value, bg: "#7f1d1d", chip: "#fee2e2", text: "#991b1b" };
  }

  if (value.includes("RENEW")) {
    return { label: value, bg: "#854d0e", chip: "#fef3c7", text: "#a16207" };
  }

  return { label: value, bg: "#0f4c3a", chip: "#dcfce7", text: "#166534" };
};

const resolveRegistrationBadge = (status) => {
  const value = String(status || "N/A").trim().toUpperCase();

  if (value.includes("EXPIRE") || value.includes("CANCEL") || value.includes("RETIRE") || value.includes("CLOSE")) {
    return {
      label: value,
      icon: <Cancel fontSize="small" />,
      bg: "#fee2e2",
      text: "#b42318",
      border: "1px solid rgba(180,35,24,0.12)",
    };
  }

  if (value.includes("FOR RENEW") || value.includes("PENDING") || value.includes("ASSESS")) {
    return {
      label: value,
      icon: <Pending fontSize="small" />,
      bg: "#fef3c7",
      text: "#a16207",
      border: "1px solid rgba(161,98,7,0.14)",
    };
  }

  if (value.includes("RENEW")) {
    return {
      label: value,
      icon: <VerifiedUser fontSize="small" />,
      bg: "#fff8e6",
      text: "#9a6700",
      border: "1px solid rgba(154,103,0,0.14)",
    };
  }

  if (value.includes("NEW")) {
    return {
      label: value,
      icon: <Add fontSize="small" />,
      bg: "#dbeafe",
      text: "#1d4ed8",
      border: "1px solid rgba(29,78,216,0.14)",
    };
  }

  if (value.includes("ISSUED") || value.includes("ACTIVE")) {
    return {
      label: value,
      icon: <CheckCircle fontSize="small" />,
      bg: "#dcfce7",
      text: "#166534",
      border: "1px solid rgba(22,101,52,0.14)",
    };
  }

  return {
    label: value,
    icon: <Badge fontSize="small" />,
    bg: "#e2e8f0",
    text: "#334155",
    border: "1px solid rgba(51,65,85,0.12)",
  };
};

const getRegistrationFilterKey = (status) => {
  const value = String(status || "").trim().toUpperCase();

  if (value.includes("EXPIRE") || value.includes("CANCEL") || value.includes("RETIRE") || value.includes("CLOSE")) {
    return "expired";
  }

  if (value.includes("FOR RENEW") || value.includes("PENDING") || value.includes("ASSESS")) {
    return "pending";
  }

  if (value.includes("RENEW")) {
    return "renewal";
  }

  if (value.includes("NEW")) {
    return "new";
  }

  if (value.includes("ISSUED") || value.includes("ACTIVE")) {
    return "active";
  }

  return "other";
};

const BusinessRegistrationDashboard = () => {
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
      surface: darkMode ? "#141922" : "#ffffff",
      line: darkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0",
      text: darkMode ? "#f8fafc" : "#0f172a",
      muted: darkMode ? "#94a3b8" : "#475569",
      inputBg: darkMode ? "#111827" : "#ffffff",
    }),
    [darkMode]
  );

  const [applications, setApplications] = useState(fallbackApplications);
  const [summary, setSummary] = useState(emptySummary);
  const [searchTerm, setSearchTerm] = useState("");
  const [registrationFilter, setRegistrationFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBusinessCardOpen, setIsBusinessCardOpen] = useState(false);
  const [businessCard, setBusinessCard] = useState(null);
  const [businessCardLoading, setBusinessCardLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState("all");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState({
    registered: false,
    typeApplications: false,
    collections: false,
  });

  const registeredInputRef = useRef(null);
  const typeApplicationsInputRef = useRef(null);
  const collectionInputRef = useRef(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [applicationsResponse, summaryResponse] = await Promise.all([
        axiosInstance.get("/bpls/applications"),
        axiosInstance.get("/bpls/summary"),
      ]);

      const rows = Array.isArray(applicationsResponse.data)
        ? applicationsResponse.data.filter((item) => item?.businessName)
        : [];

      setApplications(rows.length > 0 ? rows : fallbackApplications);
      setSummary({ ...emptySummary, ...summaryResponse.data });
    } catch (error) {
      console.error("Failed to load BPLS dashboard data:", error);
      setApplications(fallbackApplications);
      setSummary(emptySummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return applications.filter((item) => {
      const matchesSearch =
        item.businessName?.toLowerCase().includes(term) ||
        item.businessIdentificationNumber?.toLowerCase().includes(term) ||
        item.businessType?.toLowerCase().includes(term) ||
        item.owner?.toLowerCase().includes(term) ||
        item.id?.toLowerCase().includes(term) ||
        item.barangay?.toLowerCase().includes(term) ||
        item.lineOfBusiness?.toLowerCase().includes(term) ||
        item.registrationStatus?.toLowerCase().includes(term);

      const matchesWorkflow = tabValue === "all" || item.status === tabValue;
      const matchesRegistration =
        registrationFilter === "all" ||
        getRegistrationFilterKey(item.registrationStatus) === registrationFilter;

      return matchesWorkflow && matchesRegistration && matchesSearch;
    });
  }, [applications, searchTerm, tabValue, registrationFilter]);

  const paginatedRows = useMemo(
    () => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredData, page, rowsPerPage]
  );

  useEffect(() => {
    setPage(0);
  }, [searchTerm, tabValue, rowsPerPage, registrationFilter]);

  const tabCounts = useMemo(
    () => ({
      all: applications.length,
      released: applications.filter((item) => item.status === "released").length,
      assessment: applications.filter((item) => item.status === "assessment").length,
      payment: applications.filter((item) => item.status === "payment").length,
      verification: applications.filter((item) => item.status === "verification").length,
      returned: applications.filter((item) => item.status === "returned").length,
    }),
    [applications]
  );

  const summaryCards = useMemo(
    () => [
      {
        title: "Applications Today",
        value: Number(summary.applicationsToday || 0).toLocaleString(),
        helper: "Filed through ELGU online and office-assisted channels",
        icon: <Business />,
      },
      {
        title: "Pending Evaluation",
        value: Number(summary.pendingEvaluation || 0).toLocaleString(),
        helper: "Still under verification, assessment, or payment review",
        icon: <Description />,
      },
      {
        title: "Assessed Fees",
        value: currency(summary.assessedFees),
        helper: "Projected amount based on imported application assessments",
        icon: <TrendingUp />,
      },
      {
        title: "Released Permits",
        value: Number(summary.releasedPermits || 0).toLocaleString(),
        helper: "Transactions already issued or ready for pick-up",
        icon: <Storefront />,
      },
    ],
    [summary]
  );

  const registrationLegend = useMemo(
    () => [
      { key: "new", label: "NEW" },
      { key: "renewal", label: "RENEWAL" },
      { key: "active", label: "ACTIVE / ISSUED" },
      { key: "pending", label: "FOR RENEWAL / PENDING" },
      { key: "expired", label: "EXPIRED / CANCELLED" },
    ],
    []
  );

  const importWorkbook = async (kind, file) => {
    if (!file) return;

    setImporting((prev) => ({ ...prev, [kind]: true }));

    try {
      await ensureCsrfCookie();
      const formData = new FormData();
      formData.append("file", file);

      const endpoint =
        kind === "registered"
          ? "/bpls/import/master-list"
          : kind === "typeApplications"
            ? "/bpls/import/type-applications"
            : "/bpls/import/collections";

      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const importedCount = response?.data?.imported ?? 0;
      const message = response?.data?.message || "Import completed successfully.";

      await loadDashboard();
      window.alert(`${message}\nImported rows: ${importedCount}`);
    } catch (error) {
      console.error(`Failed to import ${kind}:`, error);
      const message = error?.response?.data?.message || "Import failed.";
      window.alert(message);
    } finally {
      setImporting((prev) => ({ ...prev, [kind]: false }));
    }
  };

  const handleViewBusiness = async (row) => {
    const bin = row.businessIdentificationNumber;
    if (!bin) return;

    setIsBusinessCardOpen(true);
    setBusinessCard(null);
    setBusinessCardLoading(true);

    try {
      const response = await axiosInstance.get(`/bpls/business/${encodeURIComponent(bin)}`);
      setBusinessCard(response.data);
    } catch (error) {
      console.error("Failed to load business card:", error);
      setBusinessCard({
        businessIdentificationNumber: bin,
        businessName: row.businessName,
        typeOfBusiness: row.businessType,
        typeOfApplication: row.typeOfApplication,
        statusOfRegistration: row.registrationStatus,
        financials: { totalAmountPaid: row.amountPaid || "PHP 0.00" },
      });
    } finally {
      setBusinessCardLoading(false);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        minHeight: "100vh",
        backgroundColor: uiColors.bg,
      }}
    >
      <input
        ref={registeredInputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={(event) => {
          importWorkbook("registered", event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={typeApplicationsInputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={(event) => {
          importWorkbook("typeApplications", event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={collectionInputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={(event) => {
          importWorkbook("collections", event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <Box sx={{ mb: 4 }}>
        <Box
          display="flex"
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          gap={2}
          sx={{ py: 2 }}
          flexWrap="wrap"
        >
          <Box display="flex" alignItems="center" gap={2} flexGrow={1} flexWrap="wrap">
            <TextField
              fullWidth
              variant="outlined"
              label="Search Applications"
              placeholder="BIN, business name, type of business, or registration status"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              sx={{
                minWidth: { xs: "100%", md: 320 },
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
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: uiColors.inputBg,
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
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Chip
              icon={loading ? <CircularProgress size={16} color="inherit" /> : <AccessTime />}
              label={
                loading
                  ? "Refreshing queue..."
                  : summary.bplsDataReady
                    ? `BPLS data ready • ${Number(summary.linkedBusinesses || 0).toLocaleString()} linked`
                    : "Waiting for complete BPLS imports"
              }
              sx={{
                height: 44,
                px: 1,
                bgcolor: loading
                  ? darkMode
                    ? "#172030"
                    : "#e8eef7"
                  : summary.bplsDataReady
                    ? darkMode
                      ? "rgba(16,185,129,0.16)"
                      : "#dcfce7"
                    : darkMode
                      ? "rgba(245,158,11,0.16)"
                      : "#fef3c7",
                color: loading ? uiColors.navy : summary.bplsDataReady ? "#166534" : "#a16207",
                fontWeight: 700,
                borderRadius: "10px",
              }}
            />
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={importing.registered ? <CircularProgress size={18} color="inherit" /> : <UploadFile />}
              disabled={importing.registered}
              onClick={() => registeredInputRef.current?.click()}
              sx={{
                px: 3,
                height: 44,
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: 2,
                transition: "all 0.2s ease",
                backgroundColor: uiColors.teal,
                color: "white",
                "&:hover": {
                  backgroundColor: uiColors.tealHover,
                  transform: "translateY(-1px)",
                },
              }}
            >
              Import Master List
            </Button>

            <Button
              variant="contained"
              startIcon={
                importing.typeApplications ? <CircularProgress size={18} color="inherit" /> : <UploadFile />
              }
              disabled={importing.typeApplications}
              onClick={() => typeApplicationsInputRef.current?.click()}
              sx={{
                px: 3,
                height: 44,
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: 2,
                transition: "all 0.2s ease",
                backgroundColor: uiColors.navy,
                color: "white",
                "&:hover": {
                  backgroundColor: uiColors.navyHover,
                  transform: "translateY(-1px)",
                },
              }}
            >
              Import Type App
            </Button>

            <Button
              variant="contained"
              startIcon={
                importing.collections ? <CircularProgress size={18} color="inherit" /> : <UploadFile />
              }
              disabled={importing.collections}
              onClick={() => collectionInputRef.current?.click()}
              sx={{
                px: 3,
                height: 44,
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: 2,
                transition: "all 0.2s ease",
                backgroundColor: uiColors.steel,
                color: "white",
                "&:hover": {
                  backgroundColor: uiColors.steelHover,
                  transform: "translateY(-1px)",
                },
              }}
            >
              Import Collection
            </Button>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Download />}
              sx={{
                px: 3,
                height: 44,
                fontSize: 14,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: 2,
                transition: "all 0.2s ease",
                backgroundColor: uiColors.amber,
                color: "white",
                "&:hover": {
                  backgroundColor: uiColors.amberHover,
                  transform: "translateY(-1px)",
                },
              }}
            >
              Export Queue
            </Button>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsModalOpen(true)}
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
              New Application
            </Button>
          </Box>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          gap={3}
          sx={{
            mt: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {summaryCards.map((card, index) => (
            <Card
              key={card.title}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: "16px",
                background: uiColors.cardGradients[index % uiColors.cardGradients.length],
                color: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                minWidth: 0,
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
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ maxWidth: "82%" }}>
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
                    {card.title}
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
                    {card.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.82 }}>
                    {card.helper}
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
                  {card.icon}
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
                      width: "70%",
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

      <Paper
        sx={{
          borderRadius: 4,
          boxShadow: 6,
          overflow: "hidden",
          backgroundColor: uiColors.surface,
          border: `1px solid ${uiColors.line}`,
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, pt: 3, pb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(event, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 0,
              "& .MuiTabs-indicator": {
                height: 4,
                borderRadius: "999px",
                backgroundColor: uiColors.teal,
              },
              "& .MuiTab-root": {
                textTransform: "none",
                minHeight: 0,
                px: 1.5,
                py: 1.25,
                mr: 1,
                borderRadius: 999,
                color: uiColors.muted,
                fontWeight: 700,
                "&.Mui-selected": { color: uiColors.text },
              },
            }}
          >
            {[
              ["all", "All Queue"],
              ["verification", "Verification"],
              ["assessment", "Assessment"],
              ["payment", "Payment"],
              ["released", "Released"],
              ["returned", "Returned"],
            ].map(([value, label]) => (
              <Tab
                key={value}
                value={value}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>{label}</span>
                    <Chip
                      label={tabCounts[value]}
                      size="small"
                      sx={{
                        height: 20,
                        bgcolor:
                          value === tabValue
                            ? darkMode
                              ? "rgba(58,160,143,0.22)"
                              : "rgba(15,107,98,0.12)"
                            : darkMode
                              ? "rgba(255,255,255,0.08)"
                              : "#edf2f7",
                        color: value === tabValue ? uiColors.teal : uiColors.muted,
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                }
              />
            ))}
          </Tabs>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 2 }}
          >
            {registrationLegend.map(({ key, label }) => {
              const registrationMeta = resolveRegistrationBadge(label);
              const isActive = registrationFilter === key;

              return (
                <Chip
                  key={key}
                  icon={registrationMeta.icon}
                  label={label}
                  size="small"
                  clickable
                  onClick={() =>
                    setRegistrationFilter((current) => (current === key ? "all" : key))
                  }
                  sx={{
                    bgcolor: registrationMeta.bg,
                    color: registrationMeta.text,
                    border: registrationMeta.border,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: isActive ? "0 0 0 2px rgba(15,39,71,0.14)" : "none",
                    opacity: registrationFilter === "all" || isActive ? 1 : 0.56,
                    transform: isActive ? "translateY(-1px)" : "none",
                    transition: "all 0.18s ease",
                    "& .MuiChip-icon": { color: registrationMeta.text },
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                />
              );
            })}
          </Stack>
          <Typography variant="caption" sx={{ mt: 1, display: "block", color: uiColors.muted }}>
            Click a registration badge to filter the table. Click it again to clear.
          </Typography>
        </Box>

        <Divider />

        <TableContainer
          component={Box}
          sx={{
            "& .MuiTableCell-root": {
              py: 2,
              borderBottomColor: uiColors.line,
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>Business Identification Number</StyledTableCell>
                <StyledTableCell>Business Name</StyledTableCell>
                <StyledTableCell>Type of Business</StyledTableCell>
                <StyledTableCell>Status of Registration</StyledTableCell>
                <StyledTableCell>Amount Paid</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Stack alignItems="center" spacing={1.5}>
                      <CircularProgress size={28} />
                      <Typography variant="body2" sx={{ color: uiColors.muted }}>
                        Loading imported BPLS queue...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: uiColors.muted }}>
                      No records matched the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => {
                  const registrationMeta = resolveRegistrationBadge(row.registrationStatus);

                  return (
                    <TableRow
                      key={row.recordKey || row.id}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: darkMode
                            ? "rgba(255,255,255,0.03)"
                            : "action.hover",
                        },
                      }}
                    >
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={700} sx={{ color: uiColors.text }}>
                          {row.businessIdentificationNumber || row.id || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={700} sx={{ color: uiColors.text }}>
                          {row.businessName || "-"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: uiColors.muted, display: "block" }}>
                          {row.lineOfBusiness || row.owner || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={row.businessType || row.permitType || "N/A"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            color: uiColors.navy,
                            bgcolor: darkMode ? "rgba(79,123,181,0.18)" : "#e8eef7",
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          icon={registrationMeta.icon}
                          label={registrationMeta.label}
                          size="small"
                          sx={{
                            bgcolor: registrationMeta.bg,
                            color: registrationMeta.text,
                            border: registrationMeta.border,
                            fontWeight: 800,
                            maxWidth: 220,
                            "& .MuiChip-label": {
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            },
                            "& .MuiChip-icon": { color: registrationMeta.text },
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={700} sx={{ color: uiColors.text }}>
                          {row.amountPaid || row.amount || "PHP 0.00"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          variant="contained"
                          startIcon={<Visibility />}
                          onClick={() => handleViewBusiness(row)}
                          sx={{
                            textTransform: "none",
                            px: 2,
                            py: 0.75,
                            fontSize: "0.75rem",
                            borderRadius: 2,
                            backgroundColor: uiColors.navy,
                            "&:hover": { backgroundColor: uiColors.navyHover },
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="flex-end" alignItems="center" m={2}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Box>
      </Paper>

      <Dialog
        open={isBusinessCardOpen}
        onClose={() => {
          setIsBusinessCardOpen(false);
          setSelectedPayment(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1.5,
          }}
        >
          <span>Business Card</span>
          <IconButton
            onClick={() => {
              setIsBusinessCardOpen(false);
              setSelectedPayment(null);
            }}
            size="small"
            sx={{
              color: "#475569",
              border: "1px solid rgba(15,23,42,0.08)",
              bgcolor: "#fff",
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {businessCardLoading ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
              <CircularProgress />
              <Typography variant="body2">Loading business details...</Typography>
            </Stack>
          ) : businessCard ? (
            <Box>
              {(() => {
                const statusTone = resolveCardStatus(businessCard.statusOfRegistration || "ACTIVE");
                const validityYear = businessCard.expirationDate
                  ? businessCard.expirationDate.slice(-4)
                  : businessCard.dateIssued
                    ? businessCard.dateIssued.slice(-4)
                    : "2026";
                const registrationValue = String(businessCard.statusOfRegistration || "ACTIVE").trim();
                const typeOfApplicationValue = String(businessCard.typeOfApplication || "").trim();
                const statusOfApplicationValue = String(businessCard.statusOfApplication || "").trim();
                const sameRegistrationAndApplication =
                  registrationValue &&
                  typeOfApplicationValue &&
                  registrationValue.toUpperCase() === typeOfApplicationValue.toUpperCase();
                const operationalDetails = [
                  ["Permit Number", businessCard.permitNo || "MP-2026-00089"],
                  ["Business Plate Number", businessCard.businessIdentificationNumber || "BP-2026-00125"],
                  ["Status of Registration", registrationValue || "ACTIVE"],
                  sameRegistrationAndApplication
                    ? ["Status of Application", statusOfApplicationValue || "-"]
                    : ["Type of Application", typeOfApplicationValue || "RENEWAL"],
                  ["Type of Business", businessCard.typeOfBusiness || "SOLE PROPRIETORSHIP"],
                  ["Email Address", businessCard.emailAddress || "-"],
                ];

                return (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 3,
                      maxWidth: 980,
                      mx: "auto",
                    }}
                  >
                    <Card
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        minHeight: 440,
                        p: 3,
                        borderRadius: 2,
                        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                        border: "2px solid #d4af37",
                        boxShadow: "0 24px 60px rgba(15,23,42,0.14)",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          inset: 12,
                          borderRadius: 1,
                          border: "1px solid rgba(15,39,71,0.14)",
                        },
                      }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 62,
                              height: 62,
                              borderRadius: 1.5,
                              bgcolor: "#ffffff",
                              display: "grid",
                              placeItems: "center",
                              border: "1px solid rgba(15,39,71,0.12)",
                              boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                              overflow: "hidden",
                              p: 0.35,
                            }}
                          >
                            <Box
                              component="img"
                              src="/assets/images/ZAMBO_LOGO_P.png"
                              alt="Municipality of Zamboanguita logo"
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ display: "block", color: "#475569", letterSpacing: "0.08em" }}>
                              REPUBLIC OF THE PHILIPPINES
                            </Typography>
                            <Typography fontWeight={800} sx={{ color: "#0f2747" }}>
                              Province of Negros Oriental
                            </Typography>
                            <Typography fontWeight={900} sx={{ fontSize: "1.16rem", color: "#0f2747" }}>
                              Municipality of Zamboanguita
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#b38728", fontWeight: 800 }}>
                              Business Permit and Licensing Office
                            </Typography>
                          </Box>
                        </Stack>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.75,
                            bgcolor: statusTone.chip,
                            color: statusTone.text,
                            fontWeight: 900,
                            border: "1px solid rgba(180,134,24,0.18)",
                            borderRadius: 1,
                            lineHeight: 1,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {statusTone.label}
                        </Box>
                      </Stack>

                      <Box
                        sx={{
                          mt: 2.5,
                          p: { xs: 2, md: 2.5 },
                          borderRadius: 1.5,
                          background: "#ffffff",
                          border: "1px solid rgba(15,39,71,0.12)",
                          boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
                        }}
                      >
                        <Typography
                          variant="overline"
                          sx={{
                            display: "block",
                            color: "#0f2747",
                            letterSpacing: "0.14em",
                            fontWeight: 800,
                          }}
                        >
                          Business Permit Card
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.75,
                            fontSize: { xs: "1.8rem", md: "2.45rem" },
                            lineHeight: 1.05,
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                            color: "#0f2747",
                            maxWidth: 780,
                          }}
                        >
                          {businessCard.businessName || "Sample Trading and Services"}
                        </Typography>

                        <Box
                          sx={{
                            mt: 1.75,
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                            gap: 1.25,
                          }}
                        >
                          <Box
                            sx={{
                              p: 1.35,
                              borderRadius: 1,
                              background: "linear-gradient(135deg, #eff6ff 0%, #e2e8f0 100%)",
                              border: "1px solid rgba(15,39,71,0.1)",
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Badge sx={{ color: "#0f2747", fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                                  Permit Number
                                </Typography>
                                <Typography fontWeight={900} sx={{ color: "#0f2747" }}>
                                  {businessCard.permitNo || "MP-2026-00089"}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>

                          <Box
                            sx={{
                              p: 1.35,
                              borderRadius: 1,
                              background: "linear-gradient(135deg, #fff8e6 0%, #fef3c7 100%)",
                              border: "1px solid rgba(212,175,55,0.24)",
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <VerifiedUser sx={{ color: "#8a6a18", fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: "#8a6a18", fontWeight: 700 }}>
                                  Business Plate Number
                                </Typography>
                                <Typography fontWeight={900} sx={{ color: "#0f2747" }}>
                                  {businessCard.businessIdentificationNumber || "BP-2026-00125"}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.5, mt: 2 }}>
                        {[
                          { icon: <Person fontSize="small" />, label: "Owner Name", value: businessCard.ownerName || "Juan Dela Cruz" },
                          { icon: <BusinessCenter fontSize="small" />, label: "Line of Business", value: businessCard.lineOfBusiness || businessCard.typeOfBusiness || "-" },
                          { icon: <CalendarMonth fontSize="small" />, label: "Date Issued", value: businessCard.dateIssued || "January 07, 2026" },
                          { icon: <AccessTime fontSize="small" />, label: "Expiration Date", value: businessCard.expirationDate || "December 31, 2026" },
                        ].map((item) => (
                          <Box key={item.label} sx={{ p: 1.6, borderRadius: 3, border: "1px solid rgba(15,39,71,0.12)", bgcolor: "rgba(255,255,255,0.88)" }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "#0f2747" }}>
                              {item.icon}
                              <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700 }}>
                                {item.label}
                              </Typography>
                            </Stack>
                            <Typography fontWeight={800} sx={{ mt: 0.6, color: "#0f172a" }}>
                              {item.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ mt: 1.5, p: 1.8, borderRadius: 3, border: "1px solid rgba(15,39,71,0.12)", bgcolor: "rgba(255,255,255,0.88)" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOn fontSize="small" sx={{ color: "#0f2747" }} />
                          <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700 }}>
                            Business Address
                          </Typography>
                        </Stack>
                        <Typography fontWeight={800} sx={{ mt: 0.6, color: "#0f172a" }}>
                          {businessCard.businessAddress || "Poblacion, Zamboanguita, Negros Oriental"}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.75fr 1.25fr" }, gap: 1.5, mt: 2 }}>
                        <Box sx={{ p: 2, borderRadius: 4, border: "1px solid rgba(15,39,71,0.12)", bgcolor: "rgba(15,39,71,0.04)" }}>
                          <Typography variant="caption" sx={{ color: "#64748b", letterSpacing: "0.08em" }}>
                            Year of Validity
                          </Typography>
                          <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1, color: "#0f2747" }}>
                            {validityYear}
                          </Typography>
                        </Box>
                        <Box sx={{ p: 2, borderRadius: 4, border: "1px dashed rgba(15,39,71,0.22)", bgcolor: "rgba(255,255,255,0.9)" }}>
                          <Typography variant="caption" sx={{ color: "#64748b", letterSpacing: "0.08em" }}>
                            Online Verification
                          </Typography>
                          <Box sx={{ mt: 1.2, display: "grid", gridTemplateColumns: "84px 1fr", gap: 1.5, alignItems: "center" }}>
                            <Box sx={{ aspectRatio: "1 / 1", borderRadius: 3, border: "2px solid #0f2747", display: "grid", placeItems: "center", bgcolor: "#fff" }}>
                              <QrCode2 sx={{ fontSize: 58, color: "#0f2747" }} />
                            </Box>
                            <Box>
                              <Typography fontWeight={800} sx={{ color: "#0f2747" }}>
                                Scan to verify permit
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#475569" }}>
                                Official BPLO validation record
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5, mt: 2 }}>
                        <Box sx={{ p: 2, borderRadius: 4, border: "1px solid rgba(15,39,71,0.12)", bgcolor: "rgba(255,255,255,0.88)" }}>
                          <Typography variant="caption" sx={{ color: "#64748b", letterSpacing: "0.08em" }}>
                            Signature / Approval
                          </Typography>
                          <Box sx={{ mt: 3.4, pt: 1.1, borderTop: "1.5px solid rgba(15,23,42,0.5)" }}>
                            <Typography fontWeight={800} sx={{ color: "#0f2747" }}>
                              Mayor / BPLO Head
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              Authorized signatory
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ p: 2, borderRadius: 4, background: "linear-gradient(135deg, #0f2747 0%, #1b2f4b 100%)", color: "white" }}>
                          <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: "0.08em" }}>
                            Official Notice
                          </Typography>
                          <Typography fontWeight={800} sx={{ mt: 0.6 }}>
                            This permit card must be displayed in a conspicuous place.
                          </Typography>
                        </Box>
                      </Box>
                    </Card>

                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 6,
                        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                        color: "#0f172a",
                        border: "1px solid rgba(15,39,71,0.12)",
                        boxShadow: "0 20px 44px rgba(15,23,42,0.1)",
                      }}
                    >
                      <Typography variant="overline" sx={{ color: "#64748b", letterSpacing: "0.12em" }}>
                        Permit Card Back
                      </Typography>
                      <Typography variant="h5" fontWeight={900} sx={{ mt: 0.4, color: "#0f2747" }}>
                        BPLO Operational Record
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#475569" }}>
                        Official business permit reference for registration and payment verification.
                      </Typography>

                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.5, mt: 2.5 }}>
                        {operationalDetails.map(([label, value]) => (
                          <Box key={label} sx={{ p: 1.6, borderRadius: 3, bgcolor: "#fff", border: "1px solid rgba(15,39,71,0.12)" }}>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              {label}
                            </Typography>
                            <Typography fontWeight={800} sx={{ color: "#0f172a" }}>{value || "-"}</Typography>
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 1.5, mt: 2 }}>
                        {[
                          ["Capital Investment", businessCard.financials?.capitalInvestment || "-"],
                          ["Gross Essential", businessCard.financials?.grossSalesEssential || "-"],
                          ["Gross Non-Essential", businessCard.financials?.grossSalesNonEssential || "-"],
                          ["Total Amount Paid", businessCard.financials?.totalAmountPaid || "-"],
                        ].map(([label, value]) => (
                          <Box key={label} sx={{ p: 1.6, borderRadius: 3, bgcolor: "#fff8e6", border: "1px solid rgba(212,175,55,0.22)" }}>
                            <Typography variant="caption" sx={{ color: "#8a6a18" }}>
                              {label}
                            </Typography>
                            <Typography fontWeight={800} sx={{ color: "#0f172a" }}>{value}</Typography>
                          </Box>
                        ))}
                      </Box>

                      <Box
                        sx={{
                          mt: 2.5,
                          p: 2.2,
                          borderRadius: 4,
                          bgcolor: "#f8fafc",
                          border: "1px solid rgba(15,39,71,0.12)",
                        }}
                      >
                        <Typography variant="h6" fontWeight={900} sx={{ mb: 1.6, color: "#0f2747" }}>
                          Payment History
                        </Typography>

                        {businessCard.collections?.length ? (
                          <Stack spacing={1.25}>
                    {businessCard.collections.map((payment, index) => (
                      <Box
                        key={`${payment.orNumber || "payment"}-${index}`}
                        sx={{
                          p: 1.4,
                          borderRadius: 3,
                          bgcolor: "#ffffff",
                          border: "1px solid rgba(15,39,71,0.12)",
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1.1fr 1.2fr 0.8fr 0.9fr 0.7fr" },
                            gap: 1.5,
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              O.R. Number
                            </Typography>
                            <Typography fontWeight={800} sx={{ color: "#0f172a" }}>{payment.orNumber || "-"}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              Date Paid
                            </Typography>
                            <Typography fontWeight={800} sx={{ color: "#0f172a" }}>{payment.datePaid || "-"}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              Type
                            </Typography>
                            <Typography fontWeight={800} sx={{ color: "#0f172a" }}>{payment.transactionType || "-"}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              Amount Paid
                            </Typography>
                            <Typography fontWeight={800} sx={{ color: "#0f172a" }}>{payment.amountPaid || "-"}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setSelectedPayment(payment)}
                              sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                backgroundColor: "#d4af37",
                                color: "#0f172a",
                                fontWeight: 800,
                                "&:hover": {
                                  backgroundColor: "#e2bf52",
                                },
                              }}
                            >
                              View
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                          </Stack>
                ) : (
                          <Typography variant="body2" sx={{ color: "#64748b" }}>
                    No payment records found for this business.
                  </Typography>
                )}
                      </Box>
                    </Card>
                  </Box>
                );
              })()}
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Payment Details</DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    O.R. Number
                  </Typography>
                  <Typography fontWeight={700}>{selectedPayment.orNumber || "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date Paid
                  </Typography>
                  <Typography fontWeight={700}>{selectedPayment.datePaid || "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Transaction Type
                  </Typography>
                  <Typography fontWeight={700}>{selectedPayment.transactionType || "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Amount Paid
                  </Typography>
                  <Typography fontWeight={700}>{selectedPayment.amountPaid || "-"}</Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                  gap: 1.5,
                }}
              >
                {Object.entries(selectedPayment.breakdown || {}).map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${uiColors.line}`,
                      bgcolor: darkMode ? "rgba(255,255,255,0.02)" : "#f8fafc",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: uiColors.muted }}>
                      {label}
                    </Typography>
                    <Typography fontWeight={700} sx={{ color: uiColors.text }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {isModalOpen && <ModalBusiness onClose={() => setIsModalOpen(false)} />}
    </Box>
  );
};

export default BusinessRegistrationDashboard;

import {
  AccessTime,
  Add,
  Apartment,
  ArrowOutward,
  AssignmentTurnedIn,
  Business,
  Cancel,
  CheckCircle,
  Description,
  Download,
  MoreVert,
  Pending,
  ReceiptLong,
  Search,
  Storefront,
  TaskAlt,
  TrendingUp,
  UploadFile,
  WarningAmber,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
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
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance, { ensureCsrfCookie } from "../../../../api/axiosInstance";
import ModalBusiness from "./components/Modal";

const palette = {
  ink: "#0f172a",
  slate: "#475569",
  line: "#dbe4ee",
  mist: "#eef4f8",
  paper: "#fcf7ee",
  brand: "#0b5d4b",
  brandDeep: "#083b31",
  gold: "#d6a64f",
  alert: "#d97706",
  danger: "#b42318",
  success: "#117a65",
  info: "#1d4ed8",
};

const fallbackApplications = [
  {
    id: "BPLS-SAMPLE-1",
    businessName: "San Isidro Rice Depot",
    owner: "Maricel T. Ramos",
    barangay: "Poblacion",
    permitType: "New",
    lineOfBusiness: "Retail - Agricultural Supply",
    status: "released",
    step: "Permit Released",
    completeness: 100,
    submittedAt: "08 Apr 2026",
    dueNote: "Ready for claiming",
    amount: "PHP 6,420.00",
    initials: "SR",
  },
  {
    id: "BPLS-SAMPLE-2",
    businessName: "Northbay Hardware Center",
    owner: "Eduardo V. Miguel",
    barangay: "San Roque",
    permitType: "Renewal",
    lineOfBusiness: "Construction Supply",
    status: "assessment",
    step: "Tax and Fee Assessment",
    completeness: 72,
    submittedAt: "07 Apr 2026",
    dueNote: "For BPLO review today",
    amount: "PHP 12,880.00",
    initials: "NH",
  },
];

const statusMeta = {
  released: { label: "Released", icon: <CheckCircle fontSize="small" />, tint: "#dcfce7", text: palette.success },
  assessment: { label: "Assessment", icon: <ReceiptLong fontSize="small" />, tint: "#dbeafe", text: palette.info },
  payment: { label: "Payment", icon: <AssignmentTurnedIn fontSize="small" />, tint: "#fef3c7", text: palette.alert },
  verification: { label: "Verification", icon: <Pending fontSize="small" />, tint: "#ede9fe", text: "#6d28d9" },
  returned: { label: "Returned", icon: <Cancel fontSize="small" />, tint: "#fee2e2", text: palette.danger },
};

const laneMeta = [
  { key: "needsAssessment", title: "Needs Assessment", helper: "Applications waiting for tax and fee computation", icon: <ReceiptLong />, color: palette.info },
  { key: "forCompliance", title: "For Compliance", helper: "Applicants with incomplete clearances or returned remarks", icon: <WarningAmber />, color: palette.alert },
  { key: "readyToRelease", title: "Ready to Release", helper: "Permits complete and available for release window", icon: <TaskAlt />, color: palette.success },
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

const currency = (value) =>
  `PHP ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const BusinessRegistrationDashboard = () => {
  const [applications, setApplications] = useState(fallbackApplications);
  const [summary, setSummary] = useState(emptySummary);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [tabValue, setTabValue] = useState("all");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState({ master: false, collections: false });
  const [notice, setNotice] = useState("Import the ELGU exports to replace the sample queue with live BPLS records.");

  const masterInputRef = useRef(null);
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
      setNotice(
        rows.length > 0
          ? "BPLS queue loaded from imported ELGU data."
          : "No imported BPLS records found yet. The queue is showing sample data."
      );
    } catch (error) {
      console.error("Failed to load BPLS dashboard data:", error);
      setApplications(fallbackApplications);
      setSummary(emptySummary);
      setNotice("Unable to load imported BPLS data. The queue is showing sample data.");
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
        item.owner?.toLowerCase().includes(term) ||
        item.id?.toLowerCase().includes(term) ||
        item.barangay?.toLowerCase().includes(term) ||
        item.lineOfBusiness?.toLowerCase().includes(term);
      return (tabValue === "all" || item.status === tabValue) && matchesSearch;
    });
  }, [applications, searchTerm, tabValue]);

  const paginatedRows = useMemo(
    () => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredData, page, rowsPerPage]
  );

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
      { title: "Applications Today", value: Number(summary.applicationsToday || 0).toLocaleString(), helper: "Filed through ELGU online and office-assisted channels", icon: <Business /> },
      { title: "Pending Evaluation", value: Number(summary.pendingEvaluation || 0).toLocaleString(), helper: "Still under verification, assessment, or payment review", icon: <Description /> },
      { title: "Assessed Fees", value: currency(summary.assessedFees), helper: "Projected amount based on imported application assessments", icon: <TrendingUp /> },
      { title: "Released Permits", value: Number(summary.releasedPermits || 0).toLocaleString(), helper: "Transactions already issued or ready for pick-up", icon: <Storefront /> },
    ],
    [summary]
  );

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedRow(null);
  };

  const importWorkbook = async (kind, file) => {
    if (!file) return;
    setImporting((prev) => ({ ...prev, [kind]: true }));
    setNotice(`Uploading ${file.name}...`);
    try {
      await ensureCsrfCookie();
      const formData = new FormData();
      formData.append("file", file);
      const endpoint = kind === "master" ? "/bpls/import/master-list" : "/bpls/import/collections";
      const response = await axiosInstance.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const importedCount = response?.data?.imported ?? 0;
      const message = response?.data?.message || "Import completed successfully.";
      setNotice(`${message} Imported rows: ${importedCount}.`);
      await loadDashboard();
      window.alert(`${message}\nImported rows: ${importedCount}`);
    } catch (error) {
      console.error(`Failed to import ${kind}:`, error);
      const message = error?.response?.data?.message || "Import failed.";
      setNotice(message);
      window.alert(message);
    } finally {
      setImporting((prev) => ({ ...prev, [kind]: false }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        background:
          "radial-gradient(circle at top left, rgba(214,166,79,0.18), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef3f7 100%)",
      }}
    >
      <input ref={masterInputRef} type="file" accept=".xlsx" hidden onChange={(event) => { importWorkbook("master", event.target.files?.[0]); event.target.value = ""; }} />
      <input ref={collectionInputRef} type="file" accept=".xlsx" hidden onChange={(event) => { importWorkbook("collections", event.target.files?.[0]); event.target.value = ""; }} />

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 6,
          p: { xs: 3, md: 4 },
          color: "white",
          background: `linear-gradient(140deg, ${palette.brandDeep} 0%, ${palette.brand} 58%, #0f766e 100%)`,
          boxShadow: "0 28px 70px rgba(8,59,49,0.26)",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 12%, rgba(255,255,255,0.18), transparent 22%), radial-gradient(circle at 80% 82%, rgba(214,166,79,0.18), transparent 18%)" }} />
        <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3} sx={{ position: "relative", zIndex: 1 }}>
          <Box maxWidth={760}>
            <Chip label="ELGU Business Permit and Licensing System" sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.12)", color: "white", borderRadius: "999px", fontWeight: 700, backdropFilter: "blur(8px)" }} />
            <Typography sx={{ fontSize: { xs: "2rem", md: "3rem" }, lineHeight: 1.05, fontWeight: 800, letterSpacing: "-0.03em", maxWidth: 680 }}>
              Import the ELGU BPLS master list and collection abstract into a permit command center.
            </Typography>
            <Typography sx={{ mt: 2, maxWidth: 640, color: "rgba(255,255,255,0.82)" }}>
              This screen accepts your online BPLS exports, stores them in dedicated tables, and turns them into an operational queue for verification, assessment, payment, and release.
            </Typography>
          </Box>

          <Stack spacing={1.5} alignItems={{ xs: "stretch", lg: "flex-end" }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)} sx={{ alignSelf: { xs: "stretch", lg: "flex-end" }, px: 3, py: 1.35, borderRadius: 3, bgcolor: palette.gold, color: palette.ink, fontWeight: 800, textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#e4b967", boxShadow: "none" } }}>
              Open New Transaction
            </Button>

            <Card sx={{ minWidth: { xs: "100%", lg: 360 }, p: 2, borderRadius: 4, bgcolor: "rgba(255,255,255,0.1)", color: "white", backdropFilter: "blur(12px)" }}>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.68)" }}>Import Status</Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "white" }}><Apartment /></Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={800}>{notice}</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.76)" }}>
                    Paid transactions imported: {Number(summary.paidTransactions || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }, gap: 2, mt: 3 }}>
        {summaryCards.map((card) => (
          <Card key={card.title} sx={{ p: 2.5, borderRadius: 5, border: `1px solid ${palette.line}`, boxShadow: "0 18px 44px rgba(15,23,42,0.06)", background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="overline" sx={{ color: palette.slate, letterSpacing: "0.08em" }}>{card.title}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: palette.ink }}>{card.value}</Typography>
                <Typography variant="body2" sx={{ mt: 0.8, color: palette.slate }}>{card.helper}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: palette.paper, color: palette.brand, width: 52, height: 52 }}>{card.icon}</Avatar>
            </Stack>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1.8fr 1fr" }, gap: 2, mt: 3 }}>
        <Card sx={{ p: 2.5, borderRadius: 5, border: `1px solid ${palette.line}`, boxShadow: "0 18px 44px rgba(15,23,42,0.06)" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5}>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: palette.ink }}>Processing Lanes</Typography>
              <Typography variant="body2" sx={{ color: palette.slate }}>Prioritize what treasury and BPLO staff need to touch next.</Typography>
            </Box>
            <Chip icon={<AccessTime fontSize="small" />} label={loading ? "Refreshing queue..." : "Updated from imported BPLS data"} sx={{ bgcolor: palette.mist, color: palette.brandDeep, fontWeight: 700 }} />
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mt: 2.5 }}>
            {laneMeta.map((lane) => (
              <Box key={lane.key} sx={{ p: 2, borderRadius: 4, bgcolor: "#f8fafc", border: `1px solid ${palette.line}` }}>
                <Avatar sx={{ width: 44, height: 44, mb: 1.5, bgcolor: `${lane.color}18`, color: lane.color }}>{lane.icon}</Avatar>
                <Typography variant="h4" fontWeight={800} sx={{ color: palette.ink }}>{Number(summary[lane.key] || 0).toLocaleString()}</Typography>
                <Typography fontWeight={700} sx={{ mt: 0.5, color: palette.ink }}>{lane.title}</Typography>
                <Typography variant="body2" sx={{ mt: 0.75, color: palette.slate }}>{lane.helper}</Typography>
              </Box>
            ))}
          </Box>
        </Card>

        <Card sx={{ p: 2.5, borderRadius: 5, border: `1px solid ${palette.line}`, boxShadow: "0 18px 44px rgba(15,23,42,0.06)", background: `linear-gradient(180deg, ${palette.paper} 0%, #fff 100%)` }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: palette.ink }}>Import Center</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: palette.slate }}>Load the ELGU exports directly into dedicated BPLS tables.</Typography>

          <Stack spacing={1.5} sx={{ mt: 2.5 }}>
            <Button variant="contained" startIcon={importing.master ? <CircularProgress size={18} color="inherit" /> : <UploadFile />} disabled={importing.master} onClick={() => masterInputRef.current?.click()} sx={{ justifyContent: "flex-start", borderRadius: 3, py: 1.25, textTransform: "none", bgcolor: palette.brandDeep, "&:hover": { bgcolor: palette.brand } }}>
              Import Master List
            </Button>
            <Button variant="outlined" startIcon={importing.collections ? <CircularProgress size={18} color="inherit" /> : <UploadFile />} disabled={importing.collections} onClick={() => collectionInputRef.current?.click()} sx={{ justifyContent: "flex-start", borderRadius: 3, py: 1.25, textTransform: "none", borderColor: palette.brandDeep, color: palette.brandDeep }}>
              Import General Collection
            </Button>
          </Stack>

          <Stack spacing={1.25} sx={{ mt: 2.5 }}>
            {[
              "Master list populates the BPLS application queue and permit workflow table.",
              "General collection stores paid permit transactions and updates collection totals.",
              "Repeat imports are safe because records are upserted using stable record keys.",
            ].map((item) => (
              <Box key={item} sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(255,255,255,0.72)", border: `1px solid ${palette.line}` }}>
                <Typography variant="body2" sx={{ color: palette.ink, fontWeight: 600 }}>{item}</Typography>
              </Box>
            ))}
          </Stack>

          <Button endIcon={<ArrowOutward />} sx={{ mt: 2.5, px: 0, color: palette.brandDeep, textTransform: "none", fontWeight: 800 }}>
            Collection imported: {currency(summary.collectionsTotal)}
          </Button>
        </Card>
      </Box>

      <Card sx={{ mt: 3, borderRadius: 5, border: `1px solid ${palette.line}`, boxShadow: "0 18px 44px rgba(15,23,42,0.06)", overflow: "hidden" }}>
        <Box sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
            <TextField
              fullWidth
              placeholder="Search business name, owner, control no., barangay, or line of business"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: palette.slate }} />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: { md: 540 }, "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#fff" } }}
            />

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button variant="outlined" startIcon={<Download />} sx={{ borderRadius: 3, textTransform: "none", px: 2.25, borderColor: palette.line, color: palette.ink }}>
                Export Queue
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)} sx={{ borderRadius: 3, textTransform: "none", px: 2.25, bgcolor: palette.brandDeep, "&:hover": { bgcolor: palette.brand } }}>
                New Application
              </Button>
            </Stack>
          </Stack>

          <Tabs
            value={tabValue}
            onChange={(event, newValue) => {
              setTabValue(newValue);
              setPage(0);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mt: 2.5,
              minHeight: 0,
              "& .MuiTabs-indicator": { height: 4, borderRadius: "999px", backgroundColor: palette.brand },
              "& .MuiTab-root": {
                textTransform: "none",
                minHeight: 0,
                px: 1.5,
                py: 1.25,
                mr: 1,
                borderRadius: 999,
                color: palette.slate,
                fontWeight: 700,
                "&.Mui-selected": { color: palette.brandDeep },
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
                        bgcolor: value === tabValue ? `${palette.brand}16` : palette.mist,
                        color: value === tabValue ? palette.brandDeep : palette.slate,
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 800, color: palette.ink }}>Application</TableCell>
                <TableCell sx={{ fontWeight: 800, color: palette.ink }}>Owner / Barangay</TableCell>
                <TableCell sx={{ fontWeight: 800, color: palette.ink }}>Permit Type</TableCell>
                <TableCell sx={{ fontWeight: 800, color: palette.ink }}>Current Step</TableCell>
                <TableCell sx={{ fontWeight: 800, color: palette.ink }}>Completeness</TableCell>
                <TableCell sx={{ fontWeight: 800, color: palette.ink }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: palette.ink }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6 }}>
                    <Stack alignItems="center" spacing={1.5}>
                      <CircularProgress size={28} />
                      <Typography variant="body2" sx={{ color: palette.slate }}>Loading imported BPLS queue...</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6 }}>
                    <Typography align="center" sx={{ color: palette.slate }}>No records matched the current filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => {
                  const meta = statusMeta[row.status] || statusMeta.verification;
                  return (
                    <TableRow key={row.recordKey || row.id} hover sx={{ "&:hover": { bgcolor: "#f8fbfd" }, "& td": { borderBottomColor: palette.line } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 46, height: 46, bgcolor: meta.tint, color: meta.text, fontWeight: 800 }}>
                            {row.initials}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={800} sx={{ color: palette.ink }}>{row.businessName}</Typography>
                            <Typography variant="body2" sx={{ color: palette.slate }}>{row.id}</Typography>
                            <Typography variant="caption" sx={{ color: palette.slate }}>{row.lineOfBusiness || "-"}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700} sx={{ color: palette.ink }}>{row.owner || "-"}</Typography>
                        <Typography variant="body2" sx={{ color: palette.slate }}>{row.barangay || "-"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.permitType || "N/A"} size="small" sx={{ bgcolor: palette.paper, color: palette.brandDeep, fontWeight: 700, borderRadius: 2 }} />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700} sx={{ color: palette.ink }}>{row.step || "-"}</Typography>
                        <Typography variant="body2" sx={{ color: palette.slate }}>{row.dueNote || "-"}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Number(row.completeness || 0)}
                          sx={{
                            height: 10,
                            borderRadius: 999,
                            bgcolor: "#e2e8f0",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 999,
                              bgcolor: Number(row.completeness || 0) === 100 ? palette.success : palette.brand,
                            },
                          }}
                        />
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75, color: palette.slate }}>
                          <Typography variant="caption">{Number(row.completeness || 0)}% complete</Typography>
                          <Typography variant="caption">{row.amount || "PHP 0.00"}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip icon={meta.icon} label={meta.label} size="small" sx={{ bgcolor: meta.tint, color: meta.text, fontWeight: 800, "& .MuiChip-icon": { color: meta.text } }} />
                        <Typography variant="caption" display="block" sx={{ mt: 0.75, color: palette.slate }}>
                          Filed {row.submittedAt || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(event) => { setMenuAnchor(event.currentTarget); setSelectedRow(row); }} size="small">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25]}
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { minWidth: 220, borderRadius: 3, border: `1px solid ${palette.line}`, boxShadow: "0 18px 44px rgba(15,23,42,0.12)" } }}
      >
        {selectedRow && (
          <MenuItem disabled sx={{ opacity: 1 }}>
            <Box>
              <Typography variant="body2" fontWeight={800} sx={{ color: palette.ink }}>{selectedRow.businessName}</Typography>
              <Typography variant="caption" sx={{ color: palette.slate }}>{selectedRow.id}</Typography>
            </Box>
          </MenuItem>
        )}
        {selectedRow && <Divider />}
        <MenuItem onClick={handleMenuClose}>View application details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Open assessment breakdown</MenuItem>
        <MenuItem onClick={handleMenuClose}>Post payment validation</MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>Print claim stub</MenuItem>
        <MenuItem onClick={handleMenuClose}>Download submitted documents</MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: palette.danger }}>Return for compliance</MenuItem>
      </Menu>

      {isModalOpen && <ModalBusiness onClose={() => setIsModalOpen(false)} />}
    </Box>
  );
};

export default BusinessRegistrationDashboard;

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import RemoveIcon from "@mui/icons-material/Remove";
import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import { useMaterialUIController } from "../../../../context";

const statuses = ["DRAFT", "PENDING", "APPROVED", "COMPLETED", "CANCELLED"];

const makeLineItem = () => ({
  description: "",
  quantity: "",
  unit: "",
  unit_cost: "",
  amount: "",
});

const baseForm = {
  document_no: "",
  reference_no: "",
  transaction_date: "",
  party_name: "",
  office_unit: "",
  responsibility_center: "",
  amount: "",
  status: "DRAFT",
  mode_of_payment: "",
  particulars: "",
  remarks: "",
  prepared_by: "",
  reviewed_by: "",
  approved_by: "",
  received_by: "",
  line_items: [makeLineItem()],
  metadata: {},
};

const statusChipColor = (status) => {
  switch (status) {
    case "APPROVED":
      return { bg: "#e0f2fe", color: "#075985" };
    case "COMPLETED":
      return { bg: "#dcfce7", color: "#166534" };
    case "CANCELLED":
      return { bg: "#fee2e2", color: "#991b1b" };
    case "PENDING":
      return { bg: "#fef3c7", color: "#92400e" };
    default:
      return { bg: "#e2e8f0", color: "#334155" };
  }
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

function DialogSection({ title, caption, children }) {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #dbe4ee",
        boxShadow: "0 10px 30px rgba(15,39,71,0.06)",
      }}
    >
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0f2747" }}>
          {title}
        </Typography>
        {caption ? (
          <Typography sx={{ mt: 0.5, color: "#64748b", fontSize: 13 }}>
            {caption}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Card>
  );
}

function RecordPreview({ config, record }) {
  const lineItems = Array.isArray(record?.line_items) ? record.line_items : [];
  const metadata = record?.metadata || {};

  return (
    <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #dbe4ee", backgroundColor: "#fffdf8" }}>
      <Typography align="center" sx={{ fontSize: 12, color: "#64748b" }}>
        Municipal Government of Zamboanguita
      </Typography>
      <Typography align="center" sx={{ fontSize: 26, fontWeight: 800, color: "#0f2747", mt: 0.5 }}>
        {config.title}
      </Typography>
      <Typography align="center" sx={{ color: "#64748b", mb: 2 }}>
        Print-ready record preview
      </Typography>

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <Typography variant="caption" color="text.secondary">{config.documentNoLabel}</Typography>
          <Typography sx={{ fontWeight: 700 }}>{record?.document_no || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="caption" color="text.secondary">{config.referenceNoLabel}</Typography>
          <Typography sx={{ fontWeight: 700 }}>{record?.reference_no || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="caption" color="text.secondary">{config.partyLabel}</Typography>
          <Typography sx={{ fontWeight: 700 }}>{record?.party_name || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="caption" color="text.secondary">{config.officeLabel}</Typography>
          <Typography sx={{ fontWeight: 700 }}>{record?.office_unit || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">Date</Typography>
          <Typography>{record?.transaction_date || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">Status</Typography>
          <Typography>{record?.status || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">Amount</Typography>
          <Typography sx={{ fontWeight: 700 }}>{formatMoney(record?.amount)}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">Particulars</Typography>
          <Typography>{record?.particulars || "-"}</Typography>
        </Grid>
        {config.extraFields.map((field) => (
          <Grid item xs={12} md={6} key={field.key}>
            <Typography variant="caption" color="text.secondary">{field.label}</Typography>
            <Typography>{metadata[field.key] || "-"}</Typography>
          </Grid>
        ))}
      </Grid>

      <TableContainer sx={{ mt: 2, border: "1px solid #dbe4ee", borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 800 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Unit Cost</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineItems.length ? (
              lineItems.map((item, index) => (
                <TableRow key={`${item.description}-${index}`}>
                  <TableCell>{item.description || "-"}</TableCell>
                  <TableCell>{item.quantity || "-"}</TableCell>
                  <TableCell>{item.unit || "-"}</TableCell>
                  <TableCell>{item.unit_cost || "-"}</TableCell>
                  <TableCell>{item.amount || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No line items</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default function ProcurementDocumentPage({ config }) {
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

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [form, setForm] = useState(baseForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, severity: "info", message: "" });

  const endpoint = `/procurement/${config.type}`;

  const loadData = useCallback(async (searchValue = search) => {
    setLoading(true);
    try {
      const [rowsResponse, summaryResponse] = await Promise.all([
        axiosInstance.get(endpoint, { params: { search: searchValue || undefined } }),
        axiosInstance.get(`${endpoint}/summary`),
      ]);
      setRows(Array.isArray(rowsResponse.data) ? rowsResponse.data : []);
      setSummary(summaryResponse.data || {});
    } catch (error) {
      console.error(`Failed to load ${config.type}:`, error);
      setSnackbar({ open: true, severity: "error", message: `Failed to load ${config.title} records.` });
    } finally {
      setLoading(false);
    }
  }, [config.title, endpoint, search, config.type]);

  useEffect(() => {
    loadData("");
  }, [loadData]);

  const resetForm = useCallback(() => {
    const metadata = Object.fromEntries(config.extraFields.map((field) => [field.key, ""]));
    setForm({ ...baseForm, metadata });
  }, [config.extraFields]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const openAdd = () => {
    resetForm();
    setDialogMode("add");
  };

  const openEdit = () => {
    if (!selectedRow) return;
    setForm({
      ...baseForm,
      ...selectedRow,
      transaction_date: selectedRow.transaction_date || "",
      line_items: Array.isArray(selectedRow.line_items) && selectedRow.line_items.length ? selectedRow.line_items : [makeLineItem()],
      metadata: { ...Object.fromEntries(config.extraFields.map((field) => [field.key, ""])), ...(selectedRow.metadata || {}) },
    });
    setDialogMode("edit");
    setAnchorEl(null);
  };

  const openView = () => {
    setDialogMode("view");
    setAnchorEl(null);
  };

  const openDelete = () => {
    setDeleteOpen(true);
    setAnchorEl(null);
  };

  const handleFormChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleMetadataChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      metadata: { ...(current.metadata || {}), [field]: event.target.value },
    }));
  };

  const handleLineItemChange = (index, field) => (event) => {
    setForm((current) => ({
      ...current,
      line_items: current.line_items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: event.target.value } : item
      ),
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        amount: form.amount === "" ? 0 : form.amount,
      };
      if (dialogMode === "add") {
        await axiosInstance.post(endpoint, payload);
      } else {
        await axiosInstance.put(`${endpoint}/${selectedRow.id}`, payload);
      }
      setDialogMode(null);
      await loadData();
      setSnackbar({ open: true, severity: "success", message: `${config.title} saved successfully.` });
    } catch (error) {
      console.error(`Failed to save ${config.type}:`, error);
      setSnackbar({ open: true, severity: "error", message: `Failed to save ${config.title}.` });
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    try {
      await axiosInstance.delete(`${endpoint}/${selectedRow.id}`);
      setDeleteOpen(false);
      setSelectedRow(null);
      await loadData();
      setSnackbar({ open: true, severity: "success", message: `${config.title} deleted successfully.` });
    } catch (error) {
      console.error(`Failed to delete ${config.type}:`, error);
      setSnackbar({ open: true, severity: "error", message: `Failed to delete ${config.title}.` });
    }
  };

  const handlePrint = () => {
    if (!selectedRow) return;
    const win = window.open("", "_blank", "width=1100,height=850");
    if (!win) return;
    win.document.write(`
      <html><head><title>${config.title}</title><style>
      body{font-family:Arial,sans-serif;padding:24px;color:#122033}
      h1{font-size:24px;margin-bottom:8px}
      .meta{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:16px}
      .box{border:1px solid #cad5e2;border-radius:8px;padding:10px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #cad5e2;padding:8px;font-size:12px;text-align:left}
      th{background:#f8fafc}
      </style></head><body>
      <h1>${config.title}</h1>
      <div class="meta">
        <div class="box"><strong>${config.documentNoLabel}:</strong> ${selectedRow.document_no || "-"}</div>
        <div class="box"><strong>${config.referenceNoLabel}:</strong> ${selectedRow.reference_no || "-"}</div>
        <div class="box"><strong>${config.partyLabel}:</strong> ${selectedRow.party_name || "-"}</div>
        <div class="box"><strong>${config.officeLabel}:</strong> ${selectedRow.office_unit || "-"}</div>
      </div>
      <div class="box"><strong>Particulars:</strong><br/>${selectedRow.particulars || "-"}</div>
      <table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Unit Cost</th><th>Amount</th></tr></thead><tbody>
      ${(selectedRow.line_items || []).map((item) => `<tr><td>${item.description || ""}</td><td>${item.quantity || ""}</td><td>${item.unit || ""}</td><td>${item.unit_cost || ""}</td><td>${item.amount || ""}</td></tr>`).join("")}
      </tbody></table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <Box sx={{ flexGrow: 1, padding: { xs: 2, md: 3 }, minHeight: "100vh", backgroundColor: uiColors.bg }}>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ py: 2 }} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={2} flexGrow={1} flexWrap="wrap">
            <TextField
              fullWidth
              variant="outlined"
              label={`Search ${config.title}`}
              placeholder={`${config.documentNoLabel}, ${config.partyLabel}, office, status`}
              value={pendingSearch}
              onChange={(event) => setPendingSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setSearch(pendingSearch);
                  loadData(pendingSearch);
                }
              }}
              sx={{ minWidth: { xs: "100%", md: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAdd}
              sx={{ px: 3.5, backgroundColor: uiColors.navy, color: "white", textTransform: "none", borderRadius: "10px", minWidth: "130px", height: "44px", "&:hover": { backgroundColor: uiColors.navyHover } }}
            >
              Add {config.shortTitle}
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={!selectedRow}
              sx={{ px: 3.5, backgroundColor: uiColors.steel, color: "white", textTransform: "none", borderRadius: "10px", minWidth: "130px", height: "44px", "&:hover": { backgroundColor: uiColors.steelHover } }}
            >
              Print
            </Button>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
          {config.description}
        </Typography>

        <Box display="flex" justifyContent="space-between" gap={3} sx={{ mt: 4, flexDirection: { xs: "column", sm: "row" } }}>
          {[
            { value: summary.total_records || 0, text: "Total Records", icon: <ReceiptLongIcon /> },
            { value: summary.draft_records || 0, text: "Draft", icon: <HourglassBottomIcon /> },
            { value: summary.approved_records || 0, text: "Approved", icon: <AssignmentTurnedInIcon /> },
            { value: formatMoney(summary.total_amount || 0), text: "Total Amount", icon: <TaskAltIcon /> },
          ].map(({ value, text, icon }, index) => (
            <Card key={text} sx={{ flex: 1, p: 3, borderRadius: "16px", background: uiColors.cardGradients[index % uiColors.cardGradients.length], color: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 0.5 }}>{text}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
                </Box>
                <Box sx={{ opacity: 0.22 }}>{icon}</Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 6, overflow: "hidden" }}>
        {loading && <LinearProgress />}
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {["Date", config.documentNoLabel, config.partyLabel, config.officeLabel, "Amount", "Status", "Action"].map((header) => (
                <TableCell key={header} sx={{ whiteSpace: "nowrap", fontWeight: 700, textAlign: "center", textTransform: "uppercase", letterSpacing: "1px", fontSize: 11.5, background: "#f7f9fc", color: "#0f2747", borderBottom: "2px solid #d6a12b" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              const statusStyle = statusChipColor(row.status);
              return (
                <TableRow key={row.id} hover onClick={() => setSelectedRow(row)} sx={{ cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } }}>
                  <TableCell align="center">{row.transaction_date || "-"}</TableCell>
                  <TableCell align="center">{row.document_no || "-"}</TableCell>
                  <TableCell align="center">{row.party_name || "-"}</TableCell>
                  <TableCell align="center">{row.office_unit || "-"}</TableCell>
                  <TableCell align="center">{formatMoney(row.amount)}</TableCell>
                  <TableCell align="center">
                    <Chip label={row.status} size="small" sx={{ fontWeight: 700, bgcolor: statusStyle.bg, color: statusStyle.color }} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(event) => { event.stopPropagation(); setAnchorEl(event.currentTarget); setSelectedRow(row); }}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="flex-end" m={2}>
          <TablePagination
            rowsPerPageOptions={[10, 15, 20, 30, 50]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Box>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={openView}><VisibilityIcon fontSize="small" sx={{ mr: 1 }} />View</MenuItem>
        <MenuItem onClick={openEdit}><EditIcon fontSize="small" sx={{ mr: 1 }} />Update</MenuItem>
        <MenuItem onClick={() => { handlePrint(); setAnchorEl(null); }}><PrintIcon fontSize="small" sx={{ mr: 1 }} />Print</MenuItem>
        <MenuItem onClick={openDelete} sx={{ color: "#b91c1c" }}><DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />Delete</MenuItem>
      </Menu>

      <Dialog
        open={dialogMode === "add" || dialogMode === "edit"}
        onClose={() => setDialogMode(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2.5,
            color: "white",
            background: "linear-gradient(135deg, #0f2747 0%, #214a74 100%)",
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.78 }}>
                {dialogMode === "add" ? "Create Record" : "Update Record"}
              </Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 900 }}>
                {dialogMode === "add" ? `Add ${config.title}` : `Update ${config.title}`}
              </Typography>
              <Typography sx={{ mt: 0.5, color: "rgba(255,255,255,0.78)", maxWidth: 720 }}>
                Complete the document details, approvals, and line items in one pass.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip label={form.status || "DRAFT"} sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "white", fontWeight: 700 }} />
              <Chip label={form.document_no || "New Record"} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "white", fontWeight: 700 }} />
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 3, py: 3, backgroundColor: "#f6f8fb" }}>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, borderRadius: 3, bgcolor: "#eaf1fb", border: "1px solid #dbe4ee", boxShadow: "none" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "#64748b" }}>
                    STATUS
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 900, color: "#0f2747" }}>
                    {form.status || "DRAFT"}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, borderRadius: 3, bgcolor: "#fdf5df", border: "1px solid #ead7a7", boxShadow: "none" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "#64748b" }}>
                    AMOUNT
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 900, color: "#0f2747" }}>
                    {formatMoney(form.amount || 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, borderRadius: 3, bgcolor: "#edf7f5", border: "1px solid #d4ebe3", boxShadow: "none" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "#64748b" }}>
                    LINE ITEMS
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: 26, fontWeight: 900, color: "#0f2747" }}>
                    {form.line_items.length}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <DialogSection title="Document Identity" caption="Primary references for the voucher record.">
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={4}><TextField label={config.documentNoLabel} fullWidth value={form.document_no} onChange={handleFormChange("document_no")} /></Grid>
                <Grid item xs={12} md={4}><TextField label={config.referenceNoLabel} fullWidth value={form.reference_no} onChange={handleFormChange("reference_no")} /></Grid>
                <Grid item xs={12} md={4}><TextField label="Date" type="date" fullWidth value={form.transaction_date} onChange={handleFormChange("transaction_date")} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} md={6}><TextField label={config.partyLabel} fullWidth value={form.party_name} onChange={handleFormChange("party_name")} /></Grid>
                <Grid item xs={12} md={6}><TextField label={config.officeLabel} fullWidth value={form.office_unit} onChange={handleFormChange("office_unit")} /></Grid>
                <Grid item xs={12} md={4}><TextField label="Responsibility Center" fullWidth value={form.responsibility_center} onChange={handleFormChange("responsibility_center")} /></Grid>
                <Grid item xs={12} md={4}><TextField label="Amount" fullWidth value={form.amount} onChange={handleFormChange("amount")} /></Grid>
                <Grid item xs={12} md={4}><TextField label="Status" select fullWidth value={form.status} onChange={handleFormChange("status")}>{statuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField></Grid>
              </Grid>
            </DialogSection>

            <DialogSection title="Processing and Approvals" caption="Internal routing, mode of payment, and signatories.">
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={4}><TextField label="Mode of Payment" fullWidth value={form.mode_of_payment} onChange={handleFormChange("mode_of_payment")} /></Grid>
                <Grid item xs={12} md={4}><TextField label="Prepared By" fullWidth value={form.prepared_by} onChange={handleFormChange("prepared_by")} /></Grid>
                <Grid item xs={12} md={4}><TextField label="Reviewed By" fullWidth value={form.reviewed_by} onChange={handleFormChange("reviewed_by")} /></Grid>
                <Grid item xs={12} md={6}><TextField label="Approved By" fullWidth value={form.approved_by} onChange={handleFormChange("approved_by")} /></Grid>
                <Grid item xs={12} md={6}><TextField label="Received By" fullWidth value={form.received_by} onChange={handleFormChange("received_by")} /></Grid>
                {config.extraFields.map((field) => (
                  <Grid item xs={12} md={6} key={field.key}>
                    <TextField label={field.label} fullWidth value={form.metadata?.[field.key] || ""} onChange={handleMetadataChange(field.key)} />
                  </Grid>
                ))}
              </Grid>
            </DialogSection>

            <DialogSection title="Narrative" caption="Document context, purpose, and internal notes.">
              <Grid container spacing={1.5}>
                <Grid item xs={12}><TextField label="Particulars" multiline minRows={3} fullWidth value={form.particulars} onChange={handleFormChange("particulars")} /></Grid>
                <Grid item xs={12}><TextField label="Remarks" multiline minRows={2} fullWidth value={form.remarks} onChange={handleFormChange("remarks")} /></Grid>
              </Grid>
            </DialogSection>

            <DialogSection title="Line Items" caption="Break down the voucher into itemized entries.">
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 1.5 }}>
                <Typography sx={{ color: "#64748b" }}>
                  Add each item with quantity, unit cost, and final amount.
                </Typography>
                <Button startIcon={<AddIcon />} onClick={() => setForm((current) => ({ ...current, line_items: [...current.line_items, makeLineItem()] }))} sx={{ textTransform: "none", fontWeight: 700 }}>
                  Add Line
                </Button>
              </Stack>
              <Stack spacing={1.25}>
                {form.line_items.map((item, index) => (
                  <Paper key={`line-item-${index}`} variant="outlined" sx={{ p: 1.5, borderRadius: 3, borderColor: "#dbe4ee", backgroundColor: "#fcfdff" }}>
                    <Grid container spacing={1.25}>
                      <Grid item xs={12} md={4}><TextField label="Description" fullWidth value={item.description} onChange={handleLineItemChange(index, "description")} /></Grid>
                      <Grid item xs={12} md={2}><TextField label="Qty" fullWidth value={item.quantity} onChange={handleLineItemChange(index, "quantity")} /></Grid>
                      <Grid item xs={12} md={2}><TextField label="Unit" fullWidth value={item.unit} onChange={handleLineItemChange(index, "unit")} /></Grid>
                      <Grid item xs={12} md={2}><TextField label="Unit Cost" fullWidth value={item.unit_cost} onChange={handleLineItemChange(index, "unit_cost")} /></Grid>
                      <Grid item xs={10} md={1.5}><TextField label="Amount" fullWidth value={item.amount} onChange={handleLineItemChange(index, "amount")} /></Grid>
                      <Grid item xs={2} md={0.5}>
                        <IconButton
                          onClick={() => setForm((current) => ({ ...current, line_items: current.line_items.length === 1 ? current.line_items : current.line_items.filter((_, itemIndex) => itemIndex !== index) }))}
                          sx={{ mt: 0.5, border: "1px solid #dbe4ee", bgcolor: "#fff3f1" }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            </DialogSection>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMode(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogMode === "view"} onClose={() => setDialogMode(null)} maxWidth="lg" fullWidth>
        <DialogTitle>{config.title} Preview</DialogTitle>
        <DialogContent dividers>
          <RecordPreview config={config} record={selectedRow} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogMode(null)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {config.title}</DialogTitle>
        <DialogContent>Are you sure you want to delete this record?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

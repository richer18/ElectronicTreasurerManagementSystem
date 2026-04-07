import AssessmentIcon from "@mui/icons-material/Assessment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { BiSolidReport } from "react-icons/bi";
import { IoMdAdd, IoMdDownload } from "react-icons/io";
import { IoToday } from "react-icons/io5";
import { MdSummarize } from "react-icons/md";
import { useMaterialUIController } from "../../../context";
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

const rows = [
  { id: 1, date: "Apr 1, 2026", taxpayer: "Sample Consumer", receiptNo: "WW-0001", billId: "BILL-1001", amount: 450.0 },
  { id: 2, date: "Apr 2, 2026", taxpayer: "Demo Account", receiptNo: "WW-0002", billId: "BILL-1002", amount: 620.0 },
  { id: 3, date: "Apr 3, 2026", taxpayer: "Placeholder Name", receiptNo: "WW-0003", billId: "BILL-1003", amount: 300.0 },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");

  const [openEntryDialog, setOpenEntryDialog] = useState(false);
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [openTicketDialog, setOpenTicketDialog] = useState(false);

  const filteredRows = useMemo(() => {
    if (!pendingSearchQuery.trim()) return rows;
    const query = pendingSearchQuery.toLowerCase();
    return rows.filter(
      (row) =>
        row.taxpayer.toLowerCase().includes(query) ||
        row.receiptNo.toLowerCase().includes(query) ||
        row.billId.toLowerCase().includes(query)
    );
  }, [pendingSearchQuery]);

  const handleApplyFilters = () => {
    setSearchQuery(pendingSearchQuery);
  };

  const summaryCards = [
    {
      text: "Water Billing",
      value: "Pending Setup",
      icon: <MdSummarize size={30} />,
      gradient: uiColors.cardGradients[0],
    },
    {
      text: "Tickets",
      value: "Pending Setup",
      icon: <ReceiptIcon fontSize="large" />,
      gradient: uiColors.cardGradients[1],
    },
    {
      text: "Water Cards",
      value: "Pending Setup",
      icon: <AssessmentIcon fontSize="large" />,
      gradient: uiColors.cardGradients[2],
    },
    {
      text: "Exports",
      value: "Pending Setup",
      icon: <IoMdDownload size={30} />,
      gradient: uiColors.cardGradients[3],
    },
  ];

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
          Manage billing, account registration, entries, and ticket workflows.
        </Typography>

        <Box display="flex" alignItems="center" gap={2} sx={{ py: 2 }} flexWrap="wrap">
          {showFilters && (
            <Box display="flex" alignItems="center" gap={2} flexGrow={1} flexWrap="wrap">
              <TextField
                fullWidth
                variant="outlined"
                label="Search Records"
                placeholder="Name, receipt no., bill id"
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
                  onChange={(e, value) => setMonth(value?.value || null)}
                />

                <Autocomplete
                  disablePortal
                  options={years}
                  sx={{ width: 150 }}
                  value={years.find((item) => item.value === year) || null}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Year" variant="outlined" />
                  )}
                  onChange={(e, value) => setYear(value?.value || null)}
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
                >
                  Settings
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={2} sx={{ py: 1 }} flexWrap="wrap">
          <Box display="flex" gap={2} flexGrow={1} flexWrap="wrap">
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
                  },
                  textTransform: "none",
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: "10px",
                  minWidth: "130px",
                  height: "44px",
                }}
                onClick={() => setOpenEntryDialog(true)}
              >
                New Entry
              </Button>
            </Tooltip>

            <Tooltip title="Register New Account" arrow>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon fontSize="small" />}
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
                }}
                onClick={() => setOpenRegisterDialog(true)}
              >
                Register
              </Button>
            </Tooltip>

            <Tooltip title="Manage Tickets" arrow>
              <Button
                variant="contained"
                startIcon={<ReceiptIcon fontSize="small" />}
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
                }}
                onClick={() => setOpenTicketDialog(true)}
              >
                Ticket
              </Button>
            </Tooltip>

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
                }}
              >
                Daily Report
              </Button>
            </Tooltip>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Tooltip title="Water Billing Reports" arrow>
              <Button
                variant="contained"
                startIcon={<MdSummarize size={18} />}
                sx={{
                  backgroundColor: uiColors.teal,
                  color: "white",
                  textTransform: "none",
                  "&:hover": { backgroundColor: uiColors.tealHover },
                }}
              >
                Water Billing
              </Button>
            </Tooltip>

            <Tooltip title="Water Card Summary" arrow>
              <Button
                variant="contained"
                startIcon={<AssessmentIcon fontSize="small" />}
                sx={{
                  backgroundColor: uiColors.amber,
                  color: "white",
                  textTransform: "none",
                  "&:hover": { backgroundColor: uiColors.amberHover },
                }}
              >
                Water Card
              </Button>
            </Tooltip>

            <Tooltip title="Ticket Status Reports" arrow>
              <Button
                variant="contained"
                startIcon={<BiSolidReport size={18} />}
                sx={{
                  backgroundColor: uiColors.red,
                  color: "white",
                  textTransform: "none",
                  "&:hover": { backgroundColor: uiColors.redHover },
                }}
              >
                Ticket Status
              </Button>
            </Tooltip>

            <Tooltip title="Export Data" arrow>
              <Button
                variant="contained"
                startIcon={<IoMdDownload size={18} />}
                sx={{
                  backgroundColor: uiColors.steel,
                  color: "white",
                  textTransform: "none",
                  "&:hover": { backgroundColor: uiColors.steelHover },
                }}
              >
                Download
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          gap={3}
          sx={{ mt: 4, flexDirection: { xs: "column", sm: "row" } }}
        >
          {summaryCards.map(({ text, value, icon, gradient }) => (
            <Card
              key={text}
              sx={{
                flex: 1,
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
        <Table sx={{ minWidth: 650 }} size="small" aria-label="waterworks table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Name of Taxpayer</StyledTableCell>
              <StyledTableCell>Receipt No</StyledTableCell>
              <StyledTableCell>Bill ID</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell align="center">{row.date}</TableCell>
                <TableCell align="center">{row.taxpayer}</TableCell>
                <TableCell align="center">{row.receiptNo}</TableCell>
                <TableCell align="center">{row.billId}</TableCell>
                <TableCell align="center">
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                  }).format(row.amount)}
                </TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>
                  No Waterworks records matched the current search.
                  {searchQuery ? ` Search term: ${searchQuery}` : ""}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EntryPopupDialog open={openEntryDialog} handleClose={() => setOpenEntryDialog(false)} />
      <RegisterPopupDialog
        open={openRegisterDialog}
        handleClose={() => setOpenRegisterDialog(false)}
      />
      <TicketPopupDialog open={openTicketDialog} handleClose={() => setOpenTicketDialog(false)} />
    </Box>
  );
}

export default Index;

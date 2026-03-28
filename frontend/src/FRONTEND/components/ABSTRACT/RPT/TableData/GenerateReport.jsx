import {
  CalendarMonthOutlined,
  CurrencyExchangeOutlined,
  DescriptionOutlined,
  PersonOutlined,
  ReceiptLongOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import axiosInstance from "../../../../../api/axiosInstance";
import { useMaterialUIController } from "../../../../../context";

const getTodayDate = () => new Date().toISOString().split("T")[0];

function GenerateReport({ open, onClose }) {
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
      bg: darkMode ? "#0f1117" : "#f5f7fb",
      headerStart: darkMode ? "#22314a" : "#1f3a5f",
      headerEnd: darkMode ? "#2f4566" : "#3c5d86",
    }),
    [darkMode]
  );
  const inputSx = {
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
  };
  const [status, setStatus] = useState("idle");
  const [dateType, setDateType] = useState("dateRange");
  const [dateFrom, setDateFrom] = useState(getTodayDate);
  const [dateTo, setDateTo] = useState(getTodayDate);
  const reportType = "real_property_tax_data";
  const [cashier, setCashier] = useState("");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orFrom, setOrFrom] = useState("");
  const [orTo, setOrTo] = useState("");

  // ✅ Corrected Cashier Mapping
  const cashierOptionsByReport = {
    real_property_tax_data: ["angelique", "flora", "ricardo"],
  };

  // Reset page when data changes
  useEffect(() => {
    setPage(0);
  }, [data]);

  useEffect(() => {
    if (open) {
      const today = getTodayDate();
      setStatus("idle");
      setDateType("dateRange");
      setDateFrom(today);
      setDateTo(today);
      setCashier("");
      setOrFrom("");
      setOrTo("");
      setData([]);
    }
  }, [open]);

  // Debug function to check data format
  useEffect(() => {
    if (data.length > 0) {
      console.log("Sample row:", data[0]);
      console.log("Date value:", data[0].date);
    }
  }, [data]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    try {
      // Make sure we're working with a string
      const dateString = String(dateValue);

      // Handle ISO string format (YYYY-MM-DD)
      const parts = dateString.split("-");
      if (parts.length !== 3) {
        return dateValue; // Return original if not in expected format
      }

      const [year, month, day] = parts;

      // Convert month number to month name
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const monthIndex = parseInt(month, 10) - 1;
      if (isNaN(monthIndex) || monthIndex < 0 || monthIndex >= 12) {
        return dateValue; // Return original if month is invalid
      }

      const monthName = monthNames[monthIndex];

      // Remove leading zero from day if present
      const dayFormatted = day.startsWith("0") ? day.substring(1) : day;

      return `${monthName} ${dayFormatted}, ${year}`;
    } catch (error) {
      console.error("Date formatting error:", dateValue, error);
      return dateValue || "N/A"; // Return original value or N/A
    }
  };

  // Format currency values
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleClose = () => {
    setStatus("idle");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    let payloadDateFrom = dateFrom;
    let payloadDateTo = dateTo;

    if (dateType === "monthYear") {
      const [year, month] = dateFrom.split("-");
      payloadDateFrom = `${year}-${month}`;
      payloadDateTo = year;
    }

    const payload = {
      dateType,
      dateFrom: payloadDateFrom,
      dateTo: payloadDateTo,
      reportType,
      cashier,
      orFrom: orFrom || null,
      orTo: orTo || null,
    };

    try {
      const response = await axiosInstance.post("generate-report", payload);

      const result = response.data;
      console.log("API Response:", result);

      if (result.data && result.data.length > 0) {
        console.log("First row data:", result.data[0]);
        setData(result.data);
      } else {
        setData([]);
      }

      setStatus("success");
    } catch (error) {
      console.error("Error generating report:", error);
      setStatus("error");
      setData([]);
    }
  };

  const handleDownload = () => {
    if (!data.length) return;

    const header = Object.keys(data[0]);
    const rows = data.map((row) =>
      header
        .map(
          (field) => `"${(row[field] ?? "").toString().replace(/"/g, '""')}"`
        )
        .join(",")
    );

    const csvContent = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rpt-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate total amount from data
  const totalAmount = data.reduce(
    (sum, row) => sum + (Number(row.total) || 0),
    0
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 0,
            minHeight: "600px",
            overflow: "hidden",
            backgroundColor: (theme) => theme.palette.background.paper,
            border: "1px solid #d6a12b",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${uiColors.headerStart}, ${uiColors.headerEnd})`,
          color: "white",
          py: 2.5,
          px: 3,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <DescriptionOutlined sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h5" fontWeight="500">
              Collector Collection Report
            </Typography>
          </Box>
          <Button
            onClick={handleClose}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              color: "#f8e1a6",
              borderColor: "#d6a12b",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                borderColor: "#f2cf74",
                backgroundColor: "rgba(214, 161, 43, 0.12)",
              },
            }}
          >
            Close
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3, px: 3, backgroundColor: uiColors.bg }}>
        <form onSubmit={handleSubmit}>
          <Row className="mt-3">
            <Col>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarMonthOutlined sx={{ mr: 1, color: uiColors.navy }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Collection Period
                </Typography>
              </Box>
              <Divider />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Filter Type</InputLabel>
                <Select
                  value={dateType}
                  onChange={(e) => setDateType(e.target.value)}
                  label="Filter Type"
                  sx={inputSx}
                >
                  <MenuItem value="dateRange">Daily or Date Range</MenuItem>
                  <MenuItem value="monthYear">Month & Year</MenuItem>
                </Select>
              </FormControl>
            </Col>
          </Row>

          <Row className="mt-3">
            {dateType === "dateRange" && (
              <>
                <Col md={6} className="mb-3">
                  <TextField
                    fullWidth
                    label="From Collection Date"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    size="small"
                    variant="outlined"
                    InputLabelProps={{
                      // Correct prop for MUI TextField
                      shrink: true,
                    }}
                    sx={{ mb: 2, ...inputSx }} // Optional spacing
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <TextField
                    fullWidth
                    label="To Collection Date"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    size="small"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ mb: 2, ...inputSx }}
                  />
                </Col>
              </>
            )}
          </Row>

          {/* Month Year Inputs */}
          {dateType === "monthYear" && (
            <Row>
              <Col>
                <TextField
                  fullWidth
                  label="Collection Month"
                  type="month"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  sx={inputSx}
                />
              </Col>
              <Col>
                <TextField
                  fullWidth
                  label="Collection Year"
                  type="number"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={inputSx}
                />
              </Col>
            </Row>
          )}

          <Row>
            <Col>
              <Box display="flex" alignItems="center" mb={1}>
                <ReceiptLongOutlined sx={{ mr: 1, color: uiColors.navy }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Collector Details
                </Typography>
              </Box>
              <Divider />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={12}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Collector</InputLabel>
                <Select
                  value={cashier}
                  onChange={(e) => setCashier(e.target.value)}
                  label="Collector"
                  startAdornment={<PersonOutlined sx={{ mr: 1, ml: -0.5 }} />}
                  disabled={!reportType} // Disable until reportType is selected
                  sx={inputSx}
                >
                  {cashierOptionsByReport[reportType]?.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <Box display="flex" alignItems="center" mb={1} mt={2}>
                <SearchOutlined sx={{ mr: 1, color: uiColors.navy }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Receipt Filters
                </Typography>
              </Box>
              <Divider />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <TextField
                fullWidth
                label="Receipt No. From"
                type="number"
                value={orFrom}
                onChange={(e) => setOrFrom(e.target.value)}
                size="small"
                variant="outlined"
                sx={inputSx}
              />
            </Col>
            <Col>
              <TextField
                fullWidth
                label="Receipt No. To"
                type="number"
                value={orTo}
                onChange={(e) => setOrTo(e.target.value)}
                size="small"
                variant="outlined"
                sx={inputSx}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={status === "loading"}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  backgroundColor: uiColors.navy,
                  "&:hover": {
                    backgroundColor: uiColors.navyHover,
                  },
                }}
                startIcon={
                  status === "loading" ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SearchOutlined />
                  )
                }
              >
                {status === "loading"
                  ? "Checking Collection..."
                  : "Check Collection"}
              </Button>
            </Col>
          </Row>

          <Row>
            {status === "error" && (
              <Col>
                <Alert severity="error" sx={{ mt: 2 }}>
                  Failed to load the collector collection report. Please try again.
                </Alert>
              </Col>
            )}
          </Row>

          <Row>
            {data.length === 0 && status === "success" && (
              <Col>
                <Alert severity="info" sx={{ mt: 2 }}>
                  No receipts found for the selected collector and date filter.
                </Alert>
              </Col>
            )}
          </Row>

          <Row>
            <Col>
              {data.length > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    width: "100%",
                    mt: 3,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${uiColors.headerStart}, ${uiColors.headerEnd})`,
                      color: "#fff",
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">
                      Receipt Results ({data.length} records)
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CurrencyExchangeOutlined sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">
                        Total Collection: {formatCurrency(totalAmount)}
                      </Typography>
                    </Box>
                  </Box>
                  <TableContainer sx={{ maxHeight: 350 }}>
                    <Table stickyHeader aria-label="results table">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              background: `linear-gradient(135deg, ${uiColors.headerStart}, ${uiColors.headerEnd})`,
                              color: "#fff",
                            }}
                          >
                            Date
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              background: `linear-gradient(135deg, ${uiColors.headerStart}, ${uiColors.headerEnd})`,
                              color: "#fff",
                            }}
                          >
                            Collector
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              background: `linear-gradient(135deg, ${uiColors.headerStart}, ${uiColors.headerEnd})`,
                              color: "#fff",
                            }}
                          >
                            Receipt Type
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              background: `linear-gradient(135deg, ${uiColors.headerStart}, ${uiColors.headerEnd})`,
                              color: "#fff",
                            }}
                          >
                            Receipt No.
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              background: `linear-gradient(135deg, ${uiColors.headerStart}, ${uiColors.headerEnd})`,
                              color: "#fff",
                            }}
                          >
                            Total
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((row) => (
                            <TableRow
                              key={row.or_number}
                              hover
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell>{formatDate(row.date)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={row.cashier}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: uiColors.steel,
                                    color: uiColors.steel,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {row.cashier === "AMABELLA" &&
                                row.report_type === "GF"
                                  ? "Cash Tickets"
                                  : row.report_type === "GF"
                                    ? "General Fund"
                                    : row.report_type === "TF"
                                      ? "Trust Fund"
                                      : row.report_type}
                              </TableCell>
                              <TableCell>{row.or_number}</TableCell>
                              <TableCell sx={{ fontWeight: "medium" }}>
                                {formatCurrency(row.total)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleDownload}
                    sx={{
                      mt: 2,
                      py: 1.25,
                      borderRadius: 2,
                      textTransform: "none",
                      borderColor: uiColors.navy,
                      color: uiColors.navy,
                      "&:hover": {
                        borderColor: uiColors.navyHover,
                        backgroundColor: "rgba(15, 39, 71, 0.08)",
                      },
                    }}
                    startIcon={<DownloadIcon />}
                  >
                    Download CSV
                  </Button>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: (theme) => `1px solid ${theme.palette.divider}` }}
                  />
                </Paper>
              )}
            </Col>
          </Row>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Prop types validation
GenerateReport.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default GenerateReport;

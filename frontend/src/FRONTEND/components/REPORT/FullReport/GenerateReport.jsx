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
import IconButton from "@mui/material/IconButton";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import axiosInstance from "../../../../api/axiosInstance";

function GenerateReport({ open, onClose }) {
  const [status, setStatus] = useState("idle");
  const [dateType, setDateType] = useState("dateRange");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState("51");
  const [cashier, setCashier] = useState("");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orFrom, setOrFrom] = useState("");
  const [orTo, setOrTo] = useState("");

  // ✅ Corrected Cashier Mapping
  const cashierOptionsByReport = {
    CTCI: ["flora", "angelique", "agnes", "ricardo"],
    RPT: [
      "RICARDO ENOPIA",
      "IRIS RAFALES",
      "FLORA MY FERRER",
    ],
    51: ["FLORA MY", "IRIS", "AGNES", "RICARDO", "AMABELLA"],
  };

  // Reset page when data changes
  useEffect(() => {
    setPage(0);
  }, [data]);

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
    link.setAttribute("download", `receipt-lookup-${Date.now()}.csv`);
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
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 2.5,
          px: 3,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <DescriptionOutlined sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h5" fontWeight="500">
              Receipt Lookup
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3, px: 3 }}>
        <form onSubmit={handleSubmit}>
          <Row className="mt-3">
            <Col>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarMonthOutlined color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Date Selection
                </Typography>
              </Box>
              <Divider />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Date Selection Type</InputLabel>
                <Select
                  value={dateType}
                  onChange={(e) => setDateType(e.target.value)}
                  label="Date Selection Type"
                >
                  <MenuItem value="dateRange">Date Range</MenuItem>
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
                    label="From Date"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    size="small"
                    variant="outlined"
                    InputLabelProps={{
                      // Correct prop for MUI TextField
                      shrink: true,
                    }}
                    sx={{ mb: 2 }} // Optional spacing
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    size="small"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ mb: 2 }}
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
                  label="Month"
                  type="month"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                />
              </Col>
              <Col>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Col>
            </Row>
          )}

          <Row>
            <Col>
              <Box display="flex" alignItems="center" mb={1}>
                <ReceiptLongOutlined color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Report Details
                </Typography>
              </Box>
              <Divider />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="CTCI">Cedula</MenuItem>
                  <MenuItem value="RPT">RPT</MenuItem>
                  <MenuItem value="51">GF AND TF</MenuItem>
                </Select>
              </FormControl>
            </Col>
            <Col>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Cashier</InputLabel>
                <Select
                  value={cashier}
                  onChange={(e) => setCashier(e.target.value)}
                  label="Cashier"
                  startAdornment={<PersonOutlined sx={{ mr: 1, ml: -0.5 }} />}
                  disabled={!reportType} // Disable until reportType is selected
                >
                  {cashierOptionsByReport[reportType]?.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <Box display="flex" alignItems="center" mb={1} mt={2}>
                <SearchOutlined color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Optional Filters
                </Typography>
              </Box>
              <Divider />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <TextField
                fullWidth
                label="OR From"
                type="number"
                value={orFrom}
                onChange={(e) => setOrFrom(e.target.value)}
                size="small"
                variant="outlined"
              />
            </Col>
            <Col>
              <TextField
                fullWidth
                label="OR To"
                type="number"
                value={orTo}
                onChange={(e) => setOrTo(e.target.value)}
                size="small"
                variant="outlined"
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={status === "loading"}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
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
                  ? "Running Lookup..."
                  : "Run Lookup"}
              </Button>
            </Col>
          </Row>

          <Row>
            {status === "error" && (
              <Col>
                <Alert severity="error" sx={{ mt: 2 }}>
                  Failed to generate report. Please try again.
                </Alert>
              </Col>
            )}
          </Row>

          <Row>
            {data.length === 0 && status === "success" && (
              <Col>
                <Alert severity="info" sx={{ mt: 2 }}>
                  No records found matching your criteria.
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
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">
                      Results ({data.length} records)
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CurrencyExchangeOutlined sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">
                        Total: {formatCurrency(totalAmount)}
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
                              bgcolor: "grey.100",
                            }}
                          >
                            Date
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: "grey.100",
                            }}
                          >
                            Cashier
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: "grey.100",
                            }}
                          >
                            Type of Report
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: "grey.100",
                            }}
                          >
                            OR#
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              bgcolor: "grey.100",
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
                                  color="primary"
                                  variant="outlined"
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
                    color="primary"
                    fullWidth
                    onClick={handleDownload}
                    sx={{
                      mt: 2,
                      py: 1.25,
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                    startIcon={<DownloadIcon />}
                  >
                    Download Results CSV
                  </Button>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
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

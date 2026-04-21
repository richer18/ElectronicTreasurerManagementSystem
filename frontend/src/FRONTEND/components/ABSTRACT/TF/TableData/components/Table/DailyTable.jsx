import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintIcon from "@mui/icons-material/Print";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import { format, parseISO } from "date-fns";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import axiosInstance from "../../../../../../../api/axiosInstance";
import TrustFunds from "../../../../../../../components/MD-Components/FillupForm/AbstractTF";
import PopupDialog from "../../../../../../../components/MD-Components/Popup/PopupDialogTF_FORM";

const StyledTableCell = styled(TableCell)(() => ({
  whiteSpace: "nowrap",
  fontWeight: 700,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "0.9rem",
  background: "#f7f9fc",
  color: "#0f2747",
  borderBottom: "2px solid #d6a12b",
}));

const SubHeaderCell = styled(StyledTableCell)(({ theme }) => ({
  fontSize: "0.75rem",
  padding: theme.spacing(0.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
  },
  "&:nth-of-type(even)": {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
}));

const CenteredTableCell = styled(TableCell)({
  textAlign: "center",
  whiteSpace: "nowrap",
  fontSize: "0.875rem",
});

const formatDate = (dateInput) => {
  if (!dateInput) return "Invalid Date";
  const date =
    typeof dateInput === "string"
      ? parseISO(dateInput)
      : dateInput instanceof Date
        ? dateInput
        : null;

  if (!date || Number.isNaN(date.getTime())) return "Invalid Date";
  return format(date, "MMMM d, yyyy");
};

const escapeCsvValue = (value) => {
  const stringValue = value == null ? "" : String(value);
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
};

const downloadCsvFile = (filename, headers, rows) => {
  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

const collectorCards = [
  { key: "ricardo", label: "Ricardo Enopia", aliases: ["ricardo"] },
  { key: "flora", label: "Flora My Ferrer", aliases: ["flora"] },
  { key: "iris", label: "Iris Rafales", aliases: ["iris", "angelique"] },
  { key: "agnes", label: "Agnes Ello", aliases: ["agnes"] },
  { key: "amabella", label: "Amabella", aliases: ["amabella"] },
];

function DailyTablev2({ data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [currentComment, setCurrentComment] = useState("");
  const [dialogContent, setDialogContent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      const receiptNo = parseInt(entry.RECEIPT_NO, 10);
      const from = searchFrom ? parseInt(searchFrom, 10) : null;
      const to = searchTo ? parseInt(searchTo, 10) : null;

      if (from !== null && to !== null) return receiptNo >= from && receiptNo <= to;
      if (from !== null) return receiptNo === from;
      if (to !== null) return receiptNo === to;
      return true;
    });
  }, [data, searchFrom, searchTo]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalCollectionByCashier = useMemo(() => {
    const totals = {
      ricardo: 0,
      flora: 0,
      iris: 0,
      agnes: 0,
      amabella: 0,
    };

    filteredData.forEach((row) => {
      const cashier = String(row.CASHIER || "").trim().toLowerCase();
      const matchedCard = collectorCards.find(({ aliases }) =>
        aliases.includes(cashier)
      );

      if (matchedCard) totals[matchedCard.key] += parseFloat(row.TOTAL) || 0;
    });

    return totals;
  }, [filteredData]);

  const totalSum = useMemo(
    () => filteredData.reduce((acc, row) => acc + (parseFloat(row.TOTAL) || 0), 0),
    [filteredData]
  );

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  const handleEditClick = () => {
    if (!currentRow) return;
    setDialogContent(<TrustFunds data={currentRow} mode="edit" />);
    setIsDialogOpen(true);
    handleMenuClose();
  };

  const handleCommentClick = () => {
    setCurrentComment(currentRow?.COMMENTS || "");
    setOpenCommentDialog(true);
    handleMenuClose();
  };

  const handleSaveComment = async () => {
    if (!currentRow) {
      alert("No row selected!");
      return;
    }

    try {
      const formattedDate = format(new Date(currentRow.DATE), "yyyy-MM-dd");
      const dateComment = format(new Date(), "yyyy-MM-dd HH:mm:ss");

      await axiosInstance.post("updateTFComment", {
        RECEIPT_NO: currentRow.RECEIPT_NO,
        COMMENTS: currentComment,
      });

      await axiosInstance.post("insertTFComment", {
        date: formattedDate,
        receipt_no: currentRow.RECEIPT_NO,
        date_comment: dateComment,
        name_client: currentRow.NAME,
        description: currentComment,
        user: "admin",
      });

      setOpenCommentDialog(false);
    } catch (error) {
      console.error("Error saving TF comment:", error);
      alert("Failed to save comment. Please try again.");
    }
  };

  const handleDownload = () => {
    const headers = [
      "Date",
      "OR Number",
      "Name",
      "Building Permit Fee",
      "National 5%",
      "Local 80%",
      "Trust 15%",
      "Electrical Fee",
      "Zoning Fee",
      "Livestock Dev Fund",
      "Livestock Local 80%",
      "National 20%",
      "Diving Fee",
      "Local 40%",
      "Barangay 30%",
      "Fishers 30%",
      "Total",
      "Cashier",
      "Comments",
    ];

    const rows = filteredData.map((row) => [
      formatDate(row.DATE),
      row.RECEIPT_NO,
      row.NAME,
      row.BUILDING_PERMIT_FEE,
      row.NATIONAL_5_PERCENT,
      row.LOCAL_80_PERCENT,
      row.TRUST_FUND_15_PERCENT,
      row.ELECTRICAL_FEE,
      row.ZONING_FEE,
      row.LIVESTOCK_DEV_FUND,
      row.LOCAL_80_PERCENT_LIVESTOCK,
      row.NATIONAL_20_PERCENT,
      row.DIVING_FEE,
      row.LOCAL_40_PERCENT_DIVE_FEE,
      row.BRGY_30_PERCENT,
      row.FISHERS_30_PERCENT,
      row.TOTAL,
      row.CASHIER,
      row.COMMENTS,
    ]);

    downloadCsvFile("trust-fund-daily-table.csv", headers, rows);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1400,height=900");
    if (!printWindow) return;

    const summaryHtml = collectorCards
      .map(
        ({ key, label }) => `
          <div class="summary-card">
            <div class="summary-label">${label}</div>
            <div class="summary-value">${formatCurrency(totalCollectionByCashier[key])}</div>
          </div>
        `
      )
      .join("");

    const rowsHtml = filteredData
      .map(
        (row) => `
          <tr>
            <td>${formatDate(row.DATE)}</td>
            <td>${row.RECEIPT_NO || ""}</td>
            <td>${row.NAME || ""}</td>
            <td>${row.BUILDING_PERMIT_FEE || 0}</td>
            <td>${row.NATIONAL_5_PERCENT || 0}</td>
            <td>${row.LOCAL_80_PERCENT || 0}</td>
            <td>${row.TRUST_FUND_15_PERCENT || 0}</td>
            <td>${row.ELECTRICAL_FEE || 0}</td>
            <td>${row.ZONING_FEE || 0}</td>
            <td>${row.LIVESTOCK_DEV_FUND || 0}</td>
            <td>${row.LOCAL_80_PERCENT_LIVESTOCK || 0}</td>
            <td>${row.NATIONAL_20_PERCENT || 0}</td>
            <td>${row.DIVING_FEE || 0}</td>
            <td>${row.LOCAL_40_PERCENT_DIVE_FEE || 0}</td>
            <td>${row.BRGY_30_PERCENT || 0}</td>
            <td>${row.FISHERS_30_PERCENT || 0}</td>
            <td>${row.TOTAL || 0}</td>
            <td>${row.CASHIER || ""}</td>
            <td>${row.COMMENTS || ""}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Trust Fund Daily Table</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f2747; }
            h1 { margin-bottom: 8px; }
            .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 20px 0; }
            .summary-card { border: 1px solid #d8e2ee; border-radius: 10px; padding: 12px; }
            .summary-label { font-size: 12px; color: #5b7088; margin-bottom: 6px; }
            .summary-value { font-size: 18px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d8e2ee; padding: 6px; text-align: center; }
            th { background: #f7f9fc; }
            .total { margin-top: 14px; font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>Trust Fund Daily Collections</h1>
          <div>Filtered rows: ${filteredData.length}</div>
          <div class="summary-grid">${summaryHtml}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th><th>OR #</th><th>Name</th><th>Building Permit</th><th>National 5%</th><th>Local 80%</th><th>Trust 15%</th><th>Electrical</th><th>Zoning</th><th>Livestock</th><th>Livestock Local</th><th>National 20%</th><th>Diving</th><th>Local 40%</th><th>Barangay 30%</th><th>Fishers 30%</th><th>Total</th><th>Cashier</th><th>Comments</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="total">Total Sum: ${formatCurrency(totalSum)}</div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField
            label="OR Number From"
            variant="outlined"
            value={searchFrom}
            onChange={(e) => setSearchFrom(e.target.value)}
            sx={{ minWidth: 200, flex: 1 }}
          />
          <TextField
            label="OR Number To"
            variant="outlined"
            value={searchTo}
            onChange={(e) => setSearchTo(e.target.value)}
            sx={{ minWidth: 200, flex: 1 }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-end" }, flexWrap: "wrap", gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              px: 3,
              py: 1.25,
              fontWeight: 700,
              fontSize: "0.9rem",
              borderRadius: "10px",
              backgroundColor: "#0f2747",
              color: "#fff",
            }}
          >
            Download CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              px: 3,
              py: 1.25,
              fontWeight: 700,
              fontSize: "0.9rem",
              borderRadius: "10px",
              borderColor: "#0f2747",
              color: "#0f2747",
            }}
          >
            Print
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 4, justifyContent: "center" }}>
          {collectorCards.map(({ key, label }, index) => (
            <Card
              key={label}
              sx={{
                flex: "1 1 240px",
                maxWidth: "260px",
                p: 2.5,
                borderRadius: "16px",
                background:
                  [
                    "linear-gradient(135deg, #0f2747, #2f4f7f)",
                    "linear-gradient(135deg, #0f6b62, #2a8a7f)",
                    "linear-gradient(135deg, #4b5d73, #6a7f99)",
                    "linear-gradient(135deg, #a66700, #c98a2a)",
                    "linear-gradient(135deg, #6a1b9a, #8e24aa)",
                  ][index % 5],
                color: "#ffffff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box sx={{ position: "relative", zIndex: 2 }}>
                <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 600, mb: 1.2 }}>
                  {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: "1.5rem", mt: 1 }}>
                  {formatCurrency(totalCollectionByCashier[key])}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: "600px",
            minWidth: "1100px",
            overflow: "auto",
            "& .sticky-header": {
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: "background.paper",
            },
          }}
        >
          <Table aria-label="daily data table" stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell className="sticky-header" colSpan={3}>
                  Transaction Info
                </StyledTableCell>
                <StyledTableCell className="sticky-header" colSpan={4}>
                  Building Permit
                </StyledTableCell>
                <StyledTableCell className="sticky-header" colSpan={2}>
                  Other Fees
                </StyledTableCell>
                <StyledTableCell className="sticky-header" colSpan={3}>
                  Livestock
                </StyledTableCell>
                <StyledTableCell className="sticky-header" colSpan={4}>
                  Diving
                </StyledTableCell>
                <StyledTableCell className="sticky-header" colSpan={3}>
                  Summary
                </StyledTableCell>
                <StyledTableCell className="sticky-header">Actions</StyledTableCell>
              </TableRow>
              <StyledTableRow>
                <SubHeaderCell>Date</SubHeaderCell>
                <SubHeaderCell>OR #</SubHeaderCell>
                <SubHeaderCell>Name</SubHeaderCell>
                <SubHeaderCell>Fee</SubHeaderCell>
                <SubHeaderCell>National</SubHeaderCell>
                <SubHeaderCell>Local</SubHeaderCell>
                <SubHeaderCell>Trust</SubHeaderCell>
                <SubHeaderCell>Electrical</SubHeaderCell>
                <SubHeaderCell>Zoning</SubHeaderCell>
                <SubHeaderCell>Fund</SubHeaderCell>
                <SubHeaderCell>Local</SubHeaderCell>
                <SubHeaderCell>Trust</SubHeaderCell>
                <SubHeaderCell>Fee</SubHeaderCell>
                <SubHeaderCell>Local</SubHeaderCell>
                <SubHeaderCell>Brgy</SubHeaderCell>
                <SubHeaderCell>Fisher</SubHeaderCell>
                <SubHeaderCell>Total</SubHeaderCell>
                <SubHeaderCell>Cashier</SubHeaderCell>
                <SubHeaderCell>Comments</SubHeaderCell>
                <SubHeaderCell>•••</SubHeaderCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <StyledTableRow key={row.ID || row.RECEIPT_NO}>
                  <CenteredTableCell>{formatDate(row.DATE)}</CenteredTableCell>
                  <CenteredTableCell>{row.RECEIPT_NO}</CenteredTableCell>
                  <CenteredTableCell>{row.NAME}</CenteredTableCell>
                  <CenteredTableCell>{row.BUILDING_PERMIT_FEE}</CenteredTableCell>
                  <CenteredTableCell>{row.NATIONAL_5_PERCENT}</CenteredTableCell>
                  <CenteredTableCell>{row.LOCAL_80_PERCENT}</CenteredTableCell>
                  <CenteredTableCell>{row.TRUST_FUND_15_PERCENT}</CenteredTableCell>
                  <CenteredTableCell>{row.ELECTRICAL_FEE}</CenteredTableCell>
                  <CenteredTableCell>{row.ZONING_FEE}</CenteredTableCell>
                  <CenteredTableCell>{row.LIVESTOCK_DEV_FUND}</CenteredTableCell>
                  <CenteredTableCell>{row.LOCAL_80_PERCENT_LIVESTOCK}</CenteredTableCell>
                  <CenteredTableCell>{row.NATIONAL_20_PERCENT}</CenteredTableCell>
                  <CenteredTableCell>{row.DIVING_FEE}</CenteredTableCell>
                  <CenteredTableCell>{row.LOCAL_40_PERCENT_DIVE_FEE}</CenteredTableCell>
                  <CenteredTableCell>{row.BRGY_30_PERCENT}</CenteredTableCell>
                  <CenteredTableCell>{row.FISHERS_30_PERCENT}</CenteredTableCell>
                  <CenteredTableCell sx={{ fontWeight: 700 }}>{row.TOTAL}</CenteredTableCell>
                  <CenteredTableCell>{row.CASHIER}</CenteredTableCell>
                  <CenteredTableCell>{row.COMMENTS}</CenteredTableCell>
                  <CenteredTableCell>
                    <IconButton onClick={(event) => handleClick(event, row)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                      <MenuItem onClick={handleEditClick}>Edit</MenuItem>
                      <MenuItem onClick={handleCommentClick}>Comment</MenuItem>
                    </Menu>
                  </CenteredTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pb: 2 }}>
        <Box sx={{ fontWeight: "bold" }}>Total Sum: {formatCurrency(totalSum)}</Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Box>
      </Box>

      {isDialogOpen && (
        <PopupDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
          {dialogContent}
        </PopupDialog>
      )}

      <Dialog open={openCommentDialog} onClose={() => setOpenCommentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f2747", pb: 1 }}>
          Daily Comment
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            type="text"
            fullWidth
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
            minRows={3}
            multiline
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenCommentDialog(false)}
            variant="outlined"
            sx={{ borderColor: "#0f2747", color: "#0f2747" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveComment}
            variant="contained"
            sx={{ backgroundColor: "#0f2747" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DailyTablev2.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      DATE: PropTypes.string,
      RECEIPT_NO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      NAME: PropTypes.string,
      BUILDING_PERMIT_FEE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      ELECTRICAL_FEE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      ZONING_FEE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      LIVESTOCK_DEV_FUND: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      DIVING_FEE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      TOTAL: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      CASHIER: PropTypes.string,
      COMMENTS: PropTypes.string,
    })
  ).isRequired,
};

export default DailyTablev2;

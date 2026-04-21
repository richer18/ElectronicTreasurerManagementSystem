import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
  },
  "&:nth-of-type(even)": {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
}));

const CenteredTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  whiteSpace: "nowrap",
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
}));

const cashierData = [
  { key: "ricardo", label: "Ricardo Enopia", aliases: ["ricardo"], icon: <PersonIcon /> },
  { key: "flora", label: "Flora My Ferrer", aliases: ["flora"], icon: <PersonIcon /> },
  { key: "iris", label: "Iris Rafales", aliases: ["iris", "angelique"], icon: <PersonIcon /> },
  { key: "agnes", label: "Agnes Ello", aliases: ["agnes"], icon: <PersonIcon /> },
  { key: "amabella", label: "Amabella", aliases: ["amabella"], icon: <PersonIcon /> },
];

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

const buildTimestampedFilename = (prefix) => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `${prefix}-${datePart}-${timePart}.csv`;
};

function DailyTableV2({ data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentComment, setCurrentComment] = useState("");
  const [currentRow, setCurrentRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      const receiptNo = parseInt(entry.receipt_no, 10);
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
      const cashier = String(row.cashier || "").trim().toLowerCase();
      const matchedCard = cashierData.find(({ aliases }) => aliases.includes(cashier));
      if (matchedCard) totals[matchedCard.key] += parseFloat(row.total) || 0;
    });

    return totals;
  }, [filteredData]);

  const totalSum = useMemo(
    () => filteredData.reduce((acc, row) => acc + (parseFloat(row.total) || 0), 0),
    [filteredData]
  );

  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  const handleCommentClick = () => {
    setCurrentComment(currentRow?.comments || "");
    setOpenCommentDialog(true);
    setAnchorEl(null);
  };

  const handleSaveComment = async () => {
    if (!currentRow) {
      alert("No row selected!");
      return;
    }

    try {
      const formattedDate = format(new Date(currentRow.date), "yyyy-MM-dd");
      const dateComment = new Date().toISOString();

      await axiosInstance.post("updateGFComment", {
        receipt_no: currentRow.receipt_no,
        comment: currentComment,
      });

      await axiosInstance.post("insertGFComment", {
        date: formattedDate,
        receipt_no: currentRow.receipt_no,
        date_comment: dateComment,
        name_client: currentRow.name,
        description: currentComment,
        user: "current_user",
      });

      setOpenCommentDialog(false);
    } catch (error) {
      console.error("Error saving GF comment:", error);
      alert("Failed to save comment");
    }
  };

  const handleDownload = () => {
    const headers = [
      "Date",
      "Name",
      "OR Number",
      "Manufacturing",
      "Distributor",
      "Retailing",
      "Financial",
      "Other Business Tax",
      "Sand & Gravel",
      "Fines & Penalties",
      "Mayor's Permit",
      "Weighs & Measure",
      "Tricycle Operators",
      "Occupation Tax",
      "Cert. of Ownership",
      "Cert. of Transfer",
      "Cockpit Prov. Share",
      "Cockpit Local Share",
      "Docking & Mooring Fee",
      "Sultadas",
      "Miscellaneous Fee",
      "Reg. of Birth",
      "Marriage Fees",
      "Burial Fees",
      "Correction of Entry",
      "Fishing Permit Fee",
      "Sale of Agri Prod",
      "Sale of Acct Form",
      "Water Fees",
      "Stall Fees",
      "Cash Tickets",
      "Slaughter House Fee",
      "Rental of Equipment",
      "Doc Stamp",
      "Police Report Clearance",
      "Med/Dent Lab Fees",
      "Garbage Fees",
      "Cutting Tree",
      "Total",
      "Cashier",
      "Comments",
    ];

    const rows = filteredData.map((row) => [
      formatDate(row.date),
      row.name,
      row.receipt_no,
      row.Manufacturing,
      row.Distributor,
      row.Retailing,
      row.Financial,
      row.Other_Business_Tax,
      row.Sand_Gravel,
      row.Fines_Penalties,
      row.Mayors_Permit,
      row.Weighs_Measure,
      row.Tricycle_Operators,
      row.Occupation_Tax,
      row.Cert_of_Ownership,
      row.Cert_of_Transfer,
      row.Cockpit_Prov_Share,
      row.Cockpit_Local_Share,
      row.Docking_Mooring_Fee,
      row.Sultadas,
      row.Miscellaneous_Fee,
      row.Reg_of_Birth,
      row.Marriage_Fees,
      row.Burial_Fees,
      row.Correction_of_Entry,
      row.Fishing_Permit_Fee,
      row.Sale_of_Agri_Prod,
      row.Sale_of_Acct_Form,
      row.Water_Fees,
      row.Stall_Fees,
      row.Cash_Tickets,
      row.Slaughter_House_Fee,
      row.Rental_of_Equipment,
      row.Doc_Stamp,
      row.Police_Report_Clearance,
      row.Med_Dent_Lab_Fees,
      row.Garbage_Fees,
      row.Cutting_Tree,
      row.total,
      row.cashier,
      row.comments,
    ]);

    downloadCsvFile(buildTimestampedFilename("general-fund-daily"), headers, rows);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1600,height=900");
    if (!printWindow) return;

    const summaryHtml = cashierData
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
            <td>${formatDate(row.date)}</td>
            <td>${row.name || ""}</td>
            <td>${row.receipt_no || ""}</td>
            <td>${row.Manufacturing || 0}</td>
            <td>${row.Distributor || 0}</td>
            <td>${row.Retailing || 0}</td>
            <td>${row.Financial || 0}</td>
            <td>${row.Other_Business_Tax || 0}</td>
            <td>${row.Sand_Gravel || 0}</td>
            <td>${row.Fines_Penalties || 0}</td>
            <td>${row.Mayors_Permit || 0}</td>
            <td>${row.Weighs_Measure || 0}</td>
            <td>${row.Tricycle_Operators || 0}</td>
            <td>${row.Occupation_Tax || 0}</td>
            <td>${row.Cert_of_Ownership || 0}</td>
            <td>${row.Cert_of_Transfer || 0}</td>
            <td>${row.Cockpit_Prov_Share || 0}</td>
            <td>${row.Cockpit_Local_Share || 0}</td>
            <td>${row.Docking_Mooring_Fee || 0}</td>
            <td>${row.Sultadas || 0}</td>
            <td>${row.Miscellaneous_Fee || 0}</td>
            <td>${row.Reg_of_Birth || 0}</td>
            <td>${row.Marriage_Fees || 0}</td>
            <td>${row.Burial_Fees || 0}</td>
            <td>${row.Correction_of_Entry || 0}</td>
            <td>${row.Fishing_Permit_Fee || 0}</td>
            <td>${row.Sale_of_Agri_Prod || 0}</td>
            <td>${row.Sale_of_Acct_Form || 0}</td>
            <td>${row.Water_Fees || 0}</td>
            <td>${row.Stall_Fees || 0}</td>
            <td>${row.Cash_Tickets || 0}</td>
            <td>${row.Slaughter_House_Fee || 0}</td>
            <td>${row.Rental_of_Equipment || 0}</td>
            <td>${row.Doc_Stamp || 0}</td>
            <td>${row.Police_Report_Clearance || 0}</td>
            <td>${row.Med_Dent_Lab_Fees || 0}</td>
            <td>${row.Garbage_Fees || 0}</td>
            <td>${row.Cutting_Tree || 0}</td>
            <td>${row.total || 0}</td>
            <td>${row.cashier || ""}</td>
            <td>${row.comments || ""}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>General Fund Daily Table</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f2747; }
            h1 { margin-bottom: 8px; }
            .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 20px 0; }
            .summary-card { border: 1px solid #d8e2ee; border-radius: 10px; padding: 12px; }
            .summary-label { font-size: 12px; color: #5b7088; margin-bottom: 6px; }
            .summary-value { font-size: 18px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #d8e2ee; padding: 5px; text-align: center; }
            th { background: #f7f9fc; }
            .total { margin-top: 14px; font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>General Fund Daily Collections</h1>
          <div>Filtered rows: ${filteredData.length}</div>
          <div class="summary-grid">${summaryHtml}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Name</th><th>OR #</th><th>Manufacturing</th><th>Distributor</th><th>Retailing</th><th>Financial</th><th>Other Business Tax</th><th>Sand & Gravel</th><th>Fines & Penalties</th><th>Mayor's Permit</th><th>Weighs & Measure</th><th>Tricycle Operators</th><th>Occupation Tax</th><th>Cert. of Ownership</th><th>Cert. of Transfer</th><th>Cockpit Prov. Share</th><th>Cockpit Local Share</th><th>Docking & Mooring Fee</th><th>Sultadas</th><th>Misc. Fee</th><th>Reg. of Birth</th><th>Marriage Fees</th><th>Burial Fees</th><th>Correction of Entry</th><th>Fishing Permit Fee</th><th>Sale of Agri Prod</th><th>Sale of Acct Form</th><th>Water Fees</th><th>Stall Fees</th><th>Cash Tickets</th><th>Slaughter House Fee</th><th>Rental of Equipment</th><th>Doc Stamp</th><th>Police Report</th><th>Med/Dent Lab Fees</th><th>Garbage Fees</th><th>Cutting Tree</th><th>Total</th><th>Cashier</th><th>Comments</th>
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

        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-end" },
            flexWrap: "wrap",
            gap: 2,
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
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
            onClick={handlePrint}
            startIcon={<PrintIcon />}
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
          {cashierData.map(({ key, label, icon }, index) => (
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
                    "linear-gradient(135deg, #1c2a3a, #2f4f7f)",
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
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 1,
                  opacity: 0.08,
                  "& svg": { fontSize: "3.8rem" },
                }}
              >
                {icon}
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <TableContainer component={Paper} style={{ maxHeight: "500px", minWidth: "1100px" }}>
          <Table aria-label="daily data table">
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>OR Number</StyledTableCell>
                <StyledTableCell>Manufacturing</StyledTableCell>
                <StyledTableCell>Distributor</StyledTableCell>
                <StyledTableCell>Retailing</StyledTableCell>
                <StyledTableCell>Financial</StyledTableCell>
                <StyledTableCell>Other Business Tax</StyledTableCell>
                <StyledTableCell>Sand & Gravel</StyledTableCell>
                <StyledTableCell>Fines & Penalties</StyledTableCell>
                <StyledTableCell>Mayor's Permit</StyledTableCell>
                <StyledTableCell>Weighs & Measure</StyledTableCell>
                <StyledTableCell>Tricycle Operators</StyledTableCell>
                <StyledTableCell>Occupation Tax</StyledTableCell>
                <StyledTableCell>Cert. of Ownership</StyledTableCell>
                <StyledTableCell>Cert. of Transfer</StyledTableCell>
                <StyledTableCell>Cockpit Prov. Share</StyledTableCell>
                <StyledTableCell>Cockpit Local Share</StyledTableCell>
                <StyledTableCell>Docking & Mooring Fee</StyledTableCell>
                <StyledTableCell>Sultadas</StyledTableCell>
                <StyledTableCell>Miscellaneous Fee</StyledTableCell>
                <StyledTableCell>Reg. of Birth</StyledTableCell>
                <StyledTableCell>Marriage Fees</StyledTableCell>
                <StyledTableCell>Burial Fees</StyledTableCell>
                <StyledTableCell>Correction of Entry</StyledTableCell>
                <StyledTableCell>Fishing Permit Fee</StyledTableCell>
                <StyledTableCell>Sale of Agri Prod</StyledTableCell>
                <StyledTableCell>Sale of Acct Form</StyledTableCell>
                <StyledTableCell>Water Fees</StyledTableCell>
                <StyledTableCell>Stall Fees</StyledTableCell>
                <StyledTableCell>Cash Tickets</StyledTableCell>
                <StyledTableCell>Slaughter House Fee</StyledTableCell>
                <StyledTableCell>Rental of Equipment</StyledTableCell>
                <StyledTableCell>Doc Stamp</StyledTableCell>
                <StyledTableCell>Police Report Clearance</StyledTableCell>
                <StyledTableCell>Med/Dent Lab Fees</StyledTableCell>
                <StyledTableCell>Garbage Fees</StyledTableCell>
                <StyledTableCell>Cutting Tree</StyledTableCell>
                <StyledTableCell>Total</StyledTableCell>
                <StyledTableCell>Cashier</StyledTableCell>
                <StyledTableCell>Comments</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row) => (
                <StyledTableRow key={row.id}>
                  <CenteredTableCell>{formatDate(row.date)}</CenteredTableCell>
                  <CenteredTableCell>{row.name}</CenteredTableCell>
                  <CenteredTableCell>{row.receipt_no}</CenteredTableCell>
                  <CenteredTableCell>{row.Manufacturing}</CenteredTableCell>
                  <CenteredTableCell>{row.Distributor}</CenteredTableCell>
                  <CenteredTableCell>{row.Retailing}</CenteredTableCell>
                  <CenteredTableCell>{row.Financial}</CenteredTableCell>
                  <CenteredTableCell>{row.Other_Business_Tax}</CenteredTableCell>
                  <CenteredTableCell>{row.Sand_Gravel}</CenteredTableCell>
                  <CenteredTableCell>{row.Fines_Penalties}</CenteredTableCell>
                  <CenteredTableCell>{row.Mayors_Permit}</CenteredTableCell>
                  <CenteredTableCell>{row.Weighs_Measure}</CenteredTableCell>
                  <CenteredTableCell>{row.Tricycle_Operators}</CenteredTableCell>
                  <CenteredTableCell>{row.Occupation_Tax}</CenteredTableCell>
                  <CenteredTableCell>{row.Cert_of_Ownership}</CenteredTableCell>
                  <CenteredTableCell>{row.Cert_of_Transfer}</CenteredTableCell>
                  <CenteredTableCell>{row.Cockpit_Prov_Share}</CenteredTableCell>
                  <CenteredTableCell>{row.Cockpit_Local_Share}</CenteredTableCell>
                  <CenteredTableCell>{row.Docking_Mooring_Fee}</CenteredTableCell>
                  <CenteredTableCell>{row.Sultadas}</CenteredTableCell>
                  <CenteredTableCell>{row.Miscellaneous_Fee}</CenteredTableCell>
                  <CenteredTableCell>{row.Reg_of_Birth}</CenteredTableCell>
                  <CenteredTableCell>{row.Marriage_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Burial_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Correction_of_Entry}</CenteredTableCell>
                  <CenteredTableCell>{row.Fishing_Permit_Fee}</CenteredTableCell>
                  <CenteredTableCell>{row.Sale_of_Agri_Prod}</CenteredTableCell>
                  <CenteredTableCell>{row.Sale_of_Acct_Form}</CenteredTableCell>
                  <CenteredTableCell>{row.Water_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Stall_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Cash_Tickets}</CenteredTableCell>
                  <CenteredTableCell>{row.Slaughter_House_Fee}</CenteredTableCell>
                  <CenteredTableCell>{row.Rental_of_Equipment}</CenteredTableCell>
                  <CenteredTableCell>{row.Doc_Stamp}</CenteredTableCell>
                  <CenteredTableCell>{row.Police_Report_Clearance}</CenteredTableCell>
                  <CenteredTableCell>{row.Med_Dent_Lab_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Garbage_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Cutting_Tree}</CenteredTableCell>
                  <CenteredTableCell>{row.total}</CenteredTableCell>
                  <CenteredTableCell>{row.cashier}</CenteredTableCell>
                  <CenteredTableCell>{row.comments}</CenteredTableCell>
                  <CenteredTableCell>
                    <IconButton onClick={(event) => handleClick(event, row)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                      <MenuItem disabled>Edit</MenuItem>
                      <MenuItem onClick={handleCommentClick}>Comment</MenuItem>
                    </Menu>
                  </CenteredTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Box fontWeight="bold">Total Sum: {formatCurrency(totalSum)}</Box>
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

DailyTableV2.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DailyTableV2;

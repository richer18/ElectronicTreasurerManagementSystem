import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintIcon from "@mui/icons-material/Print";
import PersonIcon from "@mui/icons-material/Person";
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
} from "@mui/material";
import { styled } from "@mui/system";
import { format, parse, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import axiosInstance from "../../../../../api/axiosInstance";
import Cedulas from "../../../../../components/MD-Components/FillupForm/Cedula";
import PopupDialog from "../../../../../components/MD-Components/Popup/PopupDialogCedula_FORM";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  whiteSpace: "nowrap",
  fontWeight: 700,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontSize: "0.82rem",
  background: "#f7f9fc",
  color: "#0f2747",
  borderBottom: "2px solid #d6a12b",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
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
  { key: "ricardo", label: "Ricardo Enopia", aliases: ["ricardo"], icon: <PersonIcon /> },
  { key: "flora", label: "Flora My Ferrer", aliases: ["flora"], icon: <PersonIcon /> },
  { key: "iris", label: "Iris Rafales", aliases: ["iris", "angelique"], icon: <PersonIcon /> },
  { key: "agnes", label: "Agnes Ello", aliases: ["agnes"], icon: <PersonIcon /> },
];

function Dailytablev2({ data, onDataUpdate }) {
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentRow, setCurrentRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [currentComment, setCurrentComment] = useState("");
  const [editData, setEditData] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      const ctcNoStr = entry["CTC NO"]?.toString().trim() || "";
      const receiptNo = ctcNoStr ? parseInt(ctcNoStr, 10) : Number.NaN;
      if (Number.isNaN(receiptNo)) return true;

      const from = searchFrom ? parseInt(searchFrom.trim(), 10) : null;
      const to = searchTo ? parseInt(searchTo.trim(), 10) : null;

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
    };

    filteredData.forEach((row) => {
      const cashierName = String(row.CASHIER || "").trim().toLowerCase();
      const matchedCard = collectorCards.find(({ aliases }) =>
        aliases.includes(cashierName)
      );
      if (matchedCard) totals[matchedCard.key] += parseFloat(row.TOTAL) || 0;
    });

    return totals;
  }, [filteredData]);

  const totalSum = useMemo(
    () => filteredData.reduce((acc, row) => acc + (parseFloat(row.TOTAL) || 0), 0),
    [filteredData]
  );

  const handleEditClick = () => {
    setAnchorEl(null);
    setEditData(currentRow);
    setOpenEditForm(true);
  };

  const handleEditFormSave = (updatedEntry) => {
    if (typeof onDataUpdate === "function") {
      onDataUpdate(updatedEntry);
    }
    setOpenEditForm(false);
    setEditData(null);
  };

  const handleSaveComment = async () => {
    if (!currentRow) {
      alert("No row selected!");
      return;
    }

    try {
      let formattedDate;
      if (/^\d{4}-\d{2}-\d{2}$/.test(currentRow.DATE)) {
        formattedDate = currentRow.DATE;
      } else {
        formattedDate = format(
          parse(currentRow.DATE, "MMMM d, yyyy", new Date()),
          "yyyy-MM-dd"
        );
      }

      const dateComment = new Date().toISOString();

      await axiosInstance.post("updateCedulaComment", {
        CTCNO: currentRow["CTC NO"],
        COMMENT: currentComment,
      });

      await axiosInstance.post("insertCedulaComment", {
        date: formattedDate,
        receipt_no: currentRow["CTC NO"],
        date_comment: dateComment,
        name_client: currentRow.NAME,
        description: currentComment,
        user: "current_user",
      });

      setOpenCommentDialog(false);
    } catch (error) {
      console.error("Error saving Cedula comment:", error);
      alert("Failed to save comment");
    }
  };

  const handleDeleteComment = async () => {
    if (!currentRow) {
      alert("No row selected!");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this comment?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await Promise.all([
        axiosInstance.post("deleteCedulaComment", {
          receipt_no: currentRow["CTC NO"],
        }),
        axiosInstance.post("clearCedulaComment", {
          CTCNO: currentRow["CTC NO"],
        }),
      ]);

      setCurrentComment("");
      setOpenCommentDialog(false);
      if (typeof onDataUpdate === "function") onDataUpdate();
    } catch (error) {
      console.error("Error deleting Cedula comment:", error);
      alert(`Failed to delete comment: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    const headers = [
      "Date",
      "CTC No",
      "Local TIN",
      "Name",
      "Basic",
      "Tax Due",
      "Interest",
      "Total",
      "Cashier",
      "Comment",
    ];

    const rows = filteredData.map((row) => [
      formatDate(row.DATE),
      row["CTC NO"],
      row.LOCAL,
      row.NAME,
      row.BASIC,
      row.TAX_DUE,
      row.INTEREST,
      row.TOTAL,
      row.CASHIER,
      row.COMMENT,
    ]);

    downloadCsvFile("cedula-daily-table.csv", headers, rows);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=900");
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
            <td>${row["CTC NO"] || ""}</td>
            <td>${row.LOCAL || ""}</td>
            <td>${row.NAME || ""}</td>
            <td>${row.BASIC || 0}</td>
            <td>${row.TAX_DUE || 0}</td>
            <td>${row.INTEREST || 0}</td>
            <td>${row.TOTAL || 0}</td>
            <td>${row.CASHIER || ""}</td>
            <td>${row.COMMENT || ""}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Cedula Daily Table</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f2747; }
            h1 { margin-bottom: 8px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
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
          <h1>Cedula Daily Collections</h1>
          <div>Filtered rows: ${filteredData.length}</div>
          <div class="summary-grid">${summaryHtml}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th><th>CTC No</th><th>Local TIN</th><th>Name</th><th>Basic</th><th>Tax Due</th><th>Interest</th><th>Total</th><th>Cashier</th><th>Comment</th>
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
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
          {collectorCards.map(({ key, label, icon }, index) => (
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
                  ][index % 4],
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
      <TableContainer component={Paper} sx={{ maxHeight: "600px", minWidth: "1100px", overflow: "auto" }}>
        <Table aria-label="daily data table">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>CTC NO</StyledTableCell>
              <StyledTableCell>LOCAL TIN</StyledTableCell>
              <StyledTableCell>NAME</StyledTableCell>
              <StyledTableCell>BASIC</StyledTableCell>
              <StyledTableCell>TAX DUE</StyledTableCell>
              <StyledTableCell>INTEREST</StyledTableCell>
              <StyledTableCell>TOTAL</StyledTableCell>
              <StyledTableCell>CASHIER</StyledTableCell>
              <StyledTableCell>COMMENTS</StyledTableCell>
              <StyledTableCell>ACTION</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <StyledTableRow key={`${row["CTC NO"]}-${index}`}>
                <CenteredTableCell>{formatDate(row.DATE)}</CenteredTableCell>
                <CenteredTableCell>{row["CTC NO"]}</CenteredTableCell>
                <CenteredTableCell>{row.LOCAL}</CenteredTableCell>
                <CenteredTableCell>{row.NAME}</CenteredTableCell>
                <CenteredTableCell>{row.BASIC}</CenteredTableCell>
                <CenteredTableCell>{row.TAX_DUE}</CenteredTableCell>
                <CenteredTableCell>{row.INTEREST}</CenteredTableCell>
                <CenteredTableCell>{row.TOTAL}</CenteredTableCell>
                <CenteredTableCell>{row.CASHIER}</CenteredTableCell>
                <CenteredTableCell>{row.COMMENT}</CenteredTableCell>
                <CenteredTableCell>
                  <IconButton onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                    setCurrentRow(row);
                  }}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem onClick={handleEditClick}>Edit</MenuItem>
                    <MenuItem onClick={() => {
                      setCurrentComment(row.COMMENT || "");
                      setOpenCommentDialog(true);
                      setAnchorEl(null);
                    }}>Comment</MenuItem>
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

      {openEditForm && (
        <PopupDialog onClose={() => setOpenEditForm(false)}>
          <Cedulas data={editData} onSave={handleEditFormSave} onClose={() => setOpenEditForm(false)} />
        </PopupDialog>
      )}

      <Dialog open={openCommentDialog} onClose={() => setOpenCommentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f2747", pb: 1 }}>
          {currentRow ? `Comment for ${currentRow["CTC NO"]}` : "Add Comment"}
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
            variant="outlined"
            onClick={handleDeleteComment}
            disabled={isDeleting || !currentRow?.COMMENT}
            sx={{ borderColor: "#c62828", color: "#c62828" }}
          >
            {isDeleting ? "Deleting..." : "Delete Comment"}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setOpenCommentDialog(false)} variant="outlined" sx={{ borderColor: "#0f2747", color: "#0f2747", mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveComment} sx={{ backgroundColor: "#0f2747" }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Dailytablev2;

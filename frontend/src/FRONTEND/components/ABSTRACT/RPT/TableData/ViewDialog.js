import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from "@mui/icons-material/Person";
import PrintIcon from '@mui/icons-material/Print';
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
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import axios from "../../../../../api/axiosInstance";
import AbstractRPT from '../../../../../components/MD-Components/FillupForm/AbstractRPT'; // Adjust the path as needed
import PopupDialog from '../../../../../components/MD-Components/Popup/PopupDialog'; // Adjust the path as needed

const StyledTableCell = styled(TableCell)(() => ({
  whiteSpace: "nowrap",
  fontWeight: 700,
  textAlign: 'center',
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
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const CenteredTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  whiteSpace: "nowrap",
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
}));

const RightAlignedTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'right',
  whiteSpace: "nowrap",
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
}));

const formatDate = (dateInput) => {
  if (!dateInput) return 'Invalid Date';
  let date;
  if (typeof dateInput === 'string') {
    date = parseISO(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return 'Invalid Date';
  }
  if (isNaN(date)) return 'Invalid Date';
  return format(date, 'MMMM d, yyyy');
};

const cashierData = [
  {
    key: "ricardo",
    label: "Ricardo Enopia",
    aliases: ["ricardo"],
    icon: <PersonIcon />,
  },
  {
    key: "flora",
    label: "Flora My Ferrer",
    aliases: ["flora"],
    icon: <PersonIcon />,
  },
  {
    key: "iris",
    label: "Iris Rafales",
    aliases: ["iris", "angelique"],
    icon: <PersonIcon />,
  },
];

const normalizeRptClassification = (value) => {
  switch ((value || "").toUpperCase()) {
    case "LAND-COMML":
    case "LAND-COMMERCIAL":
      return "landComm";
    case "LAND-AGRI":
    case "LAND-AGRICULTURAL":
      return "landAgri";
    case "LAND-RES":
    case "LAND-RESIDENTIAL":
      return "landRes";
    case "BLDG-RES":
    case "BUILDING-RESIDENTIAL":
      return "bldgRes";
    case "BLDG-COMML":
    case "BUILDING-COMMERCIAL":
      return "bldgComm";
    case "BLDG-AGRI":
    case "BUILDING-AGRICULTURAL":
      return "bldgAgri";
    case "MACHINERY":
    case "MACHINERIES":
    case "MACHINERIES-AGRICULTURAL":
    case "MACHINERIES-COMMERCIAL":
    case "MACHINERIES-RESIDENTIAL":
      return "machinery";
    case "BLDG-INDUS":
    case "BUILDING-INDUSTRIAL":
      return "bldgIndus";
    case "SPECIAL":
    case "BUILDING-SS":
      return "special";
    default:
      return null;
  }
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const buildTimestampedFilename = (prefix) => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `${prefix}-${datePart}-${timePart}.csv`;
};



function ViewDialog({ open, onClose, data,selectedDate, onDataUpdate }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openCommentDialogs, setOpenCommentDialogs] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  

  const handleClose = () => {
    onClose();
  };

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setEditData(currentRow); // currentRow should have camelCase field names
    setOpenEditForm(true);
  };

  const handleEditFormClose = () => {
    setOpenEditForm(false);
    setEditData(null);
  };

  const handleEditFormSave = (updatedEntry) => {
    const index = data.findIndex((item) => item.id === updatedEntry.id);
    if (index !== -1) {
      const updatedData = [...data];
      updatedData[index] = updatedEntry;
      onDataUpdate(updatedData);
    }
    handleEditFormClose();
  };

 

 const filteredData = useMemo(() => {
   if (!selectedDate) return [];

   return data
     .filter((row) => {
       if (!row.date) return false;
       const rowDate = row.date instanceof Date ? row.date : new Date(row.date);
       if (isNaN(rowDate.getTime())) return false;
       return (
         format(rowDate, "MM-dd-yyyy") === format(selectedDate, "MM-dd-yyyy")
       );
     })
     .map((row) => {
       const rowDate = row.date instanceof Date ? row.date : new Date(row.date);
        const entry = {
         ...row,
         id: row.id,
         date: row.date,
         name: row.name || "",
         receipt_no: row.receipt || row.receipt_no || "",
         comments: row.comments || "",
         landComm: 0,
         landAgri: 0,
         landRes: 0,
         bldgRes: 0,
         bldgComm: 0,
         bldgAgri: 0,
         machinery: 0,
         bldgIndus: 0,
         special: 0,
         total: parseFloat(row.total) || 0,
         gfTotal: parseFloat(row.gfTotal) || 0,
         cashier: row.cashier || "",
         formattedDate: formatDate(rowDate),
       };

       const amount = parseFloat(row.total) || 0;
       const bucket = normalizeRptClassification(row.status);
       if (bucket) {
         entry[bucket] = amount;
       }
       return entry;
     })
     .filter((entry) => {
       const receiptNo = parseInt(entry.receipt_no, 10);
       const from = searchFrom ? parseInt(searchFrom, 10) : null;
       const to = searchTo ? parseInt(searchTo, 10) : null;

       if (from !== null && to !== null) {
         return receiptNo >= from && receiptNo <= to;
       } else if (from !== null) {
         return receiptNo === from;
       } else if (to !== null) {
         return receiptNo === to;
       }
       return true;
     });
 }, [data, selectedDate, searchFrom, searchTo]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((total, row) => total + row.total, 0);
  }, [filteredData]);

  const totalCollectionByCashier = useMemo(() => {
    const totals = {
      ricardo: 0,
      flora: 0,
      iris: 0,
    };
  
    filteredData.forEach((row) => {
      const cashier = String(row.cashier || "").trim().toLowerCase();
      const matchedCard = cashierData.find(({ aliases }) => aliases.includes(cashier));
      if (matchedCard) {
        totals[matchedCard.key] += row.total;
      }
    });
  
    return totals;
  }, [filteredData]);


  const handleCommentClick = () => {
    setCurrentComment(currentRow.comments || '');
    setOpenCommentDialogs(true);
    handleMenuClose();
  };

  const handleCommentClose = () => {
    setOpenCommentDialogs(false);
  };

  const handleSaveComment = async () => {
    if (!currentRow) {
      alert("No row selected!");
      return;
    }

    try {
      // ✅ Format the date properly
      let formattedDate;
      if (typeof currentRow.date === "string") {
        formattedDate = currentRow.date;
      } else {
        formattedDate = format(new Date(currentRow.date), "yyyy-MM-dd");
      }

      // 1. Update the prepared RPT row comment
      await axios.post("/updateComment", {
        receipt_no: currentRow.receipt_no,
        comment: currentComment,
      });

      // ✅ 2. Insert into rpt_comment
      const dateComment = new Date().toISOString();
      const user = "current_user"; // TODO: Replace with real user from auth context

      await axios.post("/insertComment", {
        date: formattedDate,
        receipt_no: currentRow.receipt_no,
        date_comment: dateComment,
        name_client: currentRow.name,
        description: currentComment,
        user,
      });

      alert("Comment saved successfully!");
      handleCommentClose();
    } catch (error) {
      console.error("Error saving comment:", error);
      alert("Failed to save comment");
    }
  };

const handleDownload = () => {
  const fileName = buildTimestampedFilename("real-property-tax-daily");

  const headers = [
    "Date", "Name", "Receipt No", "LAND-COMML", "LAND-AGRI", "LAND-RES",
    "BLDG-RES", "BLDG-COMML", "BLDG-AGRI", "MACHINERIES", "BLDG-INDUS",
    "SPECIAL", "TOTAL", "CASHIER", "REMARKS"
  ];

  const csvRows = [headers.join(",")]; // Add headers

  // Convert table data to CSV format
  filteredData.forEach((row) => {
    const values = [
      `"${row.formattedDate}"`, 
      `"${row.name}"`,
        `"${row.receipt_no}"`,
      row.landComm.toFixed(2), 
      row.landAgri.toFixed(2), 
      row.landRes.toFixed(2),
      row.bldgRes.toFixed(2), 
      row.bldgComm.toFixed(2), 
      row.bldgAgri.toFixed(2),
      row.machinery.toFixed(2), 
      row.bldgIndus.toFixed(2), 
      row.special.toFixed(2),
      row.total.toFixed(2), // No currency symbol
      `"${row.cashier}"`,
      `"${row.comments}"`
    ];
    csvRows.push(values.join(",")); 
  });

  // Add properly formatted total row
  csvRows.push(`"TOTAL",,,,,,,,,,,,"${totalAmount.toFixed(2)}",,`); 

  // Convert array to CSV string
  const csvContent = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });

  // Create a download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(csvContent);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



const handlePrint = () => {
  const printWindow = window.open("", "_blank", "width=1500,height=900");
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
          <td>${row.formattedDate}</td>
          <td>${row.name || ""}</td>
          <td>${row.receipt_no || ""}</td>
          <td>${row.landComm.toFixed(2)}</td>
          <td>${row.landAgri.toFixed(2)}</td>
          <td>${row.landRes.toFixed(2)}</td>
          <td>${row.bldgRes.toFixed(2)}</td>
          <td>${row.bldgComm.toFixed(2)}</td>
          <td>${row.bldgAgri.toFixed(2)}</td>
          <td>${row.machinery.toFixed(2)}</td>
          <td>${row.bldgIndus.toFixed(2)}</td>
          <td>${row.special.toFixed(2)}</td>
          <td>${row.total.toFixed(2)}</td>
          <td>${(row.gfTotal || row.total).toFixed(2)}</td>
          <td>${row.cashier || ""}</td>
          <td>${row.comments || ""}</td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Real Property Tax Daily Details</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f2747; }
          h1 { margin-bottom: 8px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
          .summary-card { border: 1px solid #d8e2ee; border-radius: 10px; padding: 12px; }
          .summary-label { font-size: 12px; color: #5b7088; margin-bottom: 6px; }
          .summary-value { font-size: 18px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #d8e2ee; padding: 6px; text-align: center; }
          th { background: #f7f9fc; }
          .total { margin-top: 14px; font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>Real Property Tax Daily Details</h1>
        <div>Selected date: ${selectedDate ? formatDate(selectedDate) : "Unknown Date"}</div>
        <div>Filtered rows: ${filteredData.length}</div>
        <div class="summary-grid">${summaryHtml}</div>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Name</th><th>Receipt No</th><th>LAND-COMML</th><th>LAND-AGRI</th><th>LAND-RES</th><th>BLDG-RES</th><th>BLDG-COMML</th><th>BLDG-AGRI</th><th>MACHINERIES</th><th>BLDG-INDUS</th><th>SPECIAL</th><th>TOTAL</th><th>GF &amp; SEF</th><th>CASHIER</th><th>REMARKS</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="total">Total Sum: ${formatCurrency(totalAmount)}</div>
        <div class="total">Overall Total: ${formatCurrency(totalAmount * 2)}</div>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
  printWindow.document.close();
};




  return (
    <>
      {/* Existing ViewDialog using Material-UI Dialog */}
      <Dialog
        onClose={handleClose}
        open={open}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: { width: "90vw", maxWidth: "none" },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f2747" }}>
                RPT Daily Details
              </Typography>
              <Typography variant="body2" sx={{ color: "#5b7088", mt: 0.5 }}>
                {selectedDate ? formatDate(selectedDate) : "Unknown Date"}
              </Typography>
            </Box>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                minWidth: "96px",
                height: "40px",
                fontWeight: 700,
                borderRadius: "10px",
                borderColor: "#d6a12b",
                color: "#0f2747",
              }}
            >
              Close
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ overflowX: "auto", px: 3, pb: 3 }}>
          <Box sx={{ pt: 1 }}>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
                mt: 1,
              }}
            >
              <TextField
                label="OR Number From"
                variant="outlined"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                sx={{ minWidth: 200, flex: 1, bgcolor: "#fff" }}
              />
              <TextField
                label="OR Number To"
                variant="outlined"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                sx={{ minWidth: 200, flex: 1, bgcolor: "#fff" }}
              />
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

            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 4, justifyContent: "center" }}
            >
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

          <Box id="printableTable">
            <TableContainer
              component={Paper}
              sx={{ mt: 2, width: "100%", overflowX: "auto", maxHeight: "520px", minWidth: "1100px" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    {[
                      "Date",
                      "Name",
                      "Receipt No",
                      "LAND-COMML",
                      "LAND-AGRI",
                      "LAND-RES",
                      "BLDG-RES",
                      "BLDG-COMML",
                      "BLDG-AGRI",
                      "MACHINERIES",
                      "BLDG-INDUS",
                      "SPECIAL",
                      "TOTAL",
                      "GF & SEF",
                      "CASHIER",
                      "REMARKS",
                      "ACTION",
                    ].map((header) => (
                      <StyledTableCell
                        key={header}
                        sx={{ textAlign: "center" }}
                      >
                        {header}
                      </StyledTableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredData.map((row, index) => (
                    <StyledTableRow key={index}>
                      <CenteredTableCell>{row.formattedDate}</CenteredTableCell>
                      <CenteredTableCell>{row.name}</CenteredTableCell>
                      <CenteredTableCell>{row.receipt_no}</CenteredTableCell>
                      {[
                        row.landComm,
                        row.landAgri,
                        row.landRes,
                        row.bldgRes,
                        row.bldgComm,
                        row.bldgAgri,
                        row.machinery,
                        row.bldgIndus,
                        row.special,
                        row.total,
                        row.gfTotal || row.total,
                      ].map((value, i) => (
                        <RightAlignedTableCell key={i}>
                          {value.toFixed(2)}
                        </RightAlignedTableCell>
                      ))}
                      <CenteredTableCell>{row.cashier}</CenteredTableCell>
                      <CenteredTableCell>{row.comments}</CenteredTableCell>
                      <CenteredTableCell>
                        <IconButton onClick={(event) => handleMenuClick(event, row)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && currentRow?.id === row.id}
                          onClose={handleMenuClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                        >
                          <MenuItem onClick={handleEditClick}>Edit</MenuItem>
                          <MenuItem onClick={handleCommentClick}>
                            Comment
                          </MenuItem>
                        </Menu>
                      </CenteredTableCell>
                    </StyledTableRow>
                  ))}

                  {/* Total Row */}
                  <StyledTableRow>
                    <RightAlignedTableCell colSpan={14}>
                      <Typography fontWeight="bold">TOTAL</Typography>
                    </RightAlignedTableCell>
                    <RightAlignedTableCell colSpan={4}>
                      <Typography fontWeight="bold">
                        ₱{totalAmount.toFixed(2)}
                      </Typography>
                    </RightAlignedTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                    <RightAlignedTableCell colSpan={14}>
                      <Typography fontWeight="bold"> OVERALL TOTAL</Typography>
                    </RightAlignedTableCell>
                    <RightAlignedTableCell colSpan={4}>
                      <Typography fontWeight="bold">
                        ₱{totalAmount.toFixed(2) * 2}
                      </Typography>
                    </RightAlignedTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Form using PopupDialog */}
      {openEditForm && (
        <PopupDialog onClose={handleEditFormClose}>
          <AbstractRPT
            data={editData}
            onSave={handleEditFormSave}
            onClose={handleEditFormClose}
          />
        </PopupDialog>
      )}

      {/* Comment Dialog */}
      <Dialog open={openCommentDialogs} onClose={handleCommentClose}>
        <DialogTitle>Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            type="text"
            fullWidth
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCommentClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveComment} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

ViewDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  data: PropTypes.array.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  onDataUpdate: PropTypes.func.isRequired,
};

export default ViewDialog;

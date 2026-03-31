import DownloadIcon from '@mui/icons-material/Download';
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.common.white,
  textAlign: 'center',
  fontWeight: 'bold',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const CenteredTableCell = styled(TableCell)({
  textAlign: 'center',
});

const RightAlignedTableCell = styled(TableCell)({
  textAlign: 'right',
});

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
    key: "RICARDO ENOPIA",
    label: "Ricardo Enopia",
    gradient: "linear-gradient(135deg, #3f51b5, #5c6bc0)",
    icon: <PersonIcon />,
  },
  {
    key: "FLORA MY FERRER",
    label: "Flora My Ferrer",
    gradient: "linear-gradient(135deg, #4caf50, #66bb6a)",
    icon: <PersonIcon />,
  },
  {
    key: "IRIS RAFALES",
    label: "Iris Rafales",
    gradient: "linear-gradient(135deg, #e91e63, #ec407a)",
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
      "RICARDO ENOPIA": 0,
      "FLORA MY FERRER": 0,
      "IRIS RAFALES": 0,
      "SEF": 0, // SEF total (modify as needed)
    };
  
    filteredData.forEach((row) => {
      if (totals.hasOwnProperty(row.cashier)) {
        totals[row.cashier] += row.total;
      }
    });
  
    return totals;
  }, [filteredData]); // Recalculates when filteredData changes


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

  const options = { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" };
  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(new Date());
  
  const formattedDateTime = `${parts[4].value}-${parts[2].value}-${parts[0].value}_${parts[6].value}-${parts[8].value}-${parts[10].value}`;
  const fileName = `real_property_tax_abstract_${formattedDateTime}.csv`;

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
  window.print();
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
            }}
          >
            <Typography variant="h6">
              Details for{" "}
              {selectedDate ? formatDate(selectedDate) : "Unknown Date"}
            </Typography>
            <Button
              onClick={handleClose}
              variant="contained"
              sx={{
                minWidth: "40px",
                height: "40px",
                px: 0,
                fontWeight: "bold",
                fontSize: "1rem",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #d32f2f, #f44336)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(244,67,54,0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #f44336, #ef5350)",
                  boxShadow: "0 6px 20px rgba(244,67,54,0.4)",
                },
              }}
            >
              X
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ overflowX: "auto" }}>
          <Box sx={{ p: 3 }}>
            {/* Search Fields */}

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
              }}
            >
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

            {/* Download & Print Buttons */}

            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-end" },
                flexWrap: "wrap",
                gap: 2,
                mt: 4,
                px: 1,
              }}
            >
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{
                  px: 3,
                  py: 1.25,
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #3f51b5, #5c6bc0)",
                  boxShadow: "0 4px 20px rgba(63, 81, 181, 0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5c6bc0, #7986cb)",
                    boxShadow: "0 6px 30px rgba(63, 81, 181, 0.3)",
                  },
                }}
              >
                Download CSV
              </Button>

              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{
                  px: 3,
                  py: 1.25,
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #e91e63, #f06292)",
                  boxShadow: "0 4px 20px rgba(233, 30, 99, 0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #f06292, #f48fb1)",
                    boxShadow: "0 6px 30px rgba(233, 30, 99, 0.3)",
                  },
                }}
              >
                Print
              </Button>
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
              {cashierData.map(({ key, label, gradient, icon }) => {
                const value = totalCollectionByCashier[key];
                const formattedValue =
                  typeof value === "number"
                    ? new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                        minimumFractionDigits: 2,
                      }).format(value)
                    : value;

                return (
                  <Card
                    key={label}
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: "16px",
                      background: gradient,
                      color: "white",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      cursor: "pointer",
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
                        background: "rgba(255,255,255,0.08)",
                        transform: "rotate(30deg)",
                        transition: "all 0.4s ease",
                      },
                      "&:hover::before": {
                        transform: "rotate(30deg) translate(20%, 20%)",
                      },
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
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
                          {label}
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
                          {formattedValue}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          opacity: 0.1,
                          position: "absolute",
                          right: 20,
                          top: 20,
                          "& svg": {
                            fontSize: "3.5rem",
                          },
                        }}
                      >
                        {icon}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: 1.5,
                      }}
                    >
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
                            width: "70%", // Could be dynamic based on value %
                            height: "100%",
                            backgroundColor: "white",
                            borderRadius: "2px",
                          }}
                        />
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>

          <Box id="printableTable">
            {/* Table */}
            <TableContainer
              component={Paper}
              sx={{ width: "100%", overflowX: "auto" }}
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
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={(event) => handleMenuClick(event, row)}
                          sx={{ textTransform: "none" }}
                        >
                          Action
                        </Button>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && currentRow === row}
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

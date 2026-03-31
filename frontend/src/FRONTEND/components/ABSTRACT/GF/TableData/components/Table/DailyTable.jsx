import DownloadIcon from "@mui/icons-material/Download";
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
import React, { useMemo, useState } from "react";
import axiosInstance from "../../../../../../../api/axiosInstance";

// Elegant header cell styling
export const StyledTableCell = styled(TableCell)(() => ({
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

// Alternating row + hover effect
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
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

// Reusable centered cell
export const CenteredTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: "center",
  whiteSpace: "nowrap",
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
}));

const cashierData = [
  {
    key: "RICARDO",
    label: "Ricardo Enopia",
    gradient: "linear-gradient(135deg, #3f51b5, #5c6bc0)",
    icon: <PersonIcon />,
  },
  {
    key: "FLORA MY",
    label: "Flora My Ferrer",
    gradient: "linear-gradient(135deg, #4caf50, #66bb6a)",
    icon: <PersonIcon />,
  },
  {
    key: "IRIS",
    label: "Iris Rafales",
    gradient: "linear-gradient(135deg, #e91e63, #ec407a)",
    icon: <PersonIcon />,
  },
  {
    key: "AGNES",
    label: "Agnes Ello",
    gradient: "linear-gradient(135deg, #ff9800, #ffc107)",
    icon: <PersonIcon />,
  },
  {
    key: "AMABELLA",
    label: "Amabella",
    gradient: "linear-gradient(135deg, #009688, #4db6ac)",
    icon: <PersonIcon />,
  },
];

// Function to format date
// const formatDate = (dateString) => {
//   const date = new Date(dateString);
//   const options = { month: 'short', day: 'numeric', year: 'numeric' };
//   return date.toLocaleDateString('en-US', options);
// };

const formatDate = (dateInput) => {
  if (!dateInput) return "Invalid Date";
  let date;
  if (typeof dateInput === "string") {
    date = parseISO(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return "Invalid Date";
  }
  if (isNaN(date)) return "Invalid Date";
  return format(date, "MMMM d, yyyy");
};

const DailyTable_v2 = ({ data, onClose }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [currentComment, setCurrentComment] = useState("");
  const [currentRow, setCurrentRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openCommentDialogs, setOpenCommentDialogs] = useState(false);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCommentClick = () => {
    setCurrentComment(currentRow.comments || "");
    setOpenCommentDialogs(true);
    handleMenuClose();
  };

  const handleEditClick = () => {
    console.log("EDIT THIS");
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row); // Set the current row correctly
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
      const formatDate = format(new Date(currentRow.date), "yyyy-MM-dd");
      const dateComment = new Date().toISOString();
      const user = "current_user"; // Replace with real user logic

      // Step 1: Update the General Fund prepared row comment
      await axiosInstance.post("updateGFComment", {
        receipt_no: currentRow.receipt_no,
        comment: currentComment,
      });

      // 🔹 Step 2: Insert into `rpt_comment`
      await axiosInstance.post("insertGFComment", {
        date: formatDate,
        receipt_no: currentRow.receipt_no,
        date_comment: dateComment,
        name_client: currentRow.name,
        description: currentComment,
        user: user,
      });

      alert("Comment saved successfully!");
      handleCommentClose();
    } catch (error) {
      console.error("❌ Error saving comment:", error);
      alert("Failed to save comment");
    }
  };

  // Filter the data based on the search term
  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      const receiptNo = parseInt(entry.receipt_no, 10);
      const from = searchFrom ? parseInt(searchFrom, 10) : null;
      const to = searchTo ? parseInt(searchTo, 10) : null;

      if (from !== null && to !== null) {
        return receiptNo >= from && receiptNo <= to; // **Range Match**
      } else if (from !== null) {
        return receiptNo === from; // **Exact Match for 'From'**
      } else if (to !== null) {
        return receiptNo === to; // **Exact Match for 'To'**
      }

      return true; // If both fields are empty, return all
    });
  }, [data, searchFrom, searchTo]);

  const handleDownload = () => {};

  const handlePrint = () => {
    window.print();
  };

  const totalCollectionByCashier = useMemo(() => {
    const totals = {
      RICARDO: 0,
      "FLORA MY": 0,
      IRIS: 0,
      AGNES: 0,
      AMABELLA: 0,
    };

    filteredData.forEach((row) => {
      const key = row.cashier?.trim(); // Clean the string

      if (key && totals.hasOwnProperty(key)) {
        totals[key] += parseFloat(row.total) || 0; // ✅ Ensure numeric addition
      }
    });

    return totals;
  }, [filteredData]);

  // Calculate total sum based on filtered data
  const totalSum = filteredData.reduce(
    (acc, row) => acc + (parseFloat(row.total) || 0),
    0
  );

  return (
    <>
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
              boxShadow: "0 4px 12px rgba(15, 39, 71, 0.25)",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#0b1e38",
                boxShadow: "0 6px 16px rgba(15, 39, 71, 0.35)",
              },
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
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#0b1e38",
                backgroundColor: "rgba(15, 39, 71, 0.08)",
              },
            }}
          >
            Print
          </Button>
        </Box>

        {/* Cashier Collection Cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            mt: 4,
            justifyContent: "center",
          }}
        >
          {cashierData.map(({ key, label, icon }, index) => {
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
                  flex: "1 1 240px",
                  maxWidth: "260px", // ⬅️ smaller width
                  p: 2.5, // ⬅️ tighter padding
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
                  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.2)",
                  transition: "transform 0.4s ease, box-shadow 0.4s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-5px) scale(1.02)",
                    boxShadow: "0 14px 32px rgba(0, 0, 0, 0.3)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "-40%",
                    left: "-30%",
                    width: "200%",
                    height: "200%",
                    background:
                      "radial-gradient(circle at center, rgba(255,255,255,0.05), transparent)",
                    transform: "rotate(25deg)",
                  },
                }}
              >
                <Box sx={{ position: "relative", zIndex: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1.1rem", // ⬅️ smaller
                      fontWeight: 600,
                      mb: 1.2,
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="h5" // ⬅️ was h4
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.5rem", // ⬅️ smaller
                      color: "#ffffff",
                      mt: 1,
                    }}
                  >
                    {formattedValue}
                  </Typography>

                  {/* Optional progress bar */}
                  <Box
                    sx={{
                      mt: 2,
                      height: "4px",
                      borderRadius: "3px",
                      backgroundColor: "rgba(255,255,255,0.25)",
                    }}
                  >
                    <Box
                      sx={{
                        width: "70%",
                        height: "100%",
                        borderRadius: "3px",
                        backgroundColor: "#ffffff",
                      }}
                    />
                  </Box>
                </Box>

                {/* Background icon */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 1,
                    opacity: 0.08,
                    "& svg": {
                      fontSize: "3.8rem", // ⬅️ smaller icon
                    },
                  }}
                >
                  {icon}
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>
      <Box sx={{ px: 3, py: 2 }}>
        <TableContainer
          component={Paper}
          style={{ maxHeight: "500px", minWidth: "1100px" }}
        >
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
              {filteredData.map((row) => (
                <StyledTableRow key={row.id}>
                  <CenteredTableCell align="center">
                    {formatDate(row.date)}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.name}</CenteredTableCell>
                  <CenteredTableCell>{row.receipt_no}</CenteredTableCell>
                  <CenteredTableCell>{row.Manufacturing}</CenteredTableCell>
                  <CenteredTableCell>{row.Distributor}</CenteredTableCell>
                  <CenteredTableCell>{row.Retailing}</CenteredTableCell>
                  <CenteredTableCell>{row.Financial}</CenteredTableCell>
                  <CenteredTableCell>
                    {row.Other_Business_Tax}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.Sand_Gravel}</CenteredTableCell>
                  <CenteredTableCell>{row.Fines_Penalties}</CenteredTableCell>
                  <CenteredTableCell>{row.Mayors_Permit}</CenteredTableCell>
                  <CenteredTableCell>{row.Weighs_Measure}</CenteredTableCell>
                  <CenteredTableCell>
                    {row.Tricycle_Operators}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.Occupation_Tax}</CenteredTableCell>
                  <CenteredTableCell>{row.Cert_of_Ownership}</CenteredTableCell>
                  <CenteredTableCell>{row.Cert_of_Transfer}</CenteredTableCell>
                  <CenteredTableCell>
                    {row.Cockpit_Prov_Share}
                  </CenteredTableCell>
                  <CenteredTableCell>
                    {row.Cockpit_Local_Share}
                  </CenteredTableCell>
                  <CenteredTableCell>
                    {row.Docking_Mooring_Fee}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.Sultadas}</CenteredTableCell>
                  <CenteredTableCell>{row.Miscellaneous_Fee}</CenteredTableCell>
                  <CenteredTableCell>{row.Reg_of_Birth}</CenteredTableCell>
                  <CenteredTableCell>{row.Marriage_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Burial_Fees}</CenteredTableCell>
                  <CenteredTableCell>
                    {row.Correction_of_Entry}
                  </CenteredTableCell>
                  <CenteredTableCell>
                    {row.Fishing_Permit_Fee}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.Sale_of_Agri_Prod}</CenteredTableCell>
                  <CenteredTableCell>{row.Sale_of_Acct_Form}</CenteredTableCell>
                  <CenteredTableCell>{row.Water_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Stall_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Cash_Tickets}</CenteredTableCell>
                  <CenteredTableCell>
                    {row.Slaughter_House_Fee}
                  </CenteredTableCell>
                  <CenteredTableCell>
                    {row.Rental_of_Equipment}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.Doc_Stamp}</CenteredTableCell>
                  <CenteredTableCell>
                    {row.Police_Report_Clearance}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.Med_Dent_Lab_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Garbage_Fees}</CenteredTableCell>
                  <CenteredTableCell>{row.Cutting_Tree}</CenteredTableCell>
                  <CenteredTableCell>{row.total}</CenteredTableCell>
                  <CenteredTableCell>{row.cashier}</CenteredTableCell>
                  <CenteredTableCell>{row.comments}</CenteredTableCell>
                  <CenteredTableCell>
                    <Button
                      aria-controls="simple-menu"
                      aria-haspopup="true"
                      onClick={(event) => handleClick(event, row)}
                      variant="contained"
                      color="primary"
                    >
                      Action
                    </Button>
                    <Menu
                      id="simple-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={handleEditClick}>Edit</MenuItem>
                      <MenuItem onClick={handleCommentClick}>Comment</MenuItem>
                    </Menu>
                  </CenteredTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Move this OUTSIDE the scrollable container */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Box fontWeight="bold">Total Sum: {totalSum.toFixed(2)}</Box>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>

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
};

DailyTable_v2.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      name: PropTypes.string,
      receipt_no: PropTypes.string,
      manufacturing: PropTypes.string,
      distributor: PropTypes.string,
      retailing: PropTypes.string,
      financial: PropTypes.string,
      other: PropTypes.string,
      sandGravel: PropTypes.string,
      finesPenalties: PropTypes.string,
      mayorsPermit: PropTypes.string,
      weighsMeasure: PropTypes.string,
      tricycleOperators: PropTypes.string,
      occu: PropTypes.string,
      certOwnership: PropTypes.string,
      certTransfer: PropTypes.string,
      cockpitProvShare: PropTypes.string,
      cockpitLocalShare: PropTypes.string,
      dockingMooringFee: PropTypes.string,
      sultadas: PropTypes.string,
      miscs: PropTypes.string,
      regOfBirth: PropTypes.string,
      marriageFees: PropTypes.string,
      burialFees: PropTypes.string,
      correctionEntry: PropTypes.string,
      fishingPermitFee: PropTypes.string,
      saleAgriProd: PropTypes.string,
      saleAcctForm: PropTypes.string,
      waterFees: PropTypes.string,
      stallFees: PropTypes.string,
      cashTickets: PropTypes.string,
      slaughterHouseFee: PropTypes.string,
      rentalEquipment: PropTypes.string,
      docStamp: PropTypes.string,
      policeReport: PropTypes.string,
      cert: PropTypes.string,
      medDentLabFees: PropTypes.string,
      garbageFees: PropTypes.string,
      cuttingTree: PropTypes.string,
      total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      cashier: PropTypes.string,
      comments: PropTypes.string,
    })
  ),
  onClose: PropTypes.func,
};

export default DailyTable_v2;


import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintIcon from '@mui/icons-material/Print';
import PopupDialog from "../../../../../../../components/MD-Components/Popup/PopupDialogTF_FORM";

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
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import axiosInstance from "../../../../../../../api/axiosInstance";
import TrustFunds from "../../../../../../../components/MD-Components/FillupForm/AbstractTF";

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

const CenteredTableCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  whiteSpace: 'nowrap',
}));

// Function to format date
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



const DailyTablev2 = ({ data, onClose }) => {
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentRow, setCurrentRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchFrom, setSearchFrom] = useState(""); 
  const [searchTo, setSearchTo] = useState("");
  const [openCommentDialogs, setOpenCommentDialogs] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogContent, setDialogContent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

   const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // 👈 closes the menu
    setSelectedRow(null); // optional, if needed
    setCurrentRow(null); // optional, if needed
  };

  const handleCommentClick = () => {
    setCurrentComment(currentRow.comments || '');
    setOpenCommentDialogs(true);
    handleMenuClose();
  };

  const handleEditClick = () => {
    if (!selectedRow) return;
    setDialogContent(
      <TrustFunds
        // Pass the data from the selected row
        data={selectedRow}
        // If you want a custom prop to indicate "edit mode", you can do:
        mode="edit"
      />
    );
    setIsDialogOpen(true);
    handleMenuClose();
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
    setSelectedRow(row);
  };

  const handleSaveComment = async () => {
    if (!currentRow) {
      alert("No row selected!");
      return;
    }

    try {
      const formatDate = format(new Date(currentRow.DATE), "yyyy-MM-dd");

      // ✅ FIXED: Format as "YYYY-MM-DD HH:mm:ss"
      const dateComment = format(new Date(), "yyyy-MM-dd HH:mm:ss");

      const user = "admin"; // replace this with actual logged-in user

      // Step 1: Update the Trust Fund prepared row comment
      await axiosInstance.post("updateTFComment", {
        RECEIPT_NO: currentRow.RECEIPT_NO,
        COMMENTS: currentComment,
      });

      // 🔹 Step 2: Insert into tf_comment
      await axiosInstance.post("insertTFComment", {
        date: formatDate,
        receipt_no: currentRow.RECEIPT_NO,
        date_comment: dateComment,
        name_client: currentRow.NAME,
        description: currentComment,
        user: user,
      });

      console.log("✅ Comment inserted successfully.");
      alert("✅ Comment saved successfully!");
      handleCommentClose();
    } catch (error) {
      console.error(
        "❌ Error saving comment:",
        error.response?.data || error.message
      );
      alert("❌ Failed to save comment. Please try again.");
    }
  };


 // Filter the data based on the search term
 const filteredData = useMemo(() => {
  return data.filter((entry) => {
    const receiptNo = parseInt(entry.RECEIPT_NO, 10);
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


const handleCommentClose = () => {
  setOpenCommentDialogs(false);
};


  const handleDownload = () => {
   
  };

  const handlePrint = () => {
    window.print();
  };


  const totalCollectionByCashier = useMemo(() => {
    const totals = {
      "RICARDO": 0,
      "FLORA MY": 0,
      "IRIS": 0,
      "AGNES": 0,
    };
  
    console.log("Filtered Data:", filteredData); // ✅ Debugging: Check if data exists
  
    filteredData.forEach((row) => {
      const cashierName = row.CASHIER?.trim().toUpperCase(); // Normalize spaces & case
      const totalAmount = parseFloat(row.TOTAL) || 0; // Ensure TOTAL is a number
  
      console.log(`Processing row: ${cashierName} - ${totalAmount}`); // ✅ Debugging
  
      if (totals.hasOwnProperty(cashierName)) {
        totals[cashierName] += totalAmount;
      }
    });
  
    console.log("Computed Totals:", totals); // ✅ Debugging
  
    return totals;
  }, [filteredData]);


// Calculate total sum based on filtered data
const totalSum = filteredData.reduce((acc, row) => acc + (parseFloat(row.TOTAL) || 0), 0);

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
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
        >
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
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 3 }}>
          {[
            {
              value: totalCollectionByCashier["RICARDO"],
              text: "RICARDO ENOPIA",
            },
            {
              value: totalCollectionByCashier["FLORA MY"],
              text: "FLORA MY FERRER",
            },
            { value: totalCollectionByCashier["IRIS"], text: "IRIS RAFALES" },
            { value: totalCollectionByCashier["AGNES"], text: "AGNES ELLO" },
          ].map(({ value, text }, index) => (
            <Card
              key={text}
              sx={{
                flex: "1 1 250px",
                p: 3,
                borderRadius: "12px",
                background:
                  [
                    "linear-gradient(135deg, #0f2747, #2f4f7f)",
                    "linear-gradient(135deg, #0f6b62, #2a8a7f)",
                    "linear-gradient(135deg, #4b5d73, #6a7f99)",
                    "linear-gradient(135deg, #a66700, #c98a2a)",
                  ][index % 4],
                color: "white",
                boxShadow: "0 8px 24px rgba(63,81,181,0.15)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 12px 30px rgba(40,62,81,0.3)",
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 0.5 }}>
                {text}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {typeof value === "number"
                  ? new Intl.NumberFormat("en-PH", {
                      style: "currency",
                      currency: "PHP",
                      minimumFractionDigits: 2,
                    }).format(value)
                  : value}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: "600px",
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
              {/* Main Group Header Row */}
              <TableRow>
                <StyledTableCell
                  className="sticky-header"
                  colSpan={3}
                  align="center"
                >
                  Transaction Info
                </StyledTableCell>
                <StyledTableCell
                  className="sticky-header"
                  colSpan={4}
                  align="center"
                >
                  Building Permit
                </StyledTableCell>
                <StyledTableCell
                  className="sticky-header"
                  colSpan={2}
                  align="center"
                >
                  Other Fees
                </StyledTableCell>
                <StyledTableCell
                  className="sticky-header"
                  colSpan={3}
                  align="center"
                >
                  Livestock
                </StyledTableCell>
                <StyledTableCell
                  className="sticky-header"
                  colSpan={4}
                  align="center"
                >
                  Diving
                </StyledTableCell>
                <StyledTableCell
                  className="sticky-header"
                  colSpan={3}
                  align="center"
                >
                  Summary
                </StyledTableCell>
                <StyledTableCell className="sticky-header" align="center">
                  Actions
                </StyledTableCell>
              </TableRow>

              {/* Sub-header Row */}
              <StyledTableRow>
                {/* Transaction Info */}
                <SubHeaderCell>Date</SubHeaderCell>
                <SubHeaderCell>OR #</SubHeaderCell>
                <SubHeaderCell sx={{ minWidth: "120px" }}>Name</SubHeaderCell>

                {/* Building Permit */}
                <SubHeaderCell>Fee</SubHeaderCell>
                <SubHeaderCell>National</SubHeaderCell>
                <SubHeaderCell>Local</SubHeaderCell>
                <SubHeaderCell>Trust</SubHeaderCell>

                {/* Other Fees */}
                <SubHeaderCell>Electrical</SubHeaderCell>
                <SubHeaderCell>Zoning</SubHeaderCell>

                {/* Livestock */}
                <SubHeaderCell>Fund</SubHeaderCell>
                <SubHeaderCell>Local</SubHeaderCell>
                <SubHeaderCell>Trust</SubHeaderCell>

                {/* Diving */}
                <SubHeaderCell>Fee</SubHeaderCell>
                <SubHeaderCell>Local</SubHeaderCell>
                <SubHeaderCell>Brgy</SubHeaderCell>
                <SubHeaderCell>Fisher</SubHeaderCell>

                {/* Summary */}
                <SubHeaderCell sx={{ fontWeight: 600 }}>Total</SubHeaderCell>
                <SubHeaderCell>Cashier</SubHeaderCell>
                <SubHeaderCell>Comments</SubHeaderCell>

                {/* Actions */}
                <SubHeaderCell align="center">•••</SubHeaderCell>
              </StyledTableRow>
            </TableHead>

            <TableBody>
              {filteredData.map((row) => (
                <StyledTableRow key={row.id || row.RECEIPT_NO}>
                  <CenteredTableCell>{formatDate(row.DATE)}</CenteredTableCell>
                  <CenteredTableCell>{row.RECEIPT_NO}</CenteredTableCell>
                  <CenteredTableCell sx={{ maxWidth: 150 }}>
                    {row.NAME}
                  </CenteredTableCell>

                  {/* Building Permit Fees */}
                  <CenteredTableCell>
                    {row.BUILDING_PERMIT_FEE}
                  </CenteredTableCell>
                  <CenteredTableCell>
                    {row.NATIONAL_5_PERCENT}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.LOCAL_80_PERCENT}</CenteredTableCell>
                  <CenteredTableCell>
                    {row.TRUST_FUND_15_PERCENT}
                  </CenteredTableCell>

                  {/* Other Fees */}
                  <CenteredTableCell>{row.ELECTRICAL_FEE}</CenteredTableCell>
                  <CenteredTableCell>{row.ZONING_FEE}</CenteredTableCell>

                  {/* Livestock Fees */}
                  <CenteredTableCell>
                    {row.LIVESTOCK_DEV_FUND}
                  </CenteredTableCell>
                  <CenteredTableCell>
                    {row.LOCAL_80_PERCENT_LIVESTOCK}
                  </CenteredTableCell>
                  <CenteredTableCell>
                    {row.NATIONAL_20_PERCENT}
                  </CenteredTableCell>

                  {/* Diving Fees */}
                  <CenteredTableCell>{row.DIVING_FEE}</CenteredTableCell>
                  <CenteredTableCell>
                    {row.LOCAL_40_PERCENT_DIVE_FEE}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.BRGY_30_PERCENT}</CenteredTableCell>
                  <CenteredTableCell>
                    {row.FISHERS_30_PERCENT}
                  </CenteredTableCell>

                  <CenteredTableCell sx={{ fontWeight: "bold" }}>
                    {row.TOTAL}
                  </CenteredTableCell>
                  <CenteredTableCell>{row.CASHIER}</CenteredTableCell>
                  <CenteredTableCell sx={{ maxWidth: 200 }}>
                    {row.COMMENTS}
                  </CenteredTableCell>
                  <CenteredTableCell>
                    <IconButton onClick={(e) => handleClick(e, row)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose} // ✅ this will now work!
                    >
                      <MenuItem
                        onClick={() => {
                          handleEditClick();
                          handleMenuClose(); // ✅ CLOSE after click
                        }}
                      >
                        Edit
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          handleCommentClick();
                          handleMenuClose(); // ✅ CLOSE after click
                        }}
                      >
                        Comment
                      </MenuItem>
                    </Menu>
                  </CenteredTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* Total Sum aligned to the LEFT */}
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <Box sx={{ fontWeight: "bold" }}>Total Sum: {totalSum.toFixed(2)}</Box>
        {/* Pagination aligned to the RIGHT */}
        <Box sx={{ flexGrow: 1 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
      {isDialogOpen && (
        <PopupDialog open={isDialogOpen} onClose={handleClose}>
          {dialogContent}
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
};

DailyTablev2.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      DATE: PropTypes.string,
      RECEIPT_NO: PropTypes.string,
      NAME: PropTypes.string,
      BUILDING_PERMIT_FEE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      LOCAL_80_PERCENT: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      TRUST_FUND_15_PERCENT: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      NATIONAL_5_PERCENT: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      ELECTRICAL_FEE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      ZONING_FEE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      LIVESTOCK_DEV_FUND: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      LOCAL_80_PERCENT_LIVESTOCK: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      NATIONAL_20_PERCENT: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      DIVING_FEE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      LOCAL_40_PERCENT_DIVE_FEE: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      BRGY_30_PERCENT: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      FISHERS_30_PERCENT: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      TOTAL: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      CASHIER: PropTypes.string,
      COMMENTS: PropTypes.string,
    })
  ),
  onClose: PropTypes.func,
};

export default DailyTablev2;

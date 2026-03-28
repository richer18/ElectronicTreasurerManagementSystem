import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Autocomplete, Badge,
  Box,
  Button,
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
  Typography,
} from '@mui/material';
import { format, isValid, parse, parseISO } from "date-fns";
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import axios from "../../../../../api/axiosInstance";
import CommentsDialog from './CommentsDialog';
import ViewDialog from './ViewDialog'; // Import the ViewDialog component

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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const CenteredTableCell = styled(TableCell)({
  textAlign: 'center',
});

const RightAlignedTableCell = styled(TableCell)({
  textAlign: 'right',
});

const months = [
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const years = [
  { label: '2023', value: '2023' },
  { label: '2024', value: '2024' },
  { label: '2025', value: '2025' },
  { label: '2026', value: '2026' },
  { label: '2027', value: '2027' },
  { label: '2028', value: '2028' },
  { label: '2029', value: '2029' },
  { label: '2030', value: '2030' },
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

const formatMoney = (value) =>
  new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

DailyTable.propTypes = {
  month: PropTypes.string,
  year: PropTypes.string,
  onMonthChange: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onDataFiltered: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};



function DailyTable({
  month,
  year,
  onMonthChange,
  onYearChange,
  onDataFiltered,
  onBack,
}) {
  const [data, setData] = useState([]);
  const [openCommentDialogs, setOpenCommentDialogs] = useState(false);
  const [openViewDialogs, setOpenViewDialogs] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [currentRow, setCurrentRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // For menu
  const [selectedDate, setSelectedDate] = useState(null);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [comments, setComments] = useState([]);

  useEffect(() => {
    axios
      .get("/commentRPTCounts")
      .then((response) => {
        setCommentCounts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching comment counts:", error);
      });
  }, []);
  


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await axios.get("/allData");
        if (response.status === 200) {
          const adjustedData = response.data.map((item, index) => ({
            id: item.id !== undefined ? item.id : index,
            date: item.date ? parseISO(item.date) : null,
            name: item.name ?? "",
            receipt: item.receipt_no ?? "",
            barangay: item.barangay ?? "",
            status: item.status ?? "",
            cashier: item.cashier ?? "",
            comments: item.comments ?? "",
            currentYear: item.current_year ?? "",
            currentPenalties: item.current_penalties ?? "",
            currentDiscounts: item.current_discounts ?? "",
            prevYear: item.prev_year ?? "",
            prevPenalties: item.prev_penalties ?? "",
            priorYears: item.prior_years ?? "",
            priorPenalties: item.prior_penalties ?? "",
            total: item.total ?? 0,
            share: item.share ?? 0,
            additionalCurrentYear: item.additional_current_year ?? "",
            additionalCurrentPenalties: item.additional_penalties ?? "",
            additionalCurrentDiscounts: item.additional_discounts ?? "",
            additionalPrevYear: item.additional_prev_year ?? "",
            additionalPrevPenalties: item.additional_prev_penalties ?? "",
            additionalPriorYears: item.additional_prior_years ?? "",
            additionalPriorPenalties: item.additional_prior_penalties ?? "",
            additionalTotal: item.additional_total ?? 0,
            gfTotal: item.gf_total ?? 0,
          }));

          setData(adjustedData);
          onDataFiltered(adjustedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, [onDataFiltered]);
  


  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewClick = () => {
    let date;
    if (currentRow.date instanceof Date) {
      date = currentRow.date;
    } else {
      // Use the format your database provides, which is 'yyyy-MM-dd'
      date = parse(currentRow.date, "yyyy-MM-dd", new Date());
    }
    if (!isValid(date)) {
      console.error("Parsed date is invalid:", currentRow.date);
      return;
    }
    setSelectedDate(date);
    setOpenViewDialogs(true);
    handleMenuClose();
  };

  const handleDataUpdate = (updatedData) => {
    setData(updatedData);
  };
 

  const handleCommentClose = () => {
    setOpenCommentDialogs(false);
  };

  const handleViewClose = () => {
    setOpenViewDialogs(false);
  };

  const handleSaveComment = async () => {
    try {
      const user = "currentUser"; // Replace with actual logged-in user logic

      await axios.post("/allDayComment", {
        description: currentComment,
        user,
      });

      handleCommentClose();
      alert("Comment saved successfully");
    } catch (error) {
      console.error("Error saving comment:", error);
      alert("Failed to save the comment.");
    }
  };
  

  const handleMonthChange = (event, value) => {
    onMonthChange(value ? value.value : null);
  };

  const handleYearChange = (event, value) => {
    onYearChange(value ? value.value : null);
  };

  const filteredData = useMemo(() => {
    const filtered = data.filter((row) => {
      // Validate date first
      const dateObj = row.date ? new Date(row.date) : null;
      const isValidDate = dateObj && !isNaN(dateObj.getTime());

      if (!isValidDate) return false; // Skip invalid dates

      const rowMonth = format(dateObj, "M");
      const rowYear = format(dateObj, "yyyy");
      return (
        (month ? rowMonth === month : true) && (year ? rowYear === year : true)
      );
    });

    const dataByDate = {};

    filtered.forEach((row) => {
      // Handle invalid dates consistently
      const dateObj = row.date ? new Date(row.date) : null;
      const isValidDate = dateObj && !isNaN(dateObj.getTime());
      const dateKey = isValidDate
        ? format(dateObj, "yyyy-MM-dd")
        : "Invalid Date";

      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = {
          date: dateKey,
          landComm: 0,
          landAgri: 0,
          landRes: 0,
          bldgRes: 0,
          bldgComm: 0,
          bldgAgri: 0,
          machinery: 0,
          bldgIndus: 0,
          special: 0,
          total: 0,
          comments: "",
        };
      }

      const amount = parseFloat(row.total) || 0;
      dataByDate[dateKey].total += amount;

      const bucket = normalizeRptClassification(row.status);
      if (bucket) {
        dataByDate[dateKey][bucket] += amount;
      }

      // Update the comments for the date
      dataByDate[dateKey].comments = row.comments || "";
    });

    const sortedData = Object.values(dataByDate).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    return sortedData;
  }, [data, month, year]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((total, row) => total + row.total, 0);
  }, [filteredData]);

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

  const handleViewComments = async (date) => {
    try {
      const response = await axios.get(`/getRPTComments/${date}`);
      console.log("Fetched Comments from API:", response.data);

      if (response.status === 200 && response.data.length > 0) {
        setComments(response.data);
        setOpenCommentDialog(true);
      } else {
        console.warn("No comments found for this date.");
        setComments([]);
        setOpenCommentDialog(true);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCommentDialogClose = () => {
    setOpenCommentDialog(false);
    setComments([]); // Clear comments when closing
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          mb: 4,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px solid #d6a12b",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
      <Button
      variant="contained"
      startIcon={<ArrowBackIcon />}
      onClick={onBack}
      sx={{
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 700,
        backgroundColor: "#0f2747",
        boxShadow: "0 4px 10px rgba(15, 39, 71, 0.25)",
        "&:hover": {
          backgroundColor: "#0b1e38",
          boxShadow: "0 6px 14px rgba(15, 39, 71, 0.35)",
        },
      }}
    >
        Back
      </Button>
      
      <Typography variant="h4" sx={{
        fontWeight: 700,
        color: "#0f2747",
        letterSpacing: 1,
        textTransform: "uppercase",
      }}>
        Daily Collections
      </Typography>
      
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
      <Autocomplete
            disablePortal
            id="month-selector"
            options={months}
            sx={{
              width: 150,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleMonthChange}
            value={months.find((option) => option.value === month) ?? null}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Month"
                variant="outlined"
                sx={{
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
                }}
              />
            )}
          />
          <Autocomplete
            disablePortal
            id="year-selector"
            options={years}
            sx={{
              width: 150,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleYearChange}
            value={years.find((option) => option.value === year) ?? null}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Year"
                variant="outlined"
                sx={{
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
                }}
              />
            )}
          />
      </Box>
    </Box>


      

      <TableContainer 
        component={Paper}
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          overflow: "hidden",
          '& .MuiTableCell-root': {
            py: 2
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>LAND-COMML</StyledTableCell>
              <StyledTableCell>LAND-AGRI</StyledTableCell>
              <StyledTableCell>LAND-RES</StyledTableCell>
              <StyledTableCell>BLDG-RES</StyledTableCell>
              <StyledTableCell>BLDG-COMML</StyledTableCell>
              <StyledTableCell>BLDG-AGRI</StyledTableCell>
              <StyledTableCell>MACHINERIES</StyledTableCell>
              <StyledTableCell>BLDG-INDUS</StyledTableCell>
              <StyledTableCell>SPECIAL</StyledTableCell>
              <StyledTableCell>TOTAL</StyledTableCell>
              <StyledTableCell>REMARKS</StyledTableCell>
              <StyledTableCell>ACTION</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <StyledTableRow key={index}>
                <CenteredTableCell>{formatDate(row.date)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.landComm)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.landAgri)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.landRes)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.bldgRes)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.bldgComm)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.bldgAgri)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.machinery)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.bldgIndus)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.special)}</CenteredTableCell>
                <CenteredTableCell>{formatMoney(row.total)}</CenteredTableCell>
                <CenteredTableCell>
  <Badge
    badgeContent={commentCounts[new Date(row.date).toISOString().split("T")[0]]}
    color="error"
    overlap="circular"
    invisible={!commentCounts[new Date(row.date).toISOString().split("T")[0]]}
  >
    <IconButton onClick={() => handleViewComments(row.date)}>
      <VisibilityIcon color="primary" />
    </IconButton>
  </Badge>
</CenteredTableCell>
                <CenteredTableCell>
                  <Button
                    variant="contained"
                    onClick={(event) => handleMenuClick(event, row)}
                    sx={{
                      textTransform: "none",
                      px: 2,
                      py: 0.75,
                      fontSize: "0.75rem",
                      borderRadius: 2,
                    }}
                  >
                    Action
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && currentRow === row}
                    onClose={handleMenuClose}
                    slotProps={{
                      paper: {
                        elevation: 0,
                        sx: { boxShadow: "none" },
                      },
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={handleViewClick}>VIEW</MenuItem>
                  </Menu>
                </CenteredTableCell>
              </StyledTableRow>
            ))}
            <StyledTableRow>
              <RightAlignedTableCell colSpan={10}>
                <Typography fontWeight="bold">TOTAL</Typography>
              </RightAlignedTableCell>
              <RightAlignedTableCell colSpan={3}>
                <Typography fontWeight="bold">PHP {formatMoney(totalAmount)}</Typography>
              </RightAlignedTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>

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

      {/* View Dialog */}
      <ViewDialog
        open={openViewDialogs}
        onClose={handleViewClose}
        currentRow={currentRow}
        data={data}
        setData={setData}
        selectedDate={selectedDate}
        onDataUpdate={handleDataUpdate}
      />

        <CommentsDialog
        open={openCommentDialog}
        onClose={handleCommentDialogClose}
        comments={comments}
        formatDate={formatDate}
      />
    </>
  );
}

export default DailyTable;

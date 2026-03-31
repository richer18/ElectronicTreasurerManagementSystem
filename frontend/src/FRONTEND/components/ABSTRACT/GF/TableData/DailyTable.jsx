import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
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
  TextField, Typography
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import axios from "../../../../../api/axiosInstance";
import CommentsDialog from '../../RPT/TableData/CommentsDialog';
import DailyTablev2 from './components/Table/DailyTable';



// Styled components for the table cells
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

const RightAlignedTableCell = styled(TableCell)({
  textAlign: 'right',
});

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

const formatAmount = (value) =>
  Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function DailyTable({ onDataFiltered, onBack, month, year }) {
  const [data, setData] = useState([]);
  const [currentRow, setCurrentRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(month || '');
  const [selectedYear, setSelectedYear] = useState(year || '');
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedMonth(month || '');
  }, [month]);

  useEffect(() => {
    setSelectedYear(year || '');
  }, [year]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("allDataGeneralFund", {
          params: { month: selectedMonth, year: selectedYear },
        });

        setData(response.data);

        if (onDataFiltered) {
          onDataFiltered(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, onDataFiltered]);

  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row); // Set the current row correctly
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewClick = () => {
    const selectedDate = currentRow?.raw_date || currentRow?.DATE;
    if (!selectedDate) {
      console.error("Current row or date is not defined.");
      return;
    }

    const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
    console.log(`Requesting data for date: ${formattedDate}`);

    axios
      .get("viewalldataGeneralFundTableView", {
        params: { date: formattedDate },
      })
      .then((response) => {
        console.log("Received data:", response.data);
        setViewData(response.data);
        setViewOpen(true);
      })
      .catch((error) => {
        console.error("Error fetching detailed data:", error);
      });
  };
  

  

  const handleMonthChange = (event, value) => {
    setSelectedMonth(value ? value.value : '');
  };

  const handleYearChange = (event, value) => {
    setSelectedYear(value ? value.value : '');
  };

  const handleViewComments = async (date) => {
    try {
      const response = await axios.get(`getGFComments/${date}`);
      console.log("Fetched Comments from API:", response.data);

      if (response.status === 200 && response.data.length > 0) {
        setComments(response.data);
        setOpenCommentDialog(true);
      } else {
        console.warn("No comments found for this date.");
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  
  useEffect(() => {
    axios
      .get("commentGFCounts")
      .then((response) => {
        setCommentCounts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching comment counts:", error);
      });
  }, []);


  const handleViewClose = () => {
    setViewOpen(false);
  };

  const handleCommentDialogClose = () => {
    setOpenCommentDialog(false);
    setComments([]); // Clear comments when closing
  };

  const totalAmount = useMemo(() => {
    return data.reduce((total, row) => {
      const value = parseFloat(row["Overall Total"]) || 0;
      return total + value;
    }, 0);
  }, [data]);

  return (
    <>
      {/* Month and Year selectors */}
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

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#0f2747",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
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
            value={months.find((option) => option.value === selectedMonth) || null}
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
            value={years.find((option) => option.value === selectedYear) || null}
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


      {/* Table display */}
      <Dialog open={loading} maxWidth="xs" fullWidth>
        <DialogTitle>Loading Daily Collections</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please wait while the daily collections are being loaded.
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
            Loading daily data...
          </Typography>
          <LinearProgress
            variant="indeterminate"
            sx={{ height: 10, borderRadius: 999 }}
          />
        </DialogContent>
      </Dialog>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          "& .MuiTableCell-root": {
            py: 2,
          },
        }}
      >
      <Table aria-label="daily data table">
        <TableHead>
          <StyledTableRow>
            <StyledTableCell>DATE</StyledTableCell>
            <StyledTableCell>Tax on Business</StyledTableCell>
            <StyledTableCell>Regulatory Fees</StyledTableCell>
            <StyledTableCell>Receipts From Economic Enterprise</StyledTableCell>
            <StyledTableCell>Service/User Charges</StyledTableCell>
            <StyledTableCell>TOTAL</StyledTableCell>
            <StyledTableCell>COMMENTS</StyledTableCell>
            <StyledTableCell>ACTION</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
  {data.map((row, index) => (
    <StyledTableRow key={row.id || row.DATE || index}>
      <CenteredTableCell>{dayjs(row.raw_date || row.DATE).format('MMM D, YYYY')}</CenteredTableCell>
      <CenteredTableCell>{formatAmount(row['Tax on Business'])}</CenteredTableCell>
      <CenteredTableCell>{formatAmount(row['Regulatory Fees'])}</CenteredTableCell>
      <CenteredTableCell>{formatAmount(row['Receipts From Economic Enterprise'])}</CenteredTableCell>
      <CenteredTableCell>{formatAmount(row['Service/User Charges'])}</CenteredTableCell>
      <CenteredTableCell>{formatAmount(row['Overall Total'])}</CenteredTableCell>
      <CenteredTableCell>
      <Badge
  badgeContent={commentCounts[dayjs(row.raw_date || row.DATE).format("YYYY-MM-DD")]}
  color="error"
  overlap="circular"
  invisible={!commentCounts[dayjs(row.raw_date || row.DATE).format("YYYY-MM-DD")]}
>
  <IconButton onClick={() => handleViewComments(dayjs(row.raw_date || row.DATE).format("YYYY-MM-DD"))}>
    <VisibilityIcon color="primary" />
  </IconButton>
</Badge>
</CenteredTableCell>
      <CenteredTableCell>
        <Button
        variant="contained"
        color="primary"
        onClick={(event) => handleClick(event, row)}
        sx={{ textTransform: 'none' }}
        >
          Action
          </Button>
          <Menu
  id="simple-menu"
  anchorEl={anchorEl}
  keepMounted
  open={Boolean(anchorEl)}
  onClose={handleClose}
  slotProps={{
    paper: {
      elevation: 0, // Removes shadow
      sx: { boxShadow: 'none' }, // Ensures no shadow
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
  <MenuItem onClick={handleViewClick}>View</MenuItem>
</Menu>
      </CenteredTableCell>
    </StyledTableRow>
  ))}
  <StyledTableRow>
              <RightAlignedTableCell colSpan={7}>
                <Typography fontWeight="bold">TOTAL</Typography>
              </RightAlignedTableCell>
              <RightAlignedTableCell colSpan={1}>
                <Typography fontWeight="bold">PHP {formatAmount(totalAmount)}</Typography>
              </RightAlignedTableCell>
            </StyledTableRow>
</TableBody>
      </Table>
    </TableContainer>
     

      {/* View Dialog */}
      
      <Dialog
      open={viewOpen}
      onClose={handleViewClose}
      fullWidth
      maxWidth="xl"
    >
      <DialogTitle
  sx={{
    bgcolor: "primary.main",
    color: "common.white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <Typography variant="h6" component="span">
    Transaction Details - {dayjs(viewData?.[0]?.date || currentRow?.raw_date || currentRow?.DATE).format("MMMM D, YYYY")}
  </Typography>
  <IconButton onClick={handleViewClose} sx={{ color: "common.white" }}>
    <CloseIcon />
  </IconButton>
</DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <DailyTablev2 
          data={viewData} 
          onClose={handleViewClose}
          sx={{ border: 'none' }}
        />
      </DialogContent>
    </Dialog>


 <CommentsDialog
        open={openCommentDialog}
        onClose={handleCommentDialogClose}
        comments={comments}
        formatDate={formatDate}
      />
    </>
  );
}

DailyTable.propTypes = {
  month: PropTypes.string,
  onDataFiltered: PropTypes.func,
  onBack: PropTypes.func.isRequired,
  year: PropTypes.string,
};

export default DailyTable;

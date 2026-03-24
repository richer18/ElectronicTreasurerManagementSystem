import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Dialog,
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
} from "@mui/material";

import { format, parse, parseISO } from "date-fns";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../../api/axiosInstance";
import CommentsDialog from "../../RPT/TableData/CommentsDialog";
import DailyTablev2 from "../components/dailytablev2";
import { useMaterialUIController } from "../../../../../context";
// Styled components for table cells
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

const CenteredTableCell = styled(TableCell)({
  textAlign: "center",
});

// Define months and years for filters
const months = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },

  // Add the rest of the months...
];

const years = [
  { label: "2023", value: "2023" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
  { label: "2030", value: "2030" },

  // Add more years...
];

// Helper function to format the date
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

const formatAmount = (value) =>
  new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function DailyTable({ onBack, setShowFilters }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const uiColors = useMemo(
    () => ({
      navy: darkMode ? "#4f7bb5" : "#0f2747",
      navyHover: darkMode ? "#3f6aa3" : "#0b1e38",
      steel: darkMode ? "#7c8fa6" : "#4b5d73",
      steelHover: darkMode ? "#6b7f97" : "#3c4c60",
      teal: darkMode ? "#3aa08f" : "#0f6b62",
      tealHover: darkMode ? "#2f8b7c" : "#0b544d",
      amber: darkMode ? "#d19a3f" : "#a66700",
      amberHover: darkMode ? "#b7832f" : "#8c5600",
      red: darkMode ? "#d06666" : "#b23b3b",
      redHover: darkMode ? "#b85656" : "#8f2f2f",
      bg: darkMode ? "#0f1117" : "#f5f7fb",
    }),
    [darkMode]
  );

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [collectionData, setCollectionData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null); // Track the row clicked
  // const [openDialog, setOpenDialog] = useState(false); // Control dialog visibility
  const [viewData, setViewData] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [openCommentDialog, setOpenCommentDialog] = useState(false);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Fetch data when month or year changes
  useEffect(() => {
    const fetchCollectionData = async () => {
      const params = {};
      if (selectedMonth) params.month = selectedMonth.value;
      if (selectedYear) params.year = selectedYear.value;

      try {
        const response = await axiosInstance.get("CedulaDailyCollection", {
          params,
        });
        setCollectionData(response.data);
      } catch (error) {
        console.error("Error fetching collection data:", error);
      }
    };

    fetchCollectionData();
  }, [selectedMonth, selectedYear]);

  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };
  const handleViewClick = async () => {
    if (!currentRow) {
      console.error("No row selected");
      return;
    }

    try {
      // Parse and format the date
      const parsedDate = parse(currentRow.DATE, "MMM dd, yyyy", new Date());
      const formattedDate = format(parsedDate, "yyyy-MM-dd");

      console.log("Fetching data for date:", formattedDate);

      const response = await axiosInstance.get(
        "viewDailyCollectionDetailsCedula",
        {
          params: { date: formattedDate },
        }
      );

      const data = response.data;
      setViewData(Array.isArray(data) ? data : []);
      setViewOpen(true); // Open the dialog
    } catch (error) {
      console.error("Error fetching detailed data:", error);
      setViewData([]); // Clear data on error
    }
  };

  const handleViewComments = async (date) => {
    try {
      const response = await axiosInstance.get(`getCedulaComments/${date}`);
      console.log("Fetched Comments from API:", response.data); // Debugging

      if (response.status === 200 && response.data.length > 0) {
        setComments(response.data);
      } else {
        console.warn("No comments found for this date.");
        setComments([]);
      }

      setOpenCommentDialog(true); // Always open dialog
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  };

  useEffect(() => {
    axiosInstance
      .get("commentCedulaCounts")
      .then((response) => {
        setCommentCounts(response.data); // Store comment counts in state
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: { xs: 2, md: 3 },
        marginTop: 2,
        backgroundColor: uiColors.bg,
        minHeight: "100%",
      }}
    >
      {/* Month and Year selectors */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          mt: 2,
          mb: 4,
          p: { xs: 2, md: 3 },
          bgcolor: "background.paper",
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            backgroundColor: uiColors.navy,
            boxShadow: "0 2px 6px rgba(15, 39, 71, 0.2)",
            "&:hover": {
              backgroundColor: uiColors.navyHover,
              boxShadow: "0 4px 10px rgba(15, 39, 71, 0.3)",
            },
          }}
        >
          Back
        </Button>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: uiColors.navy,
            letterSpacing: 1,
          }}
        >
          Daily Collections
        </Typography>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Autocomplete
            disablePortal
            id="month-selector"
            options={months}
            sx={{ width: { xs: "100%", sm: 160 } }}
            onChange={(e, value) => setSelectedMonth(value || null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Month"
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
            sx={{ width: { xs: "100%", sm: 160 } }}
            onChange={(e, value) => setSelectedYear(value || null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Year"
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
          backgroundColor: (theme) => theme.palette.background.paper,
          "& .MuiTableCell-root": {
            py: 2,
            color: (theme) => theme.palette.text.primary,
          },
        }}
      >
        <Table aria-label="daily data table">
          <TableHead>
            <TableRow>
              <StyledTableCell>DATE</StyledTableCell>
              <StyledTableCell>BASIC</StyledTableCell>
              <StyledTableCell>TAX DUE</StyledTableCell>
              <StyledTableCell>INTEREST</StyledTableCell>
              <StyledTableCell>TOTAL</StyledTableCell>
              <StyledTableCell>COMMENT</StyledTableCell>
              <StyledTableCell>ACTION</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collectionData.length > 0 ? (
              collectionData.map((row, index) => (
                <TableRow key={index}>
                  <CenteredTableCell>{row.DATE}</CenteredTableCell>
                  <CenteredTableCell>{row.BASIC}</CenteredTableCell>
                  <CenteredTableCell>{row.TAX_DUE}</CenteredTableCell>
                  <CenteredTableCell>{row.INTEREST}</CenteredTableCell>
                  <CenteredTableCell>{formatAmount(row.TOTAL)}</CenteredTableCell>
                  <CenteredTableCell>
                    <Badge
                      badgeContent={
                        commentCounts[dayjs(row.DATE).format("YYYY-MM-DD")]
                      }
                      color="error"
                      overlap="circular"
                      invisible={
                        !commentCounts[dayjs(row.DATE).format("YYYY-MM-DD")]
                      }
                    >
                      <IconButton
                        onClick={() =>
                          handleViewComments(
                            dayjs(row.DATE).format("YYYY-MM-DD")
                          )
                        }
                      >
                      <VisibilityIcon sx={{ color: uiColors.navy }} />
                    </IconButton>
                  </Badge>
                </CenteredTableCell>
                <CenteredTableCell>
                  <Button
                    variant="contained"
                    onClick={(event) => handleMenuClick(event, row)}
                    sx={{
                      textTransform: "none",
                      backgroundColor: uiColors.navy,
                      "&:hover": { backgroundColor: uiColors.navyHover },
                    }}
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
                      <MenuItem onClick={handleViewClick}>VIEW</MenuItem>
                    </Menu>
                  </CenteredTableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <CenteredTableCell colSpan={7}>
                  No data available
                </CenteredTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)} // Ensure proper closing
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
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
            Transaction Details -{" "}
            {dayjs(viewData?.[0]?.DATE).format("MMMM D, YYYY")}
          </Typography>
          <IconButton onClick={handleViewClose} sx={{ color: "common.white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <DailyTablev2
            data={viewData}
            onClose={handleViewClose}
            sx={{ border: "none" }}
          />
        </DialogContent>
      </Dialog>

      <CommentsDialog
        open={openCommentDialog}
        onClose={handleCommentDialogClose}
        comments={comments}
        formatDate={formatDate}
      />
    </Box>
  );
}

export default DailyTable;

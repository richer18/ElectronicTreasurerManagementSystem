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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import { format, parseISO } from "date-fns";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../../api/axiosInstance";
import CommentsDialog from "../../RPT/TableData/CommentsDialog";
import DailyTablev2 from "./components/Table/DailyTable";
import { useMaterialUIController } from "../../../../../context";

// Styled components
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
  textAlign: "right",
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const CenteredTableCell = styled(TableCell)({
  textAlign: "center",
});

// Month and Year options
const months = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const years = Array.from({ length: 10 }, (_, i) => ({
  label: `${new Date().getFullYear() - i}`,
  value: new Date().getFullYear() - i,
}));

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

function DailyTable({ onDataFiltered, onBack, initialMonth, initialYear }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const uiColors = useMemo(
    () => ({
      navy: darkMode ? "#4f7bb5" : "#0f2747",
      navyHover: darkMode ? "#3f6aa3" : "#0b1e38",
      bg: darkMode ? "#0f1117" : "#f5f7fb",
    }),
    [darkMode]
  );
  const [data, setData] = useState([]);
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || String(currentYear ? new Date().getMonth() + 1 : ""));
  const [selectedYear, setSelectedYear] = useState(initialYear || String(currentYear));
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewData, setViewData] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [openCommentDialog, setOpenCommentDialog] = useState(false);

  // Fetch data when the component mounts & when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("allDataTrustFund", {
          params: { month: selectedMonth, year: selectedYear },
        });

        setData(response.data);

        if (onDataFiltered) {
          onDataFiltered(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear, onDataFiltered]);

  const handleViewClick = () => {
    if (!currentRow?.DATE) {
      console.error("Current row or date is not defined.");
      return;
    }

    const formattedDate = dayjs(currentRow.DATE).format("YYYY-MM-DD");

    axiosInstance
      .get("viewalldataTrustFundTableView", {
        params: { date: formattedDate },
      })
      .then((response) => {
        const numericFields = [
          "BUILDING_PERMIT_FEE",
          "LOCAL_80_PERCENT",
          "TRUST_FUND_15_PERCENT",
          "NATIONAL_5_PERCENT",
          "ELECTRICAL_FEE",
          "ZONING_FEE",
          "LIVESTOCK_DEV_FUND",
          "LOCAL_80_PERCENT_LIVESTOCK",
          "NATIONAL_20_PERCENT",
          "DIVING_FEE",
          "LOCAL_40_PERCENT_DIVE_FEE",
          "BRGY_30_PERCENT",
          "FISHERS_30_PERCENT",
          "TOTAL",
        ];

        const transformedData = response.data.map((item) => {
          const updatedItem = { ...item };

          for (const field of numericFields) {
            updatedItem[field] = item[field]?.toString() || "0";
          }

          return updatedItem;
        });

        setViewData(transformedData);
        setViewOpen(true);
      })
      .catch((error) => {
        console.error("Error fetching detailed view data:", error);
      });
  };

  const handleViewClose = () => {
    setViewOpen(false);
  };

  // Handle month selection
  const handleMonthChange = (_, value) => {
    setSelectedMonth(value ? String(value.value) : String(new Date().getMonth() + 1));
  };

  // Handle year selection
  const handleYearChange = (_, value) => {
    setSelectedYear(value ? String(value.value) : String(currentYear));
  };

  const handleClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setCurrentRow(row); // Set the current row correctly
  };

  const handleViewComments = async (date) => {
    try {
      const response = await axiosInstance.get(`getTFComments/${date}`);

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
    const fetchCommentCounts = async () => {
      try {
        const response = await axiosInstance.get("commentTFCounts");
        setCommentCounts(response.data);
      } catch (error) {
        console.error("Error fetching comment counts:", error);
      }
    };

    fetchCommentCounts();
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const totalAmount = useMemo(() => {
    return data.reduce((total, row) => total + Number(row.TOTAL || 0), 0);
  }, [data]);

  const handleCommentDialogClose = () => {
    setOpenCommentDialog(false);
    setComments([]); // Clear comments when closing
  };
  return (
    <>
      {/* Enhanced Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          mt: 2,
          mb: 4,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "1px solid #d6a12b",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
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
            backgroundColor: uiColors.navy,
            boxShadow: "0 4px 10px rgba(15, 39, 71, 0.25)",
            "&:hover": {
              backgroundColor: uiColors.navyHover,
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
            value={
              months.find((m) => String(m.value) === String(selectedMonth)) ||
              null
            }
            sx={{ width: { xs: "100%", sm: 150 } }}
            onChange={handleMonthChange}
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
            value={
              years.find((y) => String(y.value) === String(selectedYear)) ||
              null
            }
            sx={{ width: { xs: "100%", sm: 150 } }}
            onChange={handleYearChange}
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

      {/* Enhanced Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          backgroundColor: (theme) => theme.palette.background.paper,
          "& .MuiTableCell-root": { py: 2 },
        }}
      >
        <Table aria-label="daily data table">
          <TableHead>
            <StyledTableRow>
              {[
                "DATE",
                "Building",
                "Electrical Fee",
                "Zoning Fee",
                "Livestock Dev. Fund",
                "Diving Fee",
                "TOTAL",
                "COMMENTS",
                "ACTION",
              ].map((header) => (
                <StyledTableCell key={header}>{header}</StyledTableCell>
              ))}
            </StyledTableRow>
          </TableHead>

          <TableBody>
            {data.map((row, index) => (
              <StyledTableRow key={row.id || index}>
                <CenteredTableCell>
                  {dayjs(row.DATE).format("MMM D, YYYY")}
                </CenteredTableCell>

                {[
                  "BUILDING_PERMIT_FEE",
                  "ELECTRICAL_FEE",
                  "ZONING_FEE",
                  "LIVESTOCK_DEV_FUND",
                  "DIVING_FEE",
                  "TOTAL",
                ].map((field) => (
                  <CenteredTableCell key={field}>
                    {Number(row[field] || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </CenteredTableCell>
                ))}

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
                        handleViewComments(dayjs(row.DATE).format("YYYY-MM-DD"))
                      }
                    >
                      <VisibilityIcon sx={{ color: uiColors.navy }} />
                    </IconButton>
                  </Badge>
                </CenteredTableCell>

                <CenteredTableCell>
                  <Button
                    variant="contained"
                    onClick={(event) => handleClick(event, row)}
                    sx={{
                      textTransform: "none",
                      backgroundColor: uiColors.navy,
                      "&:hover": { backgroundColor: uiColors.navyHover },
                    }}
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
                        sx: { boxShadow: "none" }, // Ensures no shadow
                      },
                    }}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
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
              <RightAlignedTableCell>
                <Typography fontWeight="bold">
                  {totalAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </RightAlignedTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Dialog */}
      <Dialog
        open={viewOpen}
        onClose={handleViewClose}
        fullWidth
        maxWidth="xl"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: "hidden",
            },
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
    </>
  );
}

DailyTable.propTypes = {
  initialMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onDataFiltered: PropTypes.func,
  onBack: PropTypes.func.isRequired,
};

export default DailyTable;

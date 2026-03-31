import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import axiosInstance from "../../../../../api/axiosInstance";

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



// Helper function to format currency
const formatCurrency = (value) => {
  return value > 0
    ? `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : '₱0.00'; // Changed to display '₱0.00' instead of empty string
};


// Initial state for the data
const initialState = {
  manufacturing: 0,
  distributor: 0,
  retailing: 0,
  financial: 0,
  otherBusinessTax: 0,
  sandGravel: 0,
  finesPenalties: 0,
  mayorsPermit: 0,
  weighsMeasure: 0,
  tricycleOperators: 0,
  occupationTax: 0,
  certOfOwnership: 0,
  certOfTransfer: 0,
  cockpitProvShare: 0,
  cockpitLocalShare: 0,
  dockingMooringFee: 0,
  sultadas: 0,
  miscellaneousFee: 0,
  regOfBirth: 0,
  marriageFees: 0,
  burialFees: 0,
  correctionOfEntry: 0,
  fishingPermitFee: 0,
  saleOfAgriProd: 0,
  saleOfAcctForm: 0,
  waterFees: 0,
  stallFees: 0,
  cashTickets: 0,
  slaughterHouseFee: 0,
  rentalOfEquipment: 0,
  docStamp: 0,
  policeReportClearance: 0,
  secretaryfee: 0,
  medDentLabFees: 0,
  garbageFees: 0,
  cuttingTree: 0,
  total: 0,
};

const findMonthOption = (value) =>
  months.find((option) => option.value === value) || { label: 'January', value: '1' };

const findYearOption = (value) => {
  const currentYear = value || new Date().getFullYear().toString();
  return years.find((option) => option.value === currentYear) || years[0];
};

const mapReportRowToState = (row = {}) => ({
  manufacturing: parseFloat(row.Manufacturing) || 0,
  distributor: parseFloat(row.Distributor) || 0,
  retailing: parseFloat(row.Retailing) || 0,
  financial: parseFloat(row.Financial) || 0,
  otherBusinessTax: parseFloat(row.Other_Business_Tax) || 0,
  sandGravel: parseFloat(row.Sand_Gravel) || 0,
  finesPenalties: parseFloat(row.Fines_Penalties) || 0,
  mayorsPermit: parseFloat(row.Mayors_Permit) || 0,
  weighsMeasure: parseFloat(row.Weighs_Measure) || 0,
  tricycleOperators: parseFloat(row.Tricycle_Operators) || 0,
  occupationTax: parseFloat(row.Occupation_Tax) || 0,
  certOfOwnership: parseFloat(row.Cert_of_Ownership) || 0,
  certOfTransfer: parseFloat(row.Cert_of_Transfer) || 0,
  cockpitProvShare: parseFloat(row.Cockpit_Prov_Share) || 0,
  cockpitLocalShare: parseFloat(row.Cockpit_Local_Share) || 0,
  dockingMooringFee: parseFloat(row.Docking_Mooring_Fee) || 0,
  sultadas: parseFloat(row.Sultadas) || 0,
  miscellaneousFee: parseFloat(row.Miscellaneous_Fee) || 0,
  regOfBirth: parseFloat(row.Reg_of_Birth) || 0,
  marriageFees: parseFloat(row.Marriage_Fees) || 0,
  burialFees: parseFloat(row.Burial_Fees) || 0,
  correctionOfEntry: parseFloat(row.Correction_of_Entry) || 0,
  fishingPermitFee: parseFloat(row.Fishing_Permit_Fee) || 0,
  saleOfAgriProd: parseFloat(row.Sale_of_Agri_Prod) || 0,
  saleOfAcctForm: parseFloat(row.Sale_of_Acct_Form) || 0,
  waterFees: parseFloat(row.Water_Fees) || 0,
  stallFees: parseFloat(row.Stall_Fees) || 0,
  cashTickets: parseFloat(row.Cash_Tickets) || 0,
  slaughterHouseFee: parseFloat(row.Slaughter_House_Fee) || 0,
  rentalOfEquipment: parseFloat(row.Rental_of_Equipment) || 0,
  docStamp: parseFloat(row.Doc_Stamp) || 0,
  policeReportClearance: parseFloat(row.Police_Report_Clearance) || 0,
  secretaryfee: parseFloat(row.Secretaries_Fee) || 0,
  medDentLabFees: parseFloat(row.Med_Dent_Lab_Fees) || 0,
  garbageFees: parseFloat(row.Garbage_Fees) || 0,
  cuttingTree: parseFloat(row.Cutting_Tree) || 0,
  total: parseFloat(row.total) || 0,
});

function ReportTable({ onBack, initialMonth, initialYear, onLoadingChange }) {
  const [month, setMonth] = useState(
    () => findMonthOption(initialMonth)
  );
  const [year, setYear] = useState(() => findYearOption(initialYear));
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMonth) {
      setMonth((currentMonth) => (
        currentMonth.value === initialMonth ? currentMonth : findMonthOption(initialMonth)
      ));
    }
  }, [initialMonth]);

  useEffect(() => {
    if (initialYear) {
      setYear((currentYear) => (
        currentYear.value === initialYear ? currentYear : findYearOption(initialYear)
      ));
    }
  }, [initialYear]);
  
  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      if (!month?.value || !year?.value) {
        return;
      }

      setLoading(true);
      onLoadingChange?.(true);
      try {
        const response = await axiosInstance.get("generalFundDataReport", {
          params: {
            month: month.value,
            year: year.value
          }
        });

        if (!active) {
          return;
        }

        if (response.data.length > 0) {
          setData(mapReportRowToState(response.data[0]));
        } else {
          console.warn('No data available for selected month and year');
          setData(initialState);
        }
      } catch (error) {
        if (!active) {
          return;
        }
        console.error('Error fetching data:', error);
        console.log('Failed to fetch data. Please try again.');
        setData(initialState);
      } finally {
        if (!active) {
          return;
        }
        setLoading(false);
        onLoadingChange?.(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [month.value, year.value]);

  const handleMonthChange = (event, value) => {
    setMonth(value || { label: 'January', value: '1' });
  };

  const handleYearChange = (event, value) => {
    const currentYear = new Date().getFullYear().toString();
    setYear(value || years.find((option) => option.value === currentYear) || years[0]);
  };

  const reportTotal = Number(data.total || 0);
  const reportMunicipalTotal = reportTotal - Number(data.cockpitProvShare || 0);

// Inject print-specific styles
React.useEffect(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    @media print {
      @page {
        size: 8.5in 13in portrait; /* Legal size, adjust to '8.5in 11in' for letter */
        margin: 10mm; /* Increased margin for better readability */
      }
      body * {
        visibility: hidden; /* Hide everything except the printable area */
      }
      #printableArea, #printableArea * {
        visibility: visible;
      }
      #printableArea {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%; /* Use full width of the page */
      }
      table {
        width: 100%; /* Ensure table spans the full width */
        border-collapse: collapse;
        font-family: Arial, sans-serif; /* Use a standard font */
        font-size: 10px; /* Adjust font size for readability */
      }
      th, td {
        border: 1px solid black;
        padding: 6px; /* Slightly increase padding for better spacing */
        text-align: center;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
        font-size: 11px; /* Slightly larger for headers */
      }
      h6, .subtitle {
        font-size: 12px;
        text-align: center;
        font-weight: bold;
        margin: 6px 0;
        font-family: Arial, sans-serif;
      }
      tr {
        page-break-inside: avoid; /* Prevent rows from splitting across pages */
      }
      /* Adjust column widths */
      th:nth-child(1), td:nth-child(1) { width: 18%; }
      th:nth-child(2), td:nth-child(2) { width: 14%; }
      th:nth-child(3), td:nth-child(3) { width: 10%; }
      th:nth-child(4), td:nth-child(4) { width: 9%; }
      th:nth-child(5), td:nth-child(5) { width: 9%; }
      th:nth-child(6), td:nth-child(6) { width: 9%; }
      th:nth-child(7), td:nth-child(7) { width: 9%; }
      th:nth-child(8), td:nth-child(8) { width: 9%; }
      th:nth-child(9), td:nth-child(9) { width: 9%; }
      th:nth-child(10), td:nth-child(10) { width: 9%; }
      th:nth-child(11), td:nth-child(11) { width: 6%; }
      th:nth-child(12), td:nth-child(12) { width: 6%; }
    }
  `;
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
}, []);

const handlePrint = () => {
  const originalTitle = document.title;
  document.title = `SOC_GeneralFundReport_${month.label}_${year.label}`;
  window.print();
  document.title = originalTitle; // Restore original title
};

const handleDownloadExcel = async () => {
  const ExcelJS = (await import('exceljs')).default;

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Collections Summary');

  // Add title and headers
  worksheet.addRow(['SUMMARY OF COLLECTIONS', '', '', '', '', '', '', '', '', '', '']);
  worksheet.addRow(['ZAMBOANGUITA, NEGROS ORIENTAL', '', '', '', '', '', '', '', '', '', '']);
  worksheet.addRow(['LGU', '', '', '', '', '', '', '', '', '', '']);
  worksheet.addRow([`Month of ${month.label} ${year.value}`, '', '', '', '', '', '', '', '', '', '']);
  worksheet.addRow([]); // Empty row for spacing

  // Add column headers
  worksheet.addRow([
    'SOURCES OF COLLECTIONS',
    'TOTAL COLLECTIONS',
    'NATIONAL',
    'PROVINCIAL',
    '',
    '',
    'MUNICIPAL',
    '',
    '',
    '',
    'BARANGAY SHARE',
    'FISHERIES'
  ]);

  worksheet.addRow([
    '',
    '',
    '',
    'GENERAL FUND',
    'SPECIAL EDUC FUND',
    'TOTAL',
    'GENERAL FUND',
    'SPECIAL EDUC FUND',
    'TRUST FUND',
    'TOTAL',
    '',
    ''
  ]);

  // Format currency with P prefix and proper formatting
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0.00';
    if (typeof value === 'string' && value.includes('/')) return value;
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Add data rows from your data object
  const addDataRow = (label, value, provincialValue = null) => {
    const municipalValue = provincialValue ? value - provincialValue : value;
    
    worksheet.addRow([
      label,
      formatCurrency(value),
      '', // National
      provincialValue !== null ? formatCurrency(provincialValue) : '', // Provincial General Fund
      '', // Provincial Special Educ Fund
      '', // Provincial Total
      provincialValue !== null ? formatCurrency(municipalValue) : formatCurrency(value), // Municipal General Fund
      '', // Municipal Special Educ Fund
      '', // Municipal Trust Fund
      provincialValue !== null ? formatCurrency(municipalValue) : formatCurrency(value), //Total
      '', // Barangay Share
      ''  // Fisheries
    ]);
  };

  // Add all data rows with proper formatting
  addDataRow('Manufacturing', data.manufacturing);
  addDataRow('Distributor', data.distributor);
  addDataRow('Retailing', data.retailing);
  addDataRow('Banks & Other Financial Int.', data.financial);
  addDataRow('Other Business Tax', data.otherBusinessTax);
  addDataRow('Sand & Gravel', data.sandGravel);
  addDataRow('Fines & Penalties', data.finesPenalties);
  addDataRow('Mayor\'s Permit', data.mayorsPermit);
  addDataRow('Weights & Measures', data.weighsMeasure);
  addDataRow('Tricycle Permit Fee', data.tricycleOperators);
  addDataRow('Occupation Tax', data.occupationTax);
  addDataRow('Cert. of Ownership', data.certOfOwnership);
  addDataRow('Cert. of Transfer', data.certOfTransfer);
  
  // Special handling for Cockpit Share (split between provincial and municipal)
  if (data.cockpitProvShare || data.cockpitLocalShare) {
    const totalCockpit = (data.cockpitProvShare || 0) + (data.cockpitLocalShare || 0);
    addDataRow('Cockpit Share', totalCockpit, data.cockpitProvShare);
  } else {
    addDataRow('Cockpit Share', 0);
  }
  
  addDataRow('Docking and Mooring Fee', data.dockingMooringFee);
  addDataRow('Sultadas', data.sultadas);
  addDataRow('Miscellaneous', data.miscellaneousFee);
  addDataRow('Registration of Birth', data.regOfBirth);
  addDataRow('Marriage Fees', data.marriageFees);
  addDataRow('Burial Fees', data.burialFees);
  addDataRow('Correction of Entry', data.correctionOfEntry);
  addDataRow('Fishing Permit Fee', data.fishingPermitFee);
  addDataRow('Sale of Agri. Prod.', data.saleOfAgriProd);
  addDataRow('Sale of Acc. Forms', data.saleOfAcctForm);
  addDataRow('Water Fees', data.waterFees);
  addDataRow('Market Stall Fee', data.stallFees);
  addDataRow('Cash Tickets', data.cashTickets);
  addDataRow('Slaughterhouse Fee', data.slaughterHouseFee);
  addDataRow('Rent of Equipment', data.rentalOfEquipment);
  addDataRow('Doc Stamp Tax', data.docStamp);
  addDataRow(
    'Secretary Fees',
    (data.policeReportClearance || 0) + (data.secretaryfee || 0)
  );
  addDataRow('Med./Lab. Fees', data.medDentLabFees);
  addDataRow('Garbage Fees', data.garbageFees);
  addDataRow('Cutting Tree', data.cuttingTree);

  const total = reportTotal;
  const municipalTotal = reportMunicipalTotal;

  // Add totals row
  worksheet.addRow([
    'TOTAL',
    formatCurrency(total),
    '', // National
    formatCurrency(data.cockpitProvShare || 0), // Provincial General Fund
    '', // Provincial Special Educ Fund
    '', // Provincial Total
    formatCurrency(municipalTotal), // Municipal General Fund
    '', // Municipal Special Educ Fund
    '', // Municipal Trust Fund
    formatCurrency(municipalTotal), // Municipal Total
    '', // Barangay Share
    ''  // Fisheries
  ]);

  // Merge header cells
  worksheet.mergeCells('A1:L1');
  worksheet.mergeCells('A2:L2');
  worksheet.mergeCells('A3:L3');
  worksheet.mergeCells('A4:L4');
  worksheet.mergeCells('A6:A7');
  worksheet.mergeCells('B6:B7');
  worksheet.mergeCells('C6:C7');
  worksheet.mergeCells('D6:F6'); // Provincial
  worksheet.mergeCells('G6:J6'); // Municipal
  worksheet.mergeCells('K6:K7');
  worksheet.mergeCells('L6:L7');

  // Style headers
  const headerStyles = {
    font: { bold: true },
    alignment: { horizontal: 'center' }
  };

  worksheet.getRow(1).font = { bold: true, size: 16 };
  worksheet.getRow(2).font = { bold: true, size: 14 };
  worksheet.getRow(6).eachCell(cell => Object.assign(cell, headerStyles));
  worksheet.getRow(7).eachCell(cell => Object.assign(cell, headerStyles));
  
  // Style totals row (last row)
  const lastRow = worksheet.lastRow;
  lastRow.eachCell(cell => {
    cell.font = { bold: true };
    if ([2, 4, 6, 7].includes(cell.col)) { // Columns with currency values
      cell.numFmt = '#,##0.00';
    }
  });

  // Set column widths
  worksheet.columns = [
    { width: 30 }, // SOURCES OF COLLECTIONS
    { width: 15 }, // TOTAL COLLECTIONS
    { width: 12 }, // NATIONAL
    { width: 15 }, // PROVINCIAL GENERAL FUND
    { width: 15 }, // PROVINCIAL SPECIAL EDUC FUND
    { width: 12 }, // PROVINCIAL TOTAL
    { width: 15 }, // MUNICIPAL GENERAL FUND
    { width: 15 }, // MUNICIPAL SPECIAL EDUC FUND
    { width: 12 }, // MUNICIPAL TRUST FUND
    { width: 12 }, // MUNICIPAL TOTAL
    { width: 15 }, // BARANGAY SHARE
    { width: 12 }  // FISHERIES
  ];

  // Generate Excel file
workbook.xlsx.writeBuffer().then(buffer => {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  // Dynamic file name using selected month and year
  const fileName = `Summary_of_Collections_${month.label}_${year.value}.xlsx`;

  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
});
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

        <Box display="flex" gap={2} flexWrap="wrap">
          <Autocomplete
            disablePortal
            id="month-selector"
            options={months}
            sx={{
              width: 180,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleMonthChange}
            value={month}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Month"
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
              width: 180,
              "& .MuiInputBase-root": { borderRadius: "8px" },
            }}
            onChange={handleYearChange}
            value={year}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Year"
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

      {loading ? (
        <Paper
          sx={{
            p: 6,
            borderRadius: 3,
            border: "1px solid #d6a12b",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            minHeight: 420,
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ color: "#0f2747", fontWeight: 700 }}>
            Loading financial report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while the General Fund report is prepared.
          </Typography>
        </Paper>
      ) : (
      <div id="printableArea">
    <Box>
            <Box>
        <Grid container justifyContent="center" alignItems="center" spacing={0} direction="column" mb={2}>
          <Grid>
            <Typography variant="h6" fontWeight="bold" align="center">
              SUMMARY OF COLLECTIONS
            </Typography>
          </Grid>
          <Grid>
            <Typography variant="subtitle1" fontWeight="bold" align="center">
              ZAMBOANGUITA, NEGROS ORIENTAL
            </Typography>
          </Grid>
          <Grid>
            <Typography variant="body1" fontStyle="bold" align="center">
              LGU
            </Typography>
          </Grid>
          <Grid>
            <Typography variant="body2" fontStyle="bold" align="center">
              Month of {month.label} {year.label}
            </Typography>
          </Grid>
        </Grid>
        <TableContainer component={Paper}>
          <Table sx={{ border: '1px solid black' }}>
            <TableHead>
              {/*First Row*/}
              <TableRow>
                <TableCell
                rowSpan={2}
                align="center"
                sx={{ border: '1px solid black', fontWeight: 'bold' }}>
                  SOURCES OF COLLECTIONS
                  </TableCell>
                  
                  <TableCell
                  rowSpan={2}
                  align="center"
                  sx={{ border: '1px solid black', fontWeight: 'bold' }}>
                    
                    TOTAL COLLECTIONS
        </TableCell>
        <TableCell
          rowSpan={2}
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          NATIONAL
        </TableCell>
        <TableCell
          colSpan={3}
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          PROVINCIAL
        </TableCell>
        <TableCell
          colSpan={4}
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          MUNICIPAL
        </TableCell>
        <TableCell
          rowSpan={2}
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          BARANGAY SHARE
        </TableCell>
        <TableCell
          rowSpan={2}
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          FISHERIES
        </TableCell>
      </TableRow>
      {/* Second Row */}
      <TableRow>
        <TableCell
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          GENERAL FUND
        </TableCell>
        <TableCell
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          SPECIAL EDUC. FUND
        </TableCell>
        <TableCell
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          TOTAL
        </TableCell>
        <TableCell
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          GENERAL FUND
        </TableCell>
        <TableCell
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          SPECIAL EDUC. FUND
        </TableCell>
        <TableCell
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          TRUST FUND
        </TableCell>
        <TableCell
          align="center"
          sx={{ border: '1px solid black', fontWeight: 'bold' }}
        >
          TOTAL
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
  {/* Manufacturing */}
  <TableRow>
    <TableCell align="left" sx={{ border: '1px solid black' }}>Manufacturing</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.manufacturing || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.manufacturing || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.manufacturing || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>
  {/* Distributor */}
  <TableRow>
    <TableCell align="left" sx={{ border: '1px solid black' }}>Distributor</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.distributor || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.distributor || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.distributor || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>
  {/* Retailing */}
  <TableRow>
    <TableCell align="left" sx={{ border: '1px solid black' }}>Retailing</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.retailing || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.retailing || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.retailing || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>
  {/*Banks & Other Financial Int. */}
  <TableRow>
    <TableCell align="left" sx={{ border: '1px solid black' }}>Banks & Other Financial Int.</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.financial || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.financial || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.financial || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>
  <TableRow>
    {/*Other Business Tax */}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Other Business Tax</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.otherBusinessTax || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.otherBusinessTax || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.otherBusinessTax || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>
  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Sand & Gravel</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.sandGravel || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.sandGravel || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.sandGravel || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Fines & Penalties</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.finesPenalties || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.finesPenalties || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.finesPenalties || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Mayor's Permit</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.mayorsPermit || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.mayorsPermit || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.mayorsPermit || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Weight & Measure</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.weighsMeasure || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.weighsMeasure || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.weighsMeasure || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Tricycle Permit Fee</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.tricycleOperators || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.tricycleOperators || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.tricycleOperators || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Occupation Tax</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.occupationTax || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.occupationTax || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.occupationTax || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Cert. of Ownership</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.certOfOwnership || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.certOfOwnership || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.certOfOwnership || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Cert. of Transfer</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.certOfTransfer || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.certOfTransfer  || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.certOfTransfer || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
  <TableCell align="left" sx={{ border: '1px solid black' }}>Cockpit Share</TableCell>
  <TableCell sx={{ border: '1px solid black' }} align="center">
    {formatCurrency((data.cockpitProvShare || 0) + (data.cockpitLocalShare || 0))} {/* TOTAL COLLECTIONS */}
  </TableCell>
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
  <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cockpitProvShare || 0)}</TableCell> {/* PROVINCIAL GENERAL FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
  <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cockpitLocalShare || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cockpitLocalShare || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
</TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Docking and Mooring Fee</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.dockingMooringFee || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.dockingMooringFee || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.dockingMooringFee || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Sultadas</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.sultadas || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.sultadas || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.sultadas || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Miscellaneous</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.miscellaneousFee || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.miscellaneousFee || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.miscellaneousFee || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Registration of Birth</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.regOfBirth || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.regOfBirth || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.regOfBirth || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Marriage Fee</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.marriageFees || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.marriageFees || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.marriageFees || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Burial Fee</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.burialFees || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.burialFees || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.burialFees || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Correction of Entry</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.correctionOfEntry || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.correctionOfEntry || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.correctionOfEntry || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Fishing Permit Fee</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.fishingPermitFee || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.fishingPermitFee || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{data.fishingPermitFee}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Sale of Agri. Prod.</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.saleOfAgriProd || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.saleOfAgriProd || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.saleOfAgriProd || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Sale of Acct. Forms</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.saleOfAcctForm || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.saleOfAcctForm || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.saleOfAcctForm || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Water Fee</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.waterFees || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.waterFees || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.waterFees || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Market Stall Fee</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.stallFees || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.stallFees || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.stallFees || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Cash Tickets</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cashTickets || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cashTickets || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cashTickets || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>SlaughterHouse Fee</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.slaughterHouseFee || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.slaughterHouseFee || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.slaughterHouseFee || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Rental of Equipment</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.rentalOfEquipment || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.rentalOfEquipment || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.rentalOfEquipment || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Doc Stamp Tax</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.docStamp || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.docStamp || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.docStamp || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Secretary Fees</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center"> {formatCurrency((data.policeReportClearance || 0) +(data.secretaryfee || 0))}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency((data.policeReportClearance || 0) +(data.secretaryfee || 0))}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency((data.policeReportClearance || 0) +(data.secretaryfee || 0))}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Med./Lab. Fees</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.medDentLabFees || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.medDentLabFees || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.medDentLabFees || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Garbage Fees</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.garbageFees || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.garbageFees || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.garbageFees || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  <TableRow>
    {/*Fines & Penalties*/}
    <TableCell align="left" sx={{ border: '1px solid black' }}>Cutting Tree</TableCell>
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cuttingTree || 0)}</TableCell> {/* TOTAL COLLECTIONS */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* NATIONAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* PROVINCIAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cuttingTree || 0)}</TableCell> {/* MUNICIPAL GENERAL FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL SPECIAL EDUC. FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* MUNICIPAL TRUST FUND */}
    <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cuttingTree || 0)}</TableCell> {/* MUNICIPAL TOTAL */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* BARANGAY SHARE */}
    <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* FISHERIES */}
  </TableRow>

  {/* OVERALL TOTAL */}
  <TableRow>
  <TableCell align="left" sx={{ border: '1px solid black' }}>TOTAL</TableCell>
  <TableCell sx={{ border: '1px solid black' }} align="center">
    {formatCurrency(reportTotal)}
  </TableCell>
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* TOTAL NATIONAL */}
  <TableCell sx={{ border: '1px solid black' }} align="center">{formatCurrency(data.cockpitProvShare || 0)}</TableCell> {/* TOTAL PROVINCIAL GENERAL FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* TOTAL PROVINCIAL SPECIAL EDUC. FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* TOTAL PROVINCIAL TOTAL */}
  <TableCell sx={{ border: '1px solid black' }} align="center">
    {formatCurrency(reportMunicipalTotal)}
  </TableCell> {/* TOTAL MUNICIPAL GENERAL FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* TOTAL MUNICIPAL SPECIAL EDUC. FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* TOTAL MUNICIPAL TRUST FUND */}
  <TableCell sx={{ border: '1px solid black' }} align="center">
    {formatCurrency(reportMunicipalTotal)}
  </TableCell> {/* TOTAL MUNICIPAL TOTAL */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* TOTAL BARANGAY SHARE */}
  <TableCell sx={{ border: '1px solid black' }} align="center"></TableCell> {/* TOTAL FISHERIES */}
</TableRow>

</TableBody>
  </Table>
</TableContainer>
</Box>
      </Box>
      </div>
      )}
       {/* Printable Area Ends Here */}


            {/* Print Button */}
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
                onClick={handlePrint}
                disabled={loading}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textTransform: "none",
                  borderRadius: "10px",
                  padding: "10px 22px",
                  fontWeight: 700,
                  backgroundColor: "#0f2747",
                  boxShadow: "0 4px 10px rgba(15, 39, 71, 0.25)",
                  "&:hover": {
                    backgroundColor: "#0b1e38",
                    boxShadow: "0 6px 14px rgba(15, 39, 71, 0.35)",
                  },
                }}
                startIcon={<PrintIcon />}
              >
                PRINT
              </Button>

              <Button
                variant="outlined"
                onClick={handleDownloadExcel}
                disabled={loading}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textTransform: "none",
                  borderRadius: "10px",
                  padding: "10px 22px",
                  fontWeight: 700,
                  borderColor: "#0f2747",
                  color: "#0f2747",
                  "&:hover": {
                    borderColor: "#0b1e38",
                    backgroundColor: "rgba(15, 39, 71, 0.08)",
                  },
                }}
                startIcon={<FileDownloadIcon />}
              >
                Download to Excel
              </Button>
            </Box>
    </>
  );
}

ReportTable.propTypes = {
  initialMonth: PropTypes.string,
  initialYear: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onLoadingChange: PropTypes.func,
};

export default ReportTable;

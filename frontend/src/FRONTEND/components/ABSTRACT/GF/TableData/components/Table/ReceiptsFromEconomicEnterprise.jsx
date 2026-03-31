import { Autocomplete, Box, Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import axiosInstance from "../../../../../../../api/axiosInstance";

const formatToPeso = (value) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(value || 0));
};

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

const days = Array.from({ length: 31 }, (_, i) => ({
    label: String(i + 1),
    value: i + 1,
}));

const years = Array.from({ length: 100 }, (_, i) => ({
    label: String(2030 - i),
    value: 2030 - i,
}));

const findMonthOption = (value) =>
    months.find((option) => String(option.value) === String(value)) || null;

const findYearOption = (value) =>
    years.find((option) => String(option.value) === String(value)) || null;

function RegulatoryFees({ initialMonth, initialYear }) {
   const [month, setMonth] = useState(() => findMonthOption(initialMonth));
    const [day, setDay] = useState(null);
    const [year, setYear] = useState(() => findYearOption(initialYear));
    const [availableDays, setAvailableDays] = useState(days);
    const [taxData, setTaxData] = useState([]);
    
    const handleMonthChange = (event, newValue) => setMonth(newValue);
    const handleDayChange = (event, newValue) => setDay(newValue);
    const handleYearChange = (event, newValue) => setYear(newValue);

    useEffect(() => {
        setMonth(findMonthOption(initialMonth));
    }, [initialMonth]);

    useEffect(() => {
        setYear(findYearOption(initialYear));
    }, [initialYear]);
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(
            "general-fund-receipts-from-economic-enterprise-report",
            {
              params: {
                month: month?.value,
                day: day?.value,
                year: year?.value,
              },
            }
          );
          setTaxData(response.data);
        } catch (error) {
          console.error(
            "Error fetching tax data:",
            error.response?.data || error.message
          );
        }
      };

      fetchData();
    }, [month, day, year]);

useEffect(() => {
    if (month && year) {
        const daysInMonth = new Date(year.value, month.value, 0).getDate();
        setAvailableDays(
        Array.from({ length: daysInMonth }, (_, i) => ({
            label: String(i + 1),
            value: i + 1,
        }))
    );
    }
}, [month, year]);



const handleDownload = () => {
    // Convert table data to CSV
    const csvData = [];
    csvData.push(['Taxes', 'Total']); // Headers
    
    taxData.forEach(row => {
        csvData.push([row.Taxes, row.Total]);
    });

    const csvContent = csvData.map(e => e.join(",")).join("\n");

    // Get the current date and time for the file name
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const fileName = `TOB-${formattedDate}-${formattedTime}.csv`;

    // Create a blob and download it as a CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName); // Use the dynamic file name
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

  return (
     <Box
    sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 2,
            width: '100%',
        }}
        >
            <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
            >
                <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
                <Grid item sx={{ ml: 'auto' }}>
                <Autocomplete
                disablePortal
                id="month-selector"
                options={months}
                sx={{ width: 150, mr: 2 }}
                onChange={handleMonthChange}
                value={month}
                renderInput={(params) => <TextField {...params} label="Month" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                />
                </Grid>

                <Grid item sx={{ ml: 'auto' }}>
                <Autocomplete
                disablePortal
                id="day-selector"
                options={availableDays}
                sx={{ width: 150, mr: 2 }}
                onChange={handleDayChange}
                renderInput={(params) => <TextField {...params} label="Day" />}
                value={day ? { label: String(day.value), value: day.value } : null}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                disabled={!availableDays.length}
                />
                </Grid>
                <Grid item sx={{ ml: 'auto' }}>
                <Autocomplete
                disablePortal
                id="year-selector"
                options={years}
                sx={{ width: 150 }}
                onChange={handleYearChange}
                value={year}
                renderInput={(params) => <TextField {...params} label="Year" />}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                />
                </Grid>
                <Grid item sx={{ ml: 'auto' }}>
                <Button 
                variant="contained"
                color="primary"
                onClick={handleDownload}
                sx={{ height: '40px' }} // Ensure consistent height with TextField components
                >
                    Download
                </Button>
                </Grid>
                </Grid>
                </Box>
                
                
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Taxes</TableCell>
                                <TableCell align="right">Total</TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                    {taxData.length > 0 ? (
                                        taxData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.Taxes}</TableCell>
                                            <TableCell align="right"> {formatToPeso(row.Total)}</TableCell>
                                            </TableRow>
                                            ))
                                        ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center">No data available</TableCell>
                                            </TableRow>
                                        )}
                                        </TableBody>
                                        </Table>
                                        </TableContainer>
                                        </Box>
                                        );
}

RegulatoryFees.propTypes = {
    initialMonth: PropTypes.string,
    initialYear: PropTypes.string,
};

export default RegulatoryFees

import { Avatar, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
};

function TrustFund({ data }) {
  const visibleRows = data.filter((row) => Number(row.AMOUNT || 0) !== 0);
  const headerRow = visibleRows[0] || data[0] || {};
  const overallTotal = visibleRows.reduce((sum, row) => sum + Number(row.AMOUNT || 0), 0);

  return (
    <Paper
      sx={{
        p: 3,
        minWidth: '700px',
        borderRadius: 3,
        border: '1px solid #d8e2ee',
        boxShadow: '0 10px 25px rgba(12, 37, 70, 0.08)',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
      }}
    >
      <Box
        sx={{
          mb: 2.5,
          p: 2,
          borderRadius: 2.5,
          background: 'linear-gradient(135deg, #f2f7ff, #eef4fb)',
          border: '1px solid #d9e6f5',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ bgcolor: '#0f2747', width: 30, height: 30, fontSize: 13 }}>D</Avatar>
          <Typography variant="body1" fontWeight={700} sx={{ color: '#0f2747' }}>
            DATE: <Box component="span" sx={{ fontWeight: 500 }}>{formatDate(headerRow.DATE)}</Box>
          </Typography>
        </Box>
        <Typography variant="body1" fontWeight={700} sx={{ color: '#0f2747' }}>
          NAME: <Box component="span" sx={{ fontWeight: 500 }}>{headerRow.NAME || '-'}</Box>
        </Typography>
      </Box>

      <TableContainer sx={{ borderRadius: 2, border: '1px solid #d8e2ee', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#0f2747' }}>
              <TableCell sx={{ fontWeight: 700, width: '70px', color: '#fff' }}></TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#fff', letterSpacing: '0.3px' }}>DESCRIPTION</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right', color: '#fff', letterSpacing: '0.3px' }}>AMOUNT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row, index) => (
                <TableRow
                  key={`${row.DESCRIPTION}-${index}`}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: '#f8fbff' },
                    '&:hover': { backgroundColor: '#edf4ff' },
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#0f2747' }}>{index + 1}.</TableCell>
                  <TableCell sx={{ color: '#1e2f45' }}>{row.DESCRIPTION || '-'}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 700, color: '#0f2747' }}>
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                      minimumFractionDigits: 2,
                    }).format(Number(row.AMOUNT || 0))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          p: 1.5,
          borderRadius: 2,
          backgroundColor: '#eef5ff',
          border: '1px solid #d2e2fb',
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: '#0f2747' }}>
          Total:{' '}
          {new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
          }).format(overallTotal)}
        </Typography>
      </Box>
    </Paper>
  );
}

TrustFund.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      DATE: PropTypes.string,
      NAME: PropTypes.string,
      DESCRIPTION: PropTypes.string,
      AMOUNT: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
};

export default TrustFund;

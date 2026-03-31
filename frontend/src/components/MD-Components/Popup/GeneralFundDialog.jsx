import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, CircularProgress, Tooltip, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import GeneralFundAllTable from '../../../FRONTEND/components/ABSTRACT/GF/TableData/GeneralFundAllTable';

function GeneralFundDialog({ open, onClose, data }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchViewRows = async () => {
      const paymentId = data?.payment_id ?? data?.id;

      if (!open || !paymentId) {
        setRows([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`generalFundPaymentView/${paymentId}`);
        setRows(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching view details:', error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchViewRows();
  }, [open, data]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth PaperProps={{
      sx: {
        width: '90vw',
        maxWidth: 'none',
        borderRadius: 3,
        overflow: 'hidden',
      }
    }}>
      <DialogTitle
        sx={{
          color: '#fff',
          background: 'linear-gradient(135deg, #0f2747, #2f4f7f)',
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              General Fund View
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Payment details breakdown
            </Typography>
          </Box>
          <Button onClick={onClose} color="secondary">
            <Tooltip title="Close">
              <CloseIcon fontSize="large"/>
            </Tooltip>
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ overflowX: 'auto', p: 3, backgroundColor: '#f4f7fb' }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <GeneralFundAllTable data={rows} />
        )}
      </DialogContent>
    </Dialog>
  );
}

GeneralFundDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,  // Define the type based on your data structure
};

export default GeneralFundDialog;

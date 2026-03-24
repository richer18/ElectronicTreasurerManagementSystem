import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import TrustFundAllTable from "../../../FRONTEND/components/ABSTRACT/TF/TableData/TrustFunAllTable";

function TrustFundDialog({ paymentId }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchRows = async () => {
            if (!paymentId) {
                if (isMounted) {
                    setRows([]);
                    setLoading(false);
                    setError('Payment ID is missing.');
                }
                return;
            }

            try {
                setLoading(true);
                setError('');
                const response = await axiosInstance.get(`trustFundPaymentView/${paymentId}`);

                if (isMounted) {
                    setRows(Array.isArray(response.data) ? response.data : []);
                }
            } catch (fetchError) {
                if (isMounted) {
                    setError(fetchError.response?.data?.error || 'Failed to load trust fund details.');
                    setRows([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRows();

        return () => {
            isMounted = false;
        };
    }, [paymentId]);

    if (loading) {
        return (
            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                    Loading trust fund details...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return <TrustFundAllTable data={rows} />;
}

TrustFundDialog.propTypes = {
    paymentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default TrustFundDialog;

import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import TrustFundReport from "../../../../../FRONTEND/components/ABSTRACT/TF/TableData/components/Table/TotalTrustFund";

function TrustFundDialogPopupTOTAL({ open, onClose, month, year }) {
  return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Total Trust Fund Report
          <Button onClick={onClose} color="secondary">
            <Tooltip title="Close">
              <CloseIcon fontSize="large"/>
            </Tooltip>
          </Button>
        </div>
      </DialogTitle>
      <DialogContent>
        <TrustFundReport month={month} year={year} />
      </DialogContent>
    </Dialog>
  )
}

TrustFundDialogPopupTOTAL.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  month: PropTypes.string,
  year: PropTypes.string,
};

export default TrustFundDialogPopupTOTAL

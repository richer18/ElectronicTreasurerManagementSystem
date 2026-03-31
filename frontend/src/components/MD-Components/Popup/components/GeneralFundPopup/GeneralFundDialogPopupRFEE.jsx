import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import GeneralFundReport from "../../../../../FRONTEND/components/ABSTRACT/GF/TableData/components/Table/ReceiptsFromEconomicEnterprise";

function GeneralFundDialogPopup({ open, onClose, month, year }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Receipts from Economic Enterprise Report
          <Button onClick={onClose} color="secondary">
            <Tooltip title="Close">
              <CloseIcon fontSize="large"/>
            </Tooltip>
          </Button>
        </div>
      </DialogTitle>
      <DialogContent>
        <GeneralFundReport initialMonth={month} initialYear={year} />
      </DialogContent>
    </Dialog>
  );
}

GeneralFundDialogPopup.propTypes = {
  month: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  year: PropTypes.string,
};

export default GeneralFundDialogPopup;

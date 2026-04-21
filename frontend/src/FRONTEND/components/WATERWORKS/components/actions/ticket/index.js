import ReceiptIcon from "@mui/icons-material/Receipt";
import PropTypes from "prop-types";
import WaterworksActionButton from "../shared/WaterworksActionButton";

function TicketButton({ uiColors, onClick }) {
  return (
    <WaterworksActionButton
      title="Manage Tickets"
      label="Ticket"
      icon={<ReceiptIcon fontSize="small" />}
      onClick={onClick}
      backgroundColor={uiColors.teal}
      hoverColor={uiColors.tealHover}
    />
  );
}

TicketButton.propTypes = {
  uiColors: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TicketButton;

import { BiSolidReport } from "react-icons/bi";
import PropTypes from "prop-types";
import WaterworksActionButton from "../shared/WaterworksActionButton";

function TicketStatusButton({ uiColors, onClick }) {
  return (
    <WaterworksActionButton
      title="Ticket Status Reports"
      label="Ticket Status"
      icon={<BiSolidReport size={18} />}
      onClick={onClick}
      backgroundColor={uiColors.red}
      hoverColor={uiColors.redHover}
      minWidth="140px"
    />
  );
}

TicketStatusButton.propTypes = {
  uiColors: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TicketStatusButton;

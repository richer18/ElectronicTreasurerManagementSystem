import { MdSummarize } from "react-icons/md";
import PropTypes from "prop-types";
import WaterworksActionButton from "../shared/WaterworksActionButton";

function WaterBillingButton({ uiColors, onClick }) {
  return (
    <WaterworksActionButton
      title="Water Billing Reports"
      label="Water Billing"
      icon={<MdSummarize size={18} />}
      onClick={onClick}
      backgroundColor={uiColors.teal}
      hoverColor={uiColors.tealHover}
      minWidth="138px"
    />
  );
}

WaterBillingButton.propTypes = {
  uiColors: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default WaterBillingButton;

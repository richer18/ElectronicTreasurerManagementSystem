import { IoToday } from "react-icons/io5";
import PropTypes from "prop-types";
import WaterworksActionButton from "../shared/WaterworksActionButton";

function DailyReportButton({ uiColors, onClick }) {
  return (
    <WaterworksActionButton
      title="Generate Daily Report"
      label="Daily Report"
      icon={<IoToday size={16} />}
      onClick={onClick}
      backgroundColor={uiColors.teal}
      hoverColor={uiColors.tealHover}
    />
  );
}

DailyReportButton.propTypes = {
  uiColors: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default DailyReportButton;

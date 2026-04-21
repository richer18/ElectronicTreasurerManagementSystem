import AssessmentIcon from "@mui/icons-material/Assessment";
import PropTypes from "prop-types";
import WaterworksActionButton from "../shared/WaterworksActionButton";

function WaterCardButton({ uiColors, onClick }) {
  return (
    <WaterworksActionButton
      title="Water Card Summary"
      label="Water Card"
      icon={<AssessmentIcon fontSize="small" />}
      onClick={onClick}
      backgroundColor={uiColors.amber}
      hoverColor={uiColors.amberHover}
      minWidth="132px"
    />
  );
}

WaterCardButton.propTypes = {
  uiColors: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default WaterCardButton;

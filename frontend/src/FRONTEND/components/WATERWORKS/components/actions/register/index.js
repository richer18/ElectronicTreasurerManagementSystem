import ReceiptIcon from "@mui/icons-material/Receipt";
import PropTypes from "prop-types";
import WaterworksActionButton from "../shared/WaterworksActionButton";

function RegisterButton({ uiColors, onClick }) {
  return (
    <WaterworksActionButton
      title="Register New Account"
      label="Register"
      icon={<ReceiptIcon fontSize="small" />}
      onClick={onClick}
      backgroundColor={uiColors.steel}
      hoverColor={uiColors.steelHover}
    />
  );
}

RegisterButton.propTypes = {
  uiColors: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default RegisterButton;

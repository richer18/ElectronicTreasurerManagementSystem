import { IoMdAdd } from "react-icons/io";
import PropTypes from "prop-types";
import WaterworksActionButton from "../shared/WaterworksActionButton";

function NewEntryButton({ uiColors, onClick }) {
  return (
    <WaterworksActionButton
      title="Add New Entry"
      label="New Entry"
      icon={<IoMdAdd size={18} />}
      onClick={onClick}
      backgroundColor={uiColors.navy}
      hoverColor={uiColors.navyHover}
    />
  );
}

NewEntryButton.propTypes = {
  uiColors: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default NewEntryButton;

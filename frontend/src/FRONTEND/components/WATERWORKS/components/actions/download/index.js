import { IoMdDownload } from "react-icons/io";
import PropTypes from "prop-types";
import WaterworksActionButton from "../shared/WaterworksActionButton";

function DownloadButton({ uiColors, onClick }) {
  return (
    <WaterworksActionButton
      title="Export Data"
      label="Download"
      icon={<IoMdDownload size={18} />}
      onClick={onClick}
      backgroundColor={uiColors.steel}
      hoverColor={uiColors.steelHover}
      minWidth="120px"
    />
  );
}

DownloadButton.propTypes = {
  uiColors: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default DownloadButton;

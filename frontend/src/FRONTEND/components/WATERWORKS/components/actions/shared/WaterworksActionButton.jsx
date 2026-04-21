import { Button, Tooltip } from "@mui/material";
import PropTypes from "prop-types";

function WaterworksActionButton({
  title,
  label,
  icon,
  onClick,
  backgroundColor,
  hoverColor,
  minWidth = "130px",
}) {
  return (
    <Tooltip title={title} arrow>
      <Button
        variant="contained"
        startIcon={icon}
        onClick={onClick}
        sx={{
          px: 3.5,
          minWidth,
          height: "44px",
          borderRadius: "10px",
          textTransform: "none",
          fontSize: 15,
          fontWeight: 600,
          color: "white",
          backgroundColor,
          "&:hover": {
            backgroundColor: hoverColor,
            transform: "translateY(-1px)",
          },
        }}
      >
        {label}
      </Button>
    </Tooltip>
  );
}

WaterworksActionButton.propTypes = {
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
  minWidth: PropTypes.string,
};

export default WaterworksActionButton;

import React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import makeStyles from '@mui/styles/makeStyles';

interface INumberPickerProps {
  number: number;
  setNumber: (number: number) => void;
  maxNum: number;
}

const useStyles = makeStyles((theme) => ({
  popover: {
    borderRadius: "10%",
    backgroundColor: theme.palette.background.default,
  },
  button: {
    borderWidth: 10,
    borderColor: theme.palette.getContrastText(
      theme.palette.background.default
    ),
  },
  number: {
    color: theme.palette.getContrastText(theme.palette.background.default),
    backgroundColor: theme.palette.background.paper,
  },
  disabled: {
    color: theme.palette.text.secondary,
    backgroundColor: "inherit",
  },
}));

const NumberPicker = (props: INumberPickerProps) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null as Element | null);

  const handleClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const numberRows = [];

  const getSetFunction = (i: number) => {
    return () => {
      handleClose();
      props.setNumber(i);
    };
  };

  for (let i = 7; i > 0; i -= 6) {
    const numberRow = [];
    for (let j = 0; j < 3; ++j) {
      numberRow.push(
        <IconButton onClick={getSetFunction(i)} disabled={props.maxNum < i} size="large">
          <Avatar
            className={`${classes.number} ${
              props.maxNum < i ? classes.disabled : ""
            }`}
          >
            {i}
          </Avatar>
        </IconButton>
      );
      ++i;
    }
    numberRows.push(
      <Box display="flex" flexDirection="row">
        {numberRow}
      </Box>
    );
  }

  return <>
    <IconButton className={classes.button} onClick={handleClick} size="large">
      <Avatar className={classes.number}>{props.number}</Avatar>
    </IconButton>
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      elevation={6}
      PaperProps={{ className: classes.popover }}
    >
      <Box display="flex" flexDirection="column">
        {numberRows}
      </Box>
    </Popover>
  </>;
};

export default NumberPicker;

import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  popover: {
    borderRadius: "10%",
    backgroundColor: theme.palette.background.default,
  },
  button: {
    borderWidth: 10,
    borderColor: theme.palette.getContrastText(theme.palette.background.default),
  },
  number: {
    color: theme.palette.getContrastText(theme.palette.background.default),
    backgroundColor: theme.palette.background.paper,
  },
  disabled: {
    color: theme.palette.text.secondary,
    backgroundColor: 'inherit',
  },
}));

const NumberPicker = (props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const numberRows = [];

  const getSetFunction = (i) => {
    return (() => {
      handleClose();
      props.setNumber(i);
    });
  }

  for (let i=7; i >0; i-=6) {
    const numberRow = [];
    for (let j=0; j<3; ++j) {
      numberRow.push(
        <IconButton onClick={getSetFunction(i)} disabled={props.maxNum < i}>
          <Avatar className={`${classes.number} ${props.maxNum < i ? classes.disabled : ''}`}>{i}</Avatar>
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

  return (
    <>
      <IconButton className={classes.button} onClick={handleClick} >
        <Avatar className={classes.number}>{props.number}</Avatar>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        elevation={6}
        PaperProps={{'className':classes.popover}}
      >
        <Box display="flex" flexDirection="column">
          {numberRows}
        </Box>
      </Popover>
    </>
  );
}

export default NumberPicker;
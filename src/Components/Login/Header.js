import React from "react";
import Avatar from "@material-ui/core/Avatar";
import AlarmOutlined from "@material-ui/icons/AlarmOutlined";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  avatar: {
    margin: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
  },
}));

const Header = () => {
  const classes = useStyles();

  return (
    <Avatar className={classes.avatar}>
      <AlarmOutlined />
    </Avatar>
  );
};

export default Header;

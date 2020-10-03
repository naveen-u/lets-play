import React from "react";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";
import dice from "../../assets/dice.png";

const useStyles = makeStyles((theme) => ({
  avatar: {
    margin: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Header = () => {
  const classes = useStyles();

  return <Avatar className={classes.avatar} alt="Let's Play!" src={dice} />;
};

export default Header;

import React from "react";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import GitHubIcon from "@material-ui/icons/GitHub";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  contribute: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  contributeLink: {
    display: "flex",
    alignItems: "center",
    "&:hover": {
      color: theme.palette.text.primary,
    },
  },
}));

const Contribute = () => {
  const classes = useStyles();

  return (
    <Box mt={5} className={classes.contribute}>
      <Link
        href="https://github.com/naveen-u/lets-play"
        variant="body2"
        color="textSecondary"
        className={classes.contributeLink}
        underline="none"
        target="_blank"
        rel="noreferrer"
      >
        Contribute on Github <GitHubIcon style={{ margin: "5px" }} />
      </Link>
    </Box>
  );
};

export default Contribute;

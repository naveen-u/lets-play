import React from "react";
import { CircularProgress, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    aligntems: "center",
    position: "absolute",
    width: "100%",
    height: "90%",
  },
  loading: {
    margin: "auto",
    textAlign: "center",
  },
  text: {
    padding: "10px",
  },
});

const LoadingScreen = () => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div className={styles.loading}>
        <CircularProgress />
        <Typography variant="body2" className={styles.text}>
          Loading...
        </Typography>
      </div>
    </div>
  );
};

export default LoadingScreen;

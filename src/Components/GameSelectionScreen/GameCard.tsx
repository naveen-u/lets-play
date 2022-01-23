import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useRecoilValue } from "recoil";
import { isAdminState, socket } from "../stores/gameDataStore";

interface IGameCardProps {
  gameKey: string;
  name: string;
  description: string;
  image?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: 250,
    margin: theme.spacing(1),
  },
}));

export default function GameCard(props: IGameCardProps) {
  const classes = useStyles();

  const isAdmin = useRecoilValue(isAdminState);

  return (
    <Card className={classes.root}>
      <CardActionArea disabled>
        <CardMedia
          component="img"
          alt={props.name}
          height="140"
          image={props.image || "https://picsum.photos/200"}
          title={props.name}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {props.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      {isAdmin ? (
        <CardActions>
          <Button
            size="small"
            color="primary"
            fullWidth
            onClick={() => socket.emit("select_game", props.gameKey)}
          >
            Play
          </Button>
        </CardActions>
      ) : null}
    </Card>
  );
}

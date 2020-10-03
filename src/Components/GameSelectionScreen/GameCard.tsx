import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
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

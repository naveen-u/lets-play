export const NAMESPACE = "/codenames";

export enum GameStates {
  "JOIN" = "JOIN",
  "RED_READY" = "RED_READY",
  "BLUE_READY" = "BLUE_READY",
  "STARTED" = "STARTED",
  "BLUE_PLAYER" = "BLUE_PLAYER",
  "RED_PLAYER" = "RED_PLAYER",
  "BLUE_SPYMASTER" = "BLUE_SPYMASTER",
  "RED_SPYMASTER" = "RED_SPYMASTER",
  "GAME_OVER" = "GAME_OVER",
}

export interface IPlayer {
  id: string;
  user: string;
  team: Teams;
}

export enum Teams {
  BLUE = "blue",
  RED = "red",
  NEUTRAL = "neutral",
}

export interface ITeamList {
  blueSpymaster: IPlayer;
  redSpymaster: IPlayer;
  currentTeam: Teams;
  players: IPlayer[];
}

export interface IGameData {
  words: string[];
  grid: string[];
  state: GameStates;
  clue: string;
  turns: number;
  blueLeft: number;
  redLeft: number;
  details: string;
}

export enum PlayerType {
  PLAYER = "Player",
  SPYMASTER = "Spymaster",
}

export interface ICodenamesState {
  playerList?: IPlayer[];
  blueMaster?: IPlayer;
  redMaster?: IPlayer;
  gameState?: GameStates;
}

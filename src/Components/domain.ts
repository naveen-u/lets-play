export interface IGameState {
  username?: string;
  userId?: string;
  roomId?: string;
  roomAdmin?: string;
  userList?: IUserData[];
}

export interface IUserData {
  username: string;
  userId: string;
}

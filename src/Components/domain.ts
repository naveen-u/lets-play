export interface IGameConfig {
  [key: string]: IGameData;
}

export interface IGameData {
  name: string;
  importLocation: string;
  description: string;
  imageLocation?: string;
}

export interface IGameState {
  username?: string;
  userId?: string;
  roomId?: string;
  roomAdmin?: string;
  userList?: IUserData[];
  game?: string;
}

export interface IUserData {
  username: string;
  userId: string;
}

export interface IRequest {
  requestOptions?: IRequestOptions;
  successCallback?: (statusCode: number, data: IPostResponse | null) => void;
  failureCallback?: (statusCode: number, data: string) => void;
}

export interface IPostResponse {
  user?: string;
  room: string;
}

export interface IRequestOptions {
  method: TRequestMethods;
  headers: {};
  body: string;
}

export type TRequestMethods = "GET" | "POST";

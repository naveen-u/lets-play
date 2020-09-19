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

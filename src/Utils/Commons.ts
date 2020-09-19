import { IGameState, IRequest, IPostResponse } from "../Components/domain";

// GET session details from server
const getSession = (
  successCallback:
    | ((statusCode: number, data: IGameState) => void)
    | null = null,
  failureCallback: ((statusCode: number, data: string) => void) | null = null
) => {
  const requestOptions = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };

  fetch("/session", requestOptions)
    .then((response) => {
      const statusCode = response.status;
      const data = response.text();
      return Promise.all([statusCode, data]);
    })
    .then(([statusCode, data]) => {
      if (statusCode === 200) {
        if (successCallback !== null) {
          const parsedData = JSON.parse(data);
          successCallback(statusCode, parsedData);
        }
      } else if (failureCallback != null) {
        failureCallback(statusCode, data);
      }
    });
};

// Login or logout
const postSession = (options: IRequest) => {
  if (!options) options = {};
  const defaultRequestOptions = {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "",
  };
  const requestOptions = options.requestOptions
    ? options.requestOptions
    : defaultRequestOptions;
  fetch("/session", requestOptions)
    .then((response) => {
      const statusCode = response.status;
      const data = response.text();
      return Promise.all([statusCode, data]);
    })
    .then(([statusCode, data]) => {
      const successCallback = options.successCallback;
      const failureCallback = options.failureCallback;
      if (statusCode === 200 || statusCode === 204) {
        if (successCallback != null) {
          let responseData: IPostResponse | null = null;
          if (statusCode !== 204) {
            responseData = JSON.parse(data);
          }
          successCallback(statusCode, responseData);
        }
      } else {
        if (
          typeof failureCallback !== "undefined" &&
          failureCallback !== null
        ) {
          failureCallback(statusCode, data);
        }
      }
    });
};

export { getSession, postSession };

// GET session details from server
const getSession = (successCallback = null, failureCallback = null) => {
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  
  fetch('/session', requestOptions)
  .then(response => {
    const statusCode = response.status;
    const data = response.text();
    return Promise.all([statusCode, data]);
  })
  .then(([statusCode, data]) => {
    if (statusCode === 200 || statusCode === 204) {
      if (successCallback !== null){
        if (statusCode !== 204) {
          data = JSON.parse(data);
        }
        successCallback(statusCode, data);
      }
    }
    else if (typeof failureCallback !== 'undefined' && failureCallback !== null) {
      failureCallback(statusCode, data);
    }
  });
}


// Login or logout
const postSession = (options) => {
  if (!options) options = {};
  const defaultRequestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: ''
  };
  const requestOptions = options.requestOptions ? options.requestOptions : defaultRequestOptions;
  fetch('/session', requestOptions)
  .then(response => {
    const statusCode = response.status;
    const data = response.text();
    return Promise.all([statusCode, data]);
  })
  .then(([statusCode, data]) => {
    const successCallback = options.successCallback;
    const failureCallback = options.failureCallback;
    if (statusCode === 200 || statusCode === 204) {
      if (typeof successCallback !== 'undefined' && successCallback !== null) {
        if (statusCode !== 204) {
          data = JSON.parse(data);
        }
        successCallback(statusCode, data);
      }
    }
    else {
      if (typeof successCallback !== 'undefined' && failureCallback !== null) {
        failureCallback(statusCode, data);
      }
    }
  });
}

export { getSession, postSession };
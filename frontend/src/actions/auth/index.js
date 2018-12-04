import {
    AUTH_USER,
    AUTH_IN_PROGRESS,
    UNAUTH_USER,
    AUTH_ERROR,
    CLEARDOWN,
    SET_USER
  } from './authTypes';
  
  import Auth from './Auth';
  
  const auth = new Auth();

  export function signSuccess(user) {
      return function(dispatch) {
          dispatch({ type: AUTH_USER });
          dispatch({ type: SET_USER, user: user });
      }
  }
  
  export function authError(error) {
    const timestamp = Date.now();
    return {
      type: AUTH_ERROR,
      error,
      timestamp
    };
  }
  
  export function signoutUser() {
    // auth.signout();
    return { type: UNAUTH_USER };
  }
  
  export function cleardown() {
    return {
      type: CLEARDOWN
    };
  }
  
  export function handleAuthentication(callback) {
    return function (dispatch) {
      auth.handleAuthentication()
        .then(() => {
          return dispatch({ type: AUTH_USER });
        })
        .catch(err => {
          return dispatch({ type: UNAUTH_USER });
        });
    }
  }
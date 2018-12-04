



import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import auth from './authReducer';
import user from './userReducer';

const rootReducer = combineReducers({
    form,
    auth,
    user
  });

export default rootReducer;


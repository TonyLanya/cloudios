import {
CLEARDOWN,
SET_USER
} from '../actions/auth/authTypes';

const INIT = {
    id: '',
    first: '',
    last: '',
    email: ''
}

export default function(state = {}, action) {
    switch(action.type) {
        case CLEARDOWN:
        return { ...state, ...INIT };
        case SET_USER:
        return { ...state, ...INIT, id: action.user.id, first: action.user.first_name, last: action.user.last_name, email: action.user.email };
        default:
        return state;
    }
}
  
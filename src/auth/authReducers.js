import * as authTypes from './authAction';

const initialState = {
  isAuthenticated: false,
  isFetching: false,
  isReadingCookies: true,
  errorMessage: '',
  user: {
    name: 'fabien',
    recentActivities: {},
  },
  lastUserList: {
    selected: null,
    show: false,
  },
  apps: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case authTypes.LOGIN_NO_COOKIE:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: false,
        isReadingCookies: false,
        errorMessage: '',
        user: {},
      };
    case authTypes.LOGIN_REQUEST:
      return {
        ...state,
        isFetching: true,
        isAuthenticated: false,
        errorMessage: '',
        user: {},
      };
    case authTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: true,
        isReadingCookies: false,
        errorMessage: '',
        user: action.user,
      };
    case authTypes.LOGIN_FAILURE:
      return {
        ...state,
        isFetching: false,
        isAuthenticated: false,
        isReadingCookies: false,
        errorMessage: action.errorMessage,
      };
    case authTypes.UPDATE_PROFILE:
      return {
        ...state,
        user: Object.assign(state.user, action.user),
      };
    case authTypes.UPDATE_LAST_USER_LIST:
      return {
        ...state,
        isFetching: false,
        lastUserList: action.lastUserList,
        errorMessage: '',
      };
    case authTypes.LOGOUT_SUCCESS:
      return {
        ...state,
        user: {},
        isFetching: false,
        isAuthenticated: false,
      };
    case authTypes.SET_APP_DETAILS:
      return {
        ...state,
        apps: Object.assign(state.apps,
          { [action.appName]: action.appDetails }),
      };
    case authTypes.SIGNUP_REQUEST:
      return {
        ...state,
        user: {},
        isFetching: true,
        success: false,
        isAuthenticated: false,
        errorMessage: '',
      };
    case authTypes.SIGNUP_SUCCESS:
      return {
        ...state,
        user: {},
        isFetching: false,
        success: true,
        errorMessage: '',
      };
    case authTypes.SIGNUP_FAILURE:
      return {
        ...state,
        user: {},
        isFetching: false,
        success: false,
        errorMessage: action.errorMessage,
      };
    case authTypes.USERNAME_REQUEST:
      return {
        ...state,
        isFetching: true,
        errorMessage: '',
      };
    case authTypes.USERNAME_FAILURE:
      return {
        ...state,
        isFetching: false,
        errorMessage: action.errorMessage,
      };
    default:
      return state;
  }
};

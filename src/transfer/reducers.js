import * as types from './actions';

const initialState = {
  isFetching: false,
  errorMessage: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.TRANSFER_STEEM_REQUEST:
      return {
        isFetching: true,
        errorMessage: '',
      };
    case types.TRANSFER_STEEM_FAILURE:
      return {
        isFetching: false,
        errorMessage: action.errorMessage,
      };
    case types.TRANSFER_STEEM_SUCCESS:
      return {
        isFetching: false,
        errorMessage: false,
      };
    default:
      return state;
  }
};

import {
  IUserState,
  IUserAction,
  USER_LOADING,
  ACCOUNTS_LOADING,
  STATEMENTS_LOADING,
  FETCH_USER_DETAILS,
  FETCH_USER_ACCOUNTS,
  FETCH_ACCOUNT_STATEMENTS,
  FETCH_PAYMENT_ACCOUNT_STATEMENTS,
  FETCH_TRANSFER_ACCOUNT_STATEMENTS,
  TOTAL_BALANCE_LOADING,
  FETCH_TOTAL_BALANCE,
  FETCH_USER_PRODUCTS,
  USER_PRODUCTS_LOADING,
  RESET_USER_STATES,
} from './../action_types/user_action_types';

const initalState: IUserState = {
  userDetails: undefined,
  userAccounts: undefined,
  useAccountStatements: undefined,
  usePaymentsAccountStatements: undefined,
  useTransferAccountStatements: undefined,
  userTotalBalance: undefined,
  userProducts: undefined,
  isUserLoading: false,
  isAccountsLoading: false,
  isStatementsLoading: false,
  isTotalBalanceLoading: false,
  isUserProductsLoading: false,
};

function UserReducer(state = initalState, action: IUserAction) {
  switch (action.type) {
    case RESET_USER_STATES:
      return {
        userDetails: undefined,
        userAccounts: undefined,
        useAccountStatements: undefined,
        usePaymentsAccountStatements: undefined,
        useTransferAccountStatements: undefined,
        userTotalBalance: undefined,
        userProducts: undefined,
        isUserLoading: false,
        isAccountsLoading: false,
        isStatementsLoading: false,
        isTotalBalanceLoading: false,
        isUserProductsLoading: false,
      };
    case USER_LOADING:
      return {...state, isUserLoading: action.isUserLoading};
    case ACCOUNTS_LOADING:
      return {...state, isAccountsLoading: action.isAccountsLoading};
    case STATEMENTS_LOADING:
      return {...state, isStatementsLoading: action.isStatementsLoading};
    case TOTAL_BALANCE_LOADING:
      return {...state, isTotalBalanceLoading: action.isTotalBalanceLoading};
    case USER_PRODUCTS_LOADING:
      return {...state, isUserProductsLoading: action.isUserProductsLoading};
    case FETCH_USER_DETAILS:
      return {...state, userDetails: action.userDetails};
    case FETCH_USER_PRODUCTS:
      return {...state, userProducts: action.userProducts};
    case FETCH_TOTAL_BALANCE:
      return {...state, userTotalBalance: action.userTotalBalance};
    case FETCH_USER_ACCOUNTS:
      return {...state, userAccounts: action.userAccounts?.accountBallances};
    case FETCH_ACCOUNT_STATEMENTS:
      let statements = [...(action.useAccountStatements?.statements || [])];
      let useAccountStatements = {...action.useAccountStatements};
      if (action.paging) {
        statements = [
          ...(state.useAccountStatements?.statements || []),
          ...(statements || []),
        ];
        useAccountStatements = {
          statements: statements,
          statement_Ballances: useAccountStatements.statement_Ballances,
        };
      }

      return {...state, useAccountStatements: useAccountStatements};
    case FETCH_PAYMENT_ACCOUNT_STATEMENTS:
      return {
        ...state,
        usePaymentsAccountStatements: action.usePaymentsAccountStatements,
      };
    case FETCH_TRANSFER_ACCOUNT_STATEMENTS:
      return {
        ...state,
        useTransferAccountStatements: action.useTransferAccountStatements,
      };
    default:
      return {...state};
  }
}

export default UserReducer;

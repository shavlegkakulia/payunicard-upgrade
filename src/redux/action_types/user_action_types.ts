import { IUserDetails, IAccountBallance, IAccountBallances, IGetUserAccountsStatementResponse, IGetUserTotalBalanceResponse, IProduct } from './../../services/UserService';
export const FETCH_USER_DETAILS = 'FETCH_USER_DETAILS';
export const USER_LOADING = 'USER_LOADING';
export const ACCOUNTS_LOADING = 'ACCOUNTS_LOADING';
export const STATEMENTS_LOADING = 'STATEMENTS_LOADING';
export const FETCH_USER_ACCOUNTS = 'FETCH_USER_ACCOUNTS';
export const FETCH_ACCOUNT_STATEMENTS = 'FETCH_ACCOUNT_STATEMENTS';
export const FETCH_PAYMENT_ACCOUNT_STATEMENTS = 'FETCH_PAYMENT_ACCOUNT_STATEMENTS';
export const FETCH_TRANSFER_ACCOUNT_STATEMENTS = 'FETCH_TRANSFER_ACCOUNT_STATEMENTS';
export const FETCH_TOTAL_BALANCE = 'FETCH_TOTAL_BALANCE';
export const TOTAL_BALANCE_LOADING = 'TOTAL_BALANCE_LOADING';
export const USER_PRODUCTS_LOADING = 'USER_PRODUCTS_LOADING';
export const FETCH_USER_PRODUCTS = 'FETCH_USER_PRODUCTS';
export const RESET_USER_STATES = 'RESET_USER_STATES';

export interface IUserState {
    userDetails?: IUserDetails | undefined
    userAccounts?: IAccountBallance[];
    useAccountStatements?: IGetUserAccountsStatementResponse | undefined;
    usePaymentsAccountStatements?: IGetUserAccountsStatementResponse | undefined;
    useTransferAccountStatements?: IGetUserAccountsStatementResponse | undefined;
    userTotalBalance?: IGetUserTotalBalanceResponse | undefined;
    userProducts?: IProduct[] | undefined;
    isUserLoading: boolean;
    isAccountsLoading: boolean;
    isStatementsLoading: boolean;
    isTotalBalanceLoading: boolean;
    isUserProductsLoading: boolean;
}

export interface IUserAction {
    userDetails: IUserDetails;
    userAccounts?: IAccountBallances;
    useAccountStatements?: IGetUserAccountsStatementResponse | undefined;
    usePaymentsAccountStatements?: IGetUserAccountsStatementResponse | undefined;
    useTransferAccountStatements?: IGetUserAccountsStatementResponse | undefined;
    userTotalBalance?: IGetUserTotalBalanceResponse | undefined;
    userProducts?: IProduct[] | undefined;
    isUserLoading: boolean;
    isAccountsLoading: boolean;
    isStatementsLoading: boolean;
    isTotalBalanceLoading: boolean;
    isUserProductsLoading: boolean;
    type: string;
    paging?: boolean;
}

export interface IGloablState {
    UserReducer: IUserState
}

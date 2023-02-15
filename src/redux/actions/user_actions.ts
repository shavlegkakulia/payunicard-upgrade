import {
  FETCH_USER_DETAILS,
  USER_LOADING,
  ACCOUNTS_LOADING,
  STATEMENTS_LOADING,
  FETCH_USER_ACCOUNTS,
  FETCH_ACCOUNT_STATEMENTS,
  FETCH_PAYMENT_ACCOUNT_STATEMENTS,
  FETCH_TRANSFER_ACCOUNT_STATEMENTS,
  FETCH_TOTAL_BALANCE,
  TOTAL_BALANCE_LOADING,
  FETCH_USER_PRODUCTS,
  USER_PRODUCTS_LOADING,
} from './../action_types/user_action_types';
import UserService, {
  IAccountBallances,
  ICard,
  IGetUserAccountsStatementResponse,
  IUnicard,
  IUserAccountsStatement,
  IUserAccountsStatementRequest,
} from './../../services/UserService';
import storage from './../../services/StorageService';
import {AUTH_USER_INFO} from '../../constants/defaults';
import {
  TYPE_UNICARD,
  UNICARD_PLUS,
  UNICARD_ULTRA,
  UPERA,
  WALLET,
} from '../../constants/accountTypes';
import currencies, { GEL } from '../../constants/currencies';
import Store from '../store';
import { ICardsInWallet, onEcheckElements } from '../../navigation/AppleWallet/AppleWallet';
import axios from 'axios';

export const FetchUserDetail =
  (remember?: boolean, refetch?: boolean) => async (dispatch: any) => {
    dispatch({type: USER_LOADING, isUserLoading: true});
    UserService.GetUserDetails().subscribe({
      next: async Response => {
        dispatch({type: FETCH_USER_DETAILS, userDetails: Response?.data?.data});
        if (remember) {
          await storage.setItem(
            AUTH_USER_INFO,
            JSON.stringify({...(Response?.data?.data || {}), isBase: true}),
          );
        }

        if (refetch) {
          const info = await storage.getItem(AUTH_USER_INFO);
          if (info !== null) {
            storage.setItem(
              AUTH_USER_INFO,
              JSON.stringify({...(Response?.data?.data || {}), isBase: true}),
            );
          }
        }
      },
      error: (err) => { 
        console.log(err)
        dispatch({type: USER_LOADING, isUserLoading: false});
      },
      complete: () => {
        dispatch({type: USER_LOADING, isUserLoading: false});
      }
    });
  };

export const FetchUserProducts = () => (dispatch: any) => {
  dispatch({type: USER_PRODUCTS_LOADING, isUserProductsLoading: true});
  UserService.GetUserProducts().subscribe({
    next: Response => {
      dispatch({
        type: FETCH_USER_PRODUCTS,
        userProducts: Response.data?.data?.products,
      });
    },
    error: () =>
      dispatch({type: USER_PRODUCTS_LOADING, isUserProductsLoading: false}),
    complete: () =>
      dispatch({type: USER_PRODUCTS_LOADING, isUserProductsLoading: false}),
  });
};

export const FetchUserAccountStatements =
  (
    params: IUserAccountsStatementRequest,
    paging?: boolean,
    callback?: () => void,
  ) =>
  (dispatch: any) => {
    dispatch({type: STATEMENTS_LOADING, isStatementsLoading: true});
    UserService.GetUserAccountStatements(params).subscribe({
      next: Response => {
        dispatch({
          type: FETCH_ACCOUNT_STATEMENTS,
          useAccountStatements: Response.data.data,
          paging: paging,
        });
        // if (params?.opClass && params?.opExclude) {
        //   dispatch({
        //     type: FETCH_TRANSFER_ACCOUNT_STATEMENTS,
        //     useTransferAccountStatements: Response.data.data,
        //   });
        // } else if (params?.opClass && !params?.opExclude) {
        //   dispatch({
        //     type: FETCH_PAYMENT_ACCOUNT_STATEMENTS,
        //     usePaymentsAccountStatements: Response.data.data,
        //   });
        // } else {
        //   dispatch({
        //     type: FETCH_ACCOUNT_STATEMENTS,
        //     useAccountStatements: Response.data.data,
        //     paging: paging,
        //   });
        // }
      },
      error: err => {
        callback && callback();
        dispatch({type: STATEMENTS_LOADING, isStatementsLoading: false});
      },
      complete: () => {
        callback && callback();
        dispatch({type: STATEMENTS_LOADING, isStatementsLoading: false});
      },
    });
  };

export const FetchUserTotalBalance = () => (dispatch: any) => {
 
  dispatch({type: TOTAL_BALANCE_LOADING, isTotalBalanceLoading: true});
  UserService.GetUserTotalBalance().subscribe({
    next: Response => {
      dispatch({
        type: FETCH_TOTAL_BALANCE,
        userTotalBalance: Response.data.data,
      });
    },
    error: () =>
      dispatch({type: TOTAL_BALANCE_LOADING, isTotalBalanceLoading: false}),
    complete: () =>
      dispatch({type: TOTAL_BALANCE_LOADING, isTotalBalanceLoading: false}),
  });
};

export const FetchUserAccounts = () => async (dispatch: any) => {
  const curLangKey = Store.getState().TranslateReduser.key;
  await dispatch({type: ACCOUNTS_LOADING, isAccountsLoading: true});
  let UserAccounts: IAccountBallances | {accountBallances: []};
  UserService.GetUserAccounts().subscribe({
    next: Response => {
      UserAccounts = Response?.data?.data || {accountBallances: []};
      UserAccounts?.accountBallances?.map(account => {
        if(account.type === 1) {
          account.accountTypeName = WALLET[curLangKey];
        }else if (account.customerPaketId === 2) {
          account.accountTypeName = UPERA;
        } else if (account.customerPaketId === 3) {
          account.accountTypeName = UNICARD_PLUS;
        } else if (account.customerPaketId === 4) {
          account.accountTypeName = UNICARD_ULTRA;
        }
        return account;
      }) || {accountBallances: []}; 
    },
    error: () => dispatch({type: ACCOUNTS_LOADING, isAccountsLoading: false}),
    complete: () => {
      let userUnicards: IUnicard[];
      UserService.GetUnicards().subscribe({
        next: Response => {
          if (Response.data.ok) {
            let tempUnicards = Response.data.data?.unicards;
            userUnicards =
              tempUnicards?.map(uni => {
                let uCard = {
                  accountTypeName: 'UniCard',
                  accountId: uni.card,
                  accountNumber: uni.card,
                  cardMask: `${'****' + uni.card?.slice(12, 16)}`,
                  isUnicard: true,
                  availableInGEL: uni.amount,
                  cards: [],
                  currencies: [
                    {key: GEL, value: currencies.GEL, balance: (uni.amount || 0) / 10},
                  ],
                  imageUrl: require('./../../assets/images/uniLogo.png'),
                  isActive: true,
                  type: TYPE_UNICARD, // type 7 is custom type for unicard
                };
                return uCard;
              }) || [];
          }
        },
        complete: () => {
          dispatch({
            type: FETCH_USER_ACCOUNTS,
            userAccounts: {
              accountBallances: userUnicards ? [
                ...UserAccounts?.accountBallances,
                ...userUnicards,
              ] : [...UserAccounts?.accountBallances],
            },
          });
          dispatch({type: ACCOUNTS_LOADING, isAccountsLoading: false});
        },
        error: () => {
          dispatch({type: FETCH_USER_ACCOUNTS, userAccounts: UserAccounts});
          dispatch({type: ACCOUNTS_LOADING, isAccountsLoading: false});
        },
      });
    },
  });
};

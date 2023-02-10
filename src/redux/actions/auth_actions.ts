import {LOGIN, LOGOUT, START_LOGIN} from './../action_types/auth_action_types';
import AuthService from './../../services/AuthService';
import storage from './../../services/StorageService';
import { PAYMENTS_ACTIONS } from '../action_types/payments_action_type';
import { TRANSFERS_ACTION_TYPES } from '../action_types/transfers_action_types';
import { RESET_USER_STATES } from '../action_types/user_action_types';

export const Login =
  (access_token: string, refresh_token: string, remember: boolean) =>
  async (dispatch: any) => {
    dispatch({type: START_LOGIN, isLoading: true});
    const isPassCodeEnabled = await storage.getItem('PassCodeEnbled');
    if (isPassCodeEnabled !== null) {
      await AuthService.removeToken();
      await AuthService.setToken(access_token, refresh_token);
    }
    dispatch({
      type: LOGIN,
      accesToken: access_token,
      refreshToken: refresh_token,
      remember,
    });
    dispatch({type: START_LOGIN, isLoading: false});
  };

export const Logout = () => (dispatch: any) => {
  // dispatch({type: START_LOGIN, isLoading: true});
  //cleare payment states
  dispatch({type: PAYMENTS_ACTIONS.RESET_PAYEMENT_DATA});
  //cleare transfers states
  dispatch({type: TRANSFERS_ACTION_TYPES.RESET_TRANSFER_STATES});
  //reset user states
  dispatch({type: RESET_USER_STATES});
  dispatch({type: LOGOUT});
  // dispatch({type: START_LOGIN, isLoading: false});
};

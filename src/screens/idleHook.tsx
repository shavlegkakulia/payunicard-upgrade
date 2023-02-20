import axios from 'axios';
import React, {useEffect, useRef} from 'react';
import {
  PanResponder,
  PanResponderInstance,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {TOKEN_EXPIRE} from '../constants/defaults';
import {Logout} from '../redux/actions/auth_actions';
import {IAuthAction, REFRESH} from '../redux/action_types/auth_action_types';
import AuthService, {IAuthorizationResponse} from '../services/AuthService';
import CommonService from '../services/CommonService';
import AsyncStorage from '../services/StorageService';
import {getString} from '../utils/Converter';
import envs from '../../config/env';
import Store from './../redux/store';
type Props = {
  children: JSX.Element,
};
const IdleHook: React.FC<Props> = props => {
  const tokenTTLTime = useRef<NodeJS.Timeout>();
  const accesRefresh = useRef<NodeJS.Timeout>();
  const ttlWarningValue = 5 * 60; //5 minutes
  const expireDate = useRef<string | null>();
  const isrefresfing = useRef<boolean>(false);
  const dispatch = useDispatch<any>();

  const goRefreshToken = async () => {
    let {refreshToken, accesToken} = Store.getState().AuthReducer;
    const _envs = await envs();
    let authData: any = {
      scope: "Wallet_Api.Full offline_access",
      client_id: _envs.client_id,
      client_secret: _envs.client_secret,
      grant_type: "refresh_token",
      refresh_token: refreshToken
  };

    if (isrefresfing.current) return;
    isrefresfing.current = true;

    if (accesRefresh.current) clearTimeout(accesRefresh.current);

    const data = Object.keys(authData)
    .map((key) => `${key}=${encodeURIComponent(authData[key])}`)
    .join('&');

    const options = {
      method: 'POST',
      skipRefresh: true,
      headers: { 'content-type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${accesToken}`},
      data,
      url: `${_envs.CONNECT_URL}connect/token`,
  };
  return axios<IAuthorizationResponse>(options).then(async response => {
    if (!response.data.access_token) throw response;

    const date = new Date();
    date.setSeconds(date.getSeconds() + response.data.expires_in);
    const expObject = {
      expDate: date,
    };
    await AsyncStorage.removeItem(TOKEN_EXPIRE);
    await AsyncStorage.setItem(TOKEN_EXPIRE, JSON.stringify(expObject));
    expireDate.current = JSON.stringify(expObject);

    const isPassCodeEnabled = await AsyncStorage.getItem('PassCodeEnbled');
    if (isPassCodeEnabled !== null) {
      await AuthService.removeToken();

      await AuthService.setToken(
        response.data.access_token,
        response.data.refresh_token,
      );
    }

    Store.dispatch<IAuthAction>({
      type: REFRESH,
      accesToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });

    accesRefresh.current = setTimeout(() => {
      isrefresfing.current = false;
    }, 1000);
  }).catch(_ => {
    isrefresfing.current = false;
    dispatch(Logout());
  });
  };

  useEffect(() => {
    CommonService.ttlIntervals?.forEach(() => {
      const id = CommonService.ttlIntervals?.shift();
      if (id) clearInterval(id);
    });

    (async () => {
      expireDate.current = await AsyncStorage.getItem(TOKEN_EXPIRE);

      if (tokenTTLTime.current) clearTimeout(tokenTTLTime.current);
      CommonService.ttlIntervals.push(
        ...(CommonService.ttlIntervals || []),
        (tokenTTLTime.current = setInterval(async () => {
          const formatedDate = JSON.parse(getString(expireDate.current));
          const ttl =
            (new Date(formatedDate.expDate).getTime() - new Date().getTime()) /
            100 /
            10;

          if (Math.round(ttl) <= ttlWarningValue) {
            await goRefreshToken();
          }
        }, 1000)),
      );
    })();

    return () => {
      CommonService.ttlIntervals?.forEach(() => {
        const id = CommonService.ttlIntervals?.shift();
        if (id) clearInterval(id);
      });
      if (tokenTTLTime.current) clearTimeout(tokenTTLTime.current);
    };
  }, []);

  return (
    <View
      style={styles.content} >
        {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});

export default IdleHook;

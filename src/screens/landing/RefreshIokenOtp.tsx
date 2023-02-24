import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, KeyboardAvoidingView, Keyboard, TouchableOpacity, Image, Platform} from 'react-native';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../redux/action_types/translate_action_types';
import colors from '../../constants/colors';
import {email as _email} from '../../components/UI/Validation';
import {useSelector} from 'react-redux';
import {tabHeight} from '../../navigation/TabNav';
import FloatingLabelInput from '../../containers/otp/Otp';
import AppButton from '../../components/UI/AppButton';
import AuthService, {IAuthorizationResponse} from '../../services/AuthService';
import axios from 'axios';
import envs from '../../../config/env';
import Store from './../../redux/store';
import {
  IAuthAction,
  LOGIN,
  REFRESH,
} from '../../redux/action_types/auth_action_types';
import {useNavigation} from '@react-navigation/native';
import { getString } from '../../utils/Converter';
import SmsRetriever from 'react-native-sms-retriever';
import AsyncStorage from '../../services/StorageService';
import { TOKEN_EXPIRE } from '../../constants/defaults';
import { stringToObject } from '../../utils/utils';
import { require_otp } from '../../constants/errorCodes';

const RefreshTokenOtp: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [otpGuid, setOtpGuid] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const nav = useNavigation<any>();

  const goRefreshToken = async () => {
    setIsLoading(true);

    const refreshToken = await AuthService.getRefreshToken();
    const _envs = await envs();
    let authData: any = {
      scope: "Wallet_Api.Full offline_access",
      client_id: _envs.client_id,
      client_secret: _envs.client_secret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
  };
  if(otpGuid) {
    authData = {
      ...authData,
      Otp: otpGuid
    }
  }

  const data = Object.keys(authData)
  .map((key) => `${key}=${encodeURIComponent(authData[key])}`)
  .join('&');

  const options = {
    method: 'POST',
    anonymous: true,
    headers: { 'content-type': 'application/x-www-form-urlencoded'},
    data,
    url: `${_envs.CONNECT_URL}connect/token`,
};

return axios<IAuthorizationResponse>(options).then(async response => {
  if (!response.data.access_token) {
    nav.goBack();
  }

  const date = new Date();
  date.setSeconds(date.getSeconds() + response.data.expires_in);
  const expObject = {
    expDate: date,
  };
  await AsyncStorage.removeItem(TOKEN_EXPIRE);
  await AsyncStorage.setItem(TOKEN_EXPIRE, JSON.stringify(expObject));

  await AuthService.removeToken();
  await AuthService.setToken(
    response.data.access_token,
    response.data.refresh_token,
  );

  Store.dispatch<IAuthAction>({
    type: REFRESH,
    accesToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
  });

  Store.dispatch({
    type: LOGIN,
    accesToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    isAuthenticated: true,
  });
}).catch((error) => {
  if (stringToObject(error.response)?.data?.error !== require_otp) {
    nav.goBack();
  }
 
})
.finally(() => setIsLoading(false));
  };

  const onSmsListener = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          if (event && event?.message) {
            try {
              const otpobj = /(\d{4})/g?.exec(getString(event?.message));
            if (otpobj && otpobj?.length > 0) {
              setOtpGuid(otpobj[1]);
              Keyboard.dismiss();
            }
            } catch (error) {
              console.log(JSON.stringify(error))
            }
          }
        })
      }
    } catch (error) {
   
    }
  };

  useEffect(() => {
    onSmsListener();

    return () => SmsRetriever.removeSmsListener();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={styles.avoid}>
        <TouchableOpacity style={styles.modalClose} onPress={() => nav.goBack()}>
            <Image
              source={require('./../../assets/images/close40x40.png')}
              style={styles.modalCloseIcon}
            />
          </TouchableOpacity>
      <View style={styles.content}>
        <View>
          <View style={styles.insertOtpSTep}>
            <Text style={styles.insertOtpCode}>
              {translate.t('otp.enterOtp')}
            </Text>
            <FloatingLabelInput
              Style={styles.otpBox}
              label={translate.t('otp.smsCode')}
              title={translate.t('otp.otpSentBlank')}
              resendTitle={translate.t('otp.resend')}
              value={otpGuid}
              onChangeText={setOtpGuid}
              onRetry={goRefreshToken}
            />
          </View>
        </View>
        <AppButton
          title={translate.t('common.next')}
          onPress={goRefreshToken}
          isLoading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avoid: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: colors.white,
  },
  content: {
    justifyContent: 'space-between',
    flex: 1,
    paddingBottom: tabHeight + 40,
  },
  insertOtpSTep: {
    marginTop: 25,
  },
  insertOtpCode: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.black,
    fontSize: 24,
    lineHeight: 29,
    textAlign: 'left',
  },
  otpBox: {
    marginTop: 40,
  },
  modalClose: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 40,
    right: 15,
    padding: 8,
    flex: 1,
    width: 40,
  },
  modalCloseIcon: {
    width: 24,
    height: 24,
  },
});

export default RefreshTokenOtp;

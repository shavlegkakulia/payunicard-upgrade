import axios, { AxiosHeaders } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import store from './../redux/store';
import {
  IErrorAction,
  PUSH_ERROR,
} from './../redux/action_types/error_action_types';
import {ka_ge, LANG_KEYS} from '../lang';
import {stringToObject} from '../utils/utils';
import {invalid_grant, invalid_request, invalid_username_or_password, require_otp, require_password_change} from '../constants/errorCodes';
import Store from './../redux/store';
import DeviceInfro from 'react-native-device-info';
import { subscriptionService } from './../services/subscriptionService';

class CommonService {
  constructor() {
    DeviceInfro.getUserAgent().then(r => {
      this.DeviceData = JSON.stringify({
        deviceId: DeviceInfro.getDeviceId(),
        userAgent: r
      })
    })
  }
  DeviceData: string = '';
  uactionIntervals: Array<number> = [];
  ttlIntervals: Array<NodeJS.Timeout> = [];
  //register common interseptors for normalzing response
  //when objectResponse is passed in config returns noly ObjectResponse
  registerCommonInterceptor() {
    let requestInterceptor = axios.interceptors.request.use(config => {
      let langKey = store.getState().TranslateReduser.key || ka_ge;
      if(!config.headers) {
        config.headers = AxiosHeaders.accessor([]);
      }
      config.headers['langcode'] = LANG_KEYS[langKey];
      config.headers['User-Agent'] = this.DeviceData;
      config.headers['appVersion'] = DeviceInfro.getVersion();
      config.headers['x-options'] = 'DateFormatNew';


      return config;
    });

    let responseInterceptor = axios.interceptors.response.use(
      (response: any) => {
        const stringTranslator = Store.getState().TranslateReduser;
        if (!response.config.objectResponse || response.data.expires_in)
          return Promise.resolve(response);

        if (!response.data.ok && !response.data.Ok) {
          try{
            response.errorMessage =
            response?.data?.errors[0]?.ErrorMessage || response?.data?.errors[0]?.displayText || 'generalErrors.errorOccurred';
            }
            catch(err) {
              response.errorMessage =
              response?.data?.Errors[0]?.DisplayText || 'generalErrors.errorOccurred';
            }
          response.customError = true;
          if (!response.config.skipCustomErrorHandling)
            store.dispatch<IErrorAction>({
              type: PUSH_ERROR,
              error: response.errorMessage === 'generalErrors.errorOccurred' ? stringTranslator.t(response.errorMessage) : response.errorMessage,
            });

          return Promise.reject(response);
        }
        return Promise.resolve(response);
      },
      async error => {
        if(error?.response?.status === 401) {
          return Promise.reject(error);
        }
       // console.log('*****error in common interceptor******', error);
      //  console.log('*****error in common interceptor******', error.toJSON());
        const stringTranslator = Store.getState().TranslateReduser;
        let netInfo = await NetInfo.fetch();
        console.log(netInfo.isConnected)
        if (!netInfo.isConnected) {
          if (!error.config.skipCustomErrorHandling)
            store.dispatch<IErrorAction>({
              type: PUSH_ERROR,
              error: stringTranslator.t("generalErrors.netError"),
            });
          error.errorMessage = stringTranslator.t("generalErrors.netError");
        } else {
          
          if (
            stringToObject(error.response)?.data?.error_description?.includes("ერთჯერადი კოდი არასწორია") || stringToObject(error.response)?.data?.error_description?.includes("One Time Passcode is Incorrect")
          ) {
            Store.dispatch<IErrorAction>({ type: PUSH_ERROR, error: stringToObject(error.response)?.data?.error_description });
            subscriptionService.sendData('otp_error', stringToObject(error.response)?.data?.error_description);
            return Promise.reject(error);
          }
          if (stringToObject(error.response)?.data?.error !== invalid_grant && stringToObject(error.response)?.data?.error !== require_otp && stringToObject(error.response)?.data?.error !== invalid_username_or_password && stringToObject(error.response)?.data?.error !== require_password_change && stringToObject(error.response)?.data?.error !== invalid_request) {
            store.dispatch<IErrorAction>({
              type: PUSH_ERROR,
              error: stringTranslator.t("generalErrors.errorOccurred")
            });
          }
          if (
            stringToObject(error.response)?.data?.error ===
            require_password_change
          ) {
            store.dispatch<IErrorAction>({
              type: PUSH_ERROR,
              error: stringTranslator.t("login.changePassword")
            });
          }
        }
        return Promise.reject(error);
      },
    );

    return {
      unsubscribe: () => {
        axios.interceptors.request.eject(requestInterceptor);
        axios.interceptors.response.eject(responseInterceptor);
      },
    };
  }

}

export default new CommonService();

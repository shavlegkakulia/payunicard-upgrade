import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Appearance,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AppButton from '../../components/UI/AppButton';
import colors from '../../constants/colors';
import {tabHeight} from '../../navigation/TabNav';
import {PUSH} from '../../redux/actions/error_action';
import {FetchUserDetail} from '../../redux/actions/user_actions';
import {
  IAuthState,
  LOGIN,
  IGlobalState as IGlobalStateAuth,
  REFRESH,
  IAuthAction,
} from '../../redux/action_types/auth_action_types';
import {
  IGlobalState,
  ITranslateState,
} from '../../redux/action_types/translate_action_types';
import AuthService, {IAuthorizationResponse} from '../../services/AuthService';
import {IUserDetails} from '../../services/UserService';
import {getString} from '../../utils/Converter';
import BiometricAuthScreen from '../dashboard/settings/biometric';
import storage from '../../services/StorageService';
import envs from '../../../config/env';
import Store from '../../redux/store';
import FullScreenLoader from '../../components/FullScreenLoading';
import {stringToObject} from '../../utils/utils';
import {invalid_grant, require_otp} from '../../constants/errorCodes';
import {useNavigation} from '@react-navigation/native';
import Routes from '../../navigation/routes';
import {TOKEN_EXPIRE} from '../../constants/defaults';
import ReactNativeBiometrics from 'react-native-biometrics';

interface IProps {
  access_token: string;
  refresh_token: string;
  UserData: IUserDetails | null;
  onDismiss: () => void;
}

const rnBiometrics = new ReactNativeBiometrics();

const SetLoginWithPassCode: React.FC<IProps> = props => {
  const [code, setCode] = useState<string>();
  const [baseCode, setBaseCode] = useState<string>();
  const [startBiometric, setStartBiometric] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(true);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const translate = useSelector<IGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const state = useSelector<IGlobalStateAuth>(
    state => state.AuthReducer,
  ) as IAuthState;
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();

  const setNum = (num: string) => {
    if (isLoading) return;

    if (num === '-') {
      if (!code || code.length <= 0) return;
      setCode(prev => prev?.slice(0, prev.length - 1));
      return;
    }

    if (code && code?.length >= 4) return;

    let c = getString(code)?.concat(num);
    setCode(c);

    if (getString(c).length === 4) {
      login(c);
    }
  };

  const goRefreshToken = async () => {
    setIsLoading(true);
    const refreshToken = await AuthService.getRefreshToken();
    const _envs = await envs();
    let authData: any = {
      scope: "Wallet_Api.Full offline_access",
      client_id: _envs.client_id,
      client_secret: _envs.client_secret,
      grant_type: "refresh_token",
      refresh_token: refreshToken
  };

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
  setIsLoading(false)
        if (!response.data.access_token) throw response;

        const date = new Date();
        date.setSeconds(date.getSeconds() + response.data.expires_in);
        const expObject = {
          expDate: date,
        };
        await storage.removeItem(TOKEN_EXPIRE);
        await storage.setItem(TOKEN_EXPIRE, JSON.stringify(expObject));

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
        return {
          accesToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          skip: false,
        };
      })
      .catch(error => {
        if (stringToObject(error.response)?.data?.error === require_otp) {
          navigation.navigate(Routes.RefreshTokenOtp);
        } else if (stringToObject(error.response)?.data?.error === invalid_grant) {
          navigation.navigate(Routes.Landing, {loginWithPassword: true});
        }
        return {accesToken: undefined, refreshToken: undefined, skip: true};
      })
      .finally(() => {
        setIsLoading(false);
        return {accesToken: undefined, refreshToken: undefined, skip: false};
      });
  };

  const login = async (pascode: string) => {
    if (baseCode === pascode) {
      goRefreshToken().then(res => {
        const {accesToken, refreshToken, skip} = res;
        if (res.accesToken !== undefined) {
          dispatch({
            type: LOGIN,
            accesToken: accesToken,
            refreshToken: refreshToken,
            isAuthenticated: true,
          });
        } else {
          if (!skip) {
            dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
            setCode(undefined);
          }
        }
      }).finally(() => setCode(undefined)).catch(e => console.log(e))
    } else {
      dispatch(PUSH(translate.t('generalErrors.passCodeError')));
      setCode(undefined);
    }
  };

  const onSuccesBiometric = () => {
    goRefreshToken().then(res => {
      const {accesToken, refreshToken, skip} = res;
      if (res.accesToken !== undefined) {
        dispatch({
          type: LOGIN,
          accesToken: accesToken,
          refreshToken: refreshToken,
          isAuthenticated: true,
        });
      } else {
        if (!skip) {
          dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
          setCode(undefined);
        }
      }
    });
  };

  useEffect(() => {
      rnBiometrics.isSensorAvailable()
      .then((biometryType) => {
        if(biometryType.available) {
          setBiometricType(biometryType.biometryType?.toString() || '')
        } 
      })
      .catch(error => {
        setBiometricType('')
      });
  }, []);

  useEffect(() => {
    storage.getItem('PassCode').then(async data => {
      if (data !== null) {
        setBaseCode(data);
      }
    });
  }, []);

  const onBiometric = () => {
    if (startBiometric) {
      setStartBiometric(false);
      //return;
    }
    storage.getItem('Biometric').then(async data => {
      if (data !== null && biometricAvailable) {
        setTimeout(() => {
          setStartBiometric(true);
        }, 1000);
      }
    });
  };

  useEffect(() => {
    if(!state.isUserInitialized){
      onBiometric();
    }
    
  }, [state.isUserInitialized]);

  const getStatus = (status: boolean, available?: boolean | undefined) => {
    if (available === false) setBiometricAvailable(false);
    if (!status) setStartBiometric(false);
  };

  const activeDotBg = {backgroundColor: colors.black};
  const dotBg = {backgroundColor: colors.inputBackGround};

  const colorScheme = Appearance.getColorScheme();
  if (colorScheme === 'dark') {
    activeDotBg.backgroundColor = colors.primary;
    dotBg.backgroundColor = colors.warning;
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <TouchableOpacity
          onPress={() => setIsLoading(false)}
          style={[styles.loader]}
        >
          <>
            <ActivityIndicator size="large" color={colors.primary} />
          </>
        </TouchableOpacity>
      )}
      <BiometricAuthScreen
        start={startBiometric}
        returnStatus={getStatus}
        onSucces={onSuccesBiometric.bind(this)}
      />
      <View style={styles.user}>
        <Image
          source={{ uri: props.UserData?.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.name}>
          {props.UserData?.name} {props.UserData?.surname}
        </Text>
        <AppButton
          TextStyle={styles.changeAccountText}
          style={styles.changeAccount}
          title={translate.t("login.loginWithAnother")}
          onPress={props.onDismiss}
        />
      </View>
      <View style={styles.dots}>
        <View
          style={[styles.dot, code && code[0] ? { ...activeDotBg } : dotBg]}
        ></View>
        <View
          style={[styles.dot, code && code[1] ? { ...activeDotBg } : dotBg]}
        ></View>
        <View
          style={[styles.dot, code && code[2] ? { ...activeDotBg } : dotBg]}
        ></View>
        <View
          style={[styles.dot, code && code[3] ? { ...activeDotBg } : dotBg]}
        ></View>
      </View>
      <View style={styles.pad}>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={setNum.bind(this, "1")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setNum.bind(this, "2")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setNum.bind(this, "3")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>3</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={setNum.bind(this, "4")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setNum.bind(this, "5")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setNum.bind(this, "6")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>6</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={setNum.bind(this, "7")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setNum.bind(this, "8")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setNum.bind(this, "9")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>9</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={onBiometric} style={styles.keyNum}>
            <Image
              source={
                biometricType == "Face ID"
                  ? require("./../../assets/images/Faceid-black.png")
                  : biometricType == "Touch ID"
                  ? require("./../../assets/images/Fingerprint-black.png")
                  : require("./../../assets/images/Biometrics-black.png")
              }
              style={styles.otherImg}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setNum.bind(this, "0")}
            style={styles.keyNum}
          >
            <Text style={styles.num}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={setNum.bind(this, "-")}
            style={styles.keyNum}
          >
            <Text style={styles.del}>{translate.t("common.delete")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 47,
    paddingBottom: tabHeight,
    backgroundColor: colors.white,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  user: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  otherImg: {
    width: 60,
    height: 60,
  },
  name: {
    marginTop: 12,
    fontFamily: 'FiraGO-Bold',
    fontSize: 18,
    lineHeight: 21,
  },
  status: {
    marginTop: 20,
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  pad: {
    width: 280,
    alignSelf: 'center',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  keyNum: {
    backgroundColor: '#F1F1F1',
    width: 60,
    height: 60,
    borderRadius: 35.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  num: {
    fontFamily: 'FiraGO-Book',
    fontSize: 24,
    lineHeight: 29,
    color: colors.black,
  },
  del: {
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 17,
    color: colors.black,
  },
  changeAccount: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    alignSelf: 'center',
    backgroundColor: '#FF8F0020',
    borderRadius: 10,
    marginVertical: 10,
  },
  changeAccountText: {
    fontFamily: 'FiraGO-Book',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#FF8F00',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    elevation: 9999999999999999,
    zIndex: 99999999999999999999
  }
});

export default SetLoginWithPassCode;

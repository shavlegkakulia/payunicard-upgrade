import React, {useEffect, useState} from 'react';
import {Keyboard, KeyboardAvoidingView, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import PaginationDots from '../../../../components/PaginationDots';
import AppButton from '../../../../components/UI/AppButton';
import colors from '../../../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../../redux/action_types/translate_action_types';
import NetworkService from '../../../../services/NetworkService';
import OTPService, {
  GeneratePhoneOtpByUserRequest,
} from '../../../../services/OTPService';
import FloatingLabelInput from '../../../../containers/otp/Otp';
import {tabHeight} from '../../../../navigation/TabNav';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/core';
import Routes from '../../../../navigation/routes';
import UserService, {
  IChangeUserPasswordRequest,
} from '../../../../services/UserService';
import {PUSH} from '../../../../redux/actions/error_action';
import { getString } from '../../../../utils/Converter';
import SmsRetriever from 'react-native-sms-retriever';

type RouteParamList = {
  params: {
    email: string;
    backRoute: string;
    minimizedContent: boolean;
    password: string;
    oldPassword: string;
    confirmPassword: string;
  };
};

const ChangePasswordOtp: React.FC = () => {
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [otp, setOtp] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  const SendPhoneOTP = () => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let OTP: GeneratePhoneOtpByUserRequest = {
        otpOperationType: 4,
        userName: route.params.email,
      };
      OTPService.GeneratePhoneOtpByUser({OTP}).subscribe({
        next: Response => {
          if (Response.data.ok) {
            setOtp(undefined);
          }
        },
        error: () => {
          setIsLoading(false);
        },
        complete: () => setIsLoading(false),
      });
    });
  };

  const changePassword = () => {
    if (isLoading) return;

    if (!otp) {
      dispatch(PUSH(translate.t('otp.enterOtp')));
      return;
    }
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let User: IChangeUserPasswordRequest = {
        oldPassword: route.params.oldPassword,
        password: route.params.password,
        confirmPassword: route.params.confirmPassword,
        otp,
      };
  
      UserService.ChangeUserPassword(User).subscribe({
        next: Response => {
          if (Response.data.ok) {
            navigation.navigate(Routes.PasswordChangeSucces, {
              backRoute: route.params.backRoute,
            });
          } else {
            setIsLoading(false);
          }
        },
        error: () => {
          setIsLoading(false);
        },
        complete: () => {
          setIsLoading(false);
        },
      });
    });
  };

  useEffect(() => {
    SendPhoneOTP();
  }, []);

  const onSmsListener = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) { 
        SmsRetriever.addSmsListener(event => {
          if (event && event?.message) {
            try {
              const otpobj = /(\d{4})/g?.exec(getString(event?.message));
            if (otpobj && otpobj?.length > 0) {
              setOtp(otpobj[1]);
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
      <View style={styles.passwordResetContainer}>
        {!route.params.minimizedContent && (
          <>
            <View style={styles.passwordResetHeader}>
              <PaginationDots length={6} step={3} />
            </View>
            <Text style={styles.pwdResettext}>
              {translate.t('login.forgotpassword')}
            </Text>
          </>
        )}
        <View style={styles.inputsContainer}>
          <View style={styles.insertOtpSTep}>
            <Text style={styles.insertOtpCode}>{translate.t('otp.enterOtp')}</Text>
            <FloatingLabelInput
              Style={styles.otpBox}
              label={translate.t('otp.smsCode')}
              title={translate.t('otp.otpSent')}
              value={otp}
              onChangeText={setOtp}
              onRetry={SendPhoneOTP}
            />
          </View>
          <AppButton
            title={translate.t('common.next')}
            onPress={changePassword}
            isLoading={isLoading}
          />
        </View>
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
  passwordResetContainer: {
    flex: 1,
    padding: 24,
    minHeight: 450,
    paddingBottom: tabHeight + 40,
  },
  passwordResetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 16,
    color: colors.black,
    marginBottom: 34,
    marginTop: 0,
  },
  inputsContainer: {
    justifyContent: 'space-between',
    flex: 1,
  },
  pwdResettext: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 24,
    lineHeight: 29,
    color: colors.black,
    marginBottom: 36,
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
});

export default ChangePasswordOtp;

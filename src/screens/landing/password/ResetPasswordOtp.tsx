import React, { useEffect, useState} from 'react';
import {Keyboard, KeyboardAvoidingView, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import PaginationDots from '../../../components/PaginationDots';
import AppButton from '../../../components/UI/AppButton';
import colors from '../../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import NetworkService from '../../../services/NetworkService';
import OTPService, {
  GeneratePhoneOtpByUserRequest,
  ISubmitPhoneOtpByUserRequest,
} from '../../../services/OTPService';
import FloatingLabelInput from '../../../containers/otp/Otp';
import {tabHeight} from '../../../navigation/TabNav';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/core';
import Routes from '../../../navigation/routes';
import SmsRetriever from 'react-native-sms-retriever';
import { getString } from '../../../utils/Converter';

type RouteParamList = {
  params: {
    email: string | undefined;
    phone: string | undefined;
    personalNumber: string | undefined;
    minimizedContent: boolean | undefined
  };
};

const ResetPasswordOtp: React.FC = () => {
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [otp, setOtp] = useState<string | undefined>();
  const [otpGuid, setOtpGuid] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();

  const onOtpHandle = (_otp?: string) => {
    setOtp(_otp?.replace(/[^0-9]/g, ''));
  }

  const SendPhoneOTP = () => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let OTP: GeneratePhoneOtpByUserRequest = {
        otpOperationType: '2',
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

  const SubmitPhoneOtpByUser = () => {
    console.log('otp', otp)
    setIsLoading(true)
    NetworkService.CheckConnection(() => {
      let OTP: ISubmitPhoneOtpByUserRequest = {otp: otp, userName: route.params.email};
      
      OTPService.SubmitPhoneOtpByUser({OTP}).subscribe({
        next: Response => {
          setIsLoading(false)
          if (Response.data.ok) {
            setOtpGuid(Response.data.data?.otpGuid);
            navigation.navigate(Routes.PasswordResetStepFour, {
              email: route.params.email,
              phone: route.params.phone,
              personalNumber: route.params.personalNumber,
              otpGuid,
              otp,
              minimizedContent: route.params.minimizedContent,
            });
          }
        },
        error: error => {
          setIsLoading(false)
          console.log('error.response ==> ', JSON.parse(JSON.stringify(error.response)))
        }
      });
    });
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
              setOtp(otpobj[1]);
              Keyboard.dismiss();
            }
            } catch (error) {
              console.log(JSON.stringify(error))
            }
          }
        }); 
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
        {!route.params.minimizedContent && <><View style={styles.passwordResetHeader}>
          <PaginationDots length={2} step={1} />
        </View></>}
        <View style={styles.inputsContainer}>
          <View style={styles.insertOtpSTep}>
            <Text style={styles.insertOtpCode}>{translate.t('otp.enterOtp')}</Text>
            <FloatingLabelInput
              Style={styles.otpBox}
              label={translate.t('otp.smsCode')}
              title={translate.t('otp.otpSent')}
              value={otp}
              onChangeText={onOtpHandle}
              onRetry={SendPhoneOTP}
              resendTitle = {translate.t('otp.resend')}

            />
          </View>
          <AppButton
            title={translate.t('common.next')}
            onPress={() => {
              SubmitPhoneOtpByUser();
            }}
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
  insertOtpSTep: {
    marginTop: 25,
  },
  insertOtpCode: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.black,
    fontSize: 21,
    lineHeight: 26,
    textAlign: 'left',
  },
  otpBox: {
    marginTop: 40,
  },
});

export default ResetPasswordOtp;

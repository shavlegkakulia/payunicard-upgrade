import React, {useCallback, useEffect, useState} from 'react';
import {Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import PaginationDots from '../../components/PaginationDots';
import AppButton from '../../components/UI/AppButton';
import Validation, {
  hasLower,
  hasNumeric,
  hasSpecial,
  hasUpper,
  hasWrongSimbol,
  required,
} from '../../components/UI/Validation';
import colors from '../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../redux/action_types/translate_action_types';
import Appinput, {PasswordValidation} from '../../components/UI/AppInput';
import NetworkService from '../../services/NetworkService';
import OTPService, {
  GeneratePhoneOtpByUserRequest,
  ISubmitPhoneOtpByUserRequest,
} from '../../services/OTPService';
import FloatingLabelInput from '../../containers/otp/Otp';
import UserService, {
  ICheckUserPersonalIdRequest,
  IResetPasswordRequest,
} from '../../services/UserService';
import SuccesContent from '../../containers/SuccesContent';
import SmsRetriever from 'react-native-sms-retriever';
import { getString } from '../../utils/Converter';
// import analytics from '@react-native-firebase/analytics';
import Routes from '../../navigation/routes';

interface IProps {
  onComplate: () => void;
  sendHeader?: (element: JSX.Element | null) => void;
}

const MAX_STEP = 4;
export const PWDRESET_STEPS = {
  STEP_ZERO: 0,
  STEP_ONE: 1,
  STEP_TWO: 2,
  STEP_THREE: 3,
  STEP_FOUR: 4,
  STEP_FIVE: 5,
};
const VALIDATION_CONTEXT = 'PasswordReset';

const PasswordReset: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [pwdResetStep, setPwdResetStep] = useState<number>(0);
  const [email, setEmail] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [oldPassword, setOldPassword] = useState<string | undefined>();
  const [confirmPassword, setConfirmPassword] = useState<string | undefined>(
  );
  const [otpSource, setOtpSource] = useState<string | undefined>('Phone');
  const [personalNumber, setPersonalNumber] = useState<string | undefined>();
  const [otp, setOtp] = useState<string | undefined>();
  const [otpGuid, setOtpGuid] = useState<string | undefined>();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onPersonalNumberHandle = (pn?: string) => {
    setPersonalNumber(pn?.replace(/[^0-9]/g, ''));
  }

  // useEffect(() => {
  //   (async() => {
  //     await analytics().logScreenView({
  //       screen_name: Routes.ResetPassword,
  //       screen_class: Routes.ResetPassword,
  //     });
  //   })();
  // }, []);

  const SendPhoneOTP = () => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let OTP: GeneratePhoneOtpByUserRequest = {
        otpOperationType: '2',
        userName: email,
      };
      OTPService.GeneratePhoneOtpByUser({OTP}).subscribe({
        next: Response => {
          if (Response.data.ok) {
            nextStep(PWDRESET_STEPS.STEP_THREE);
          }
        },
        error: err => {
          setIsLoading(false);
        },
        complete: () => setIsLoading(false),
      });
    });
  };

  const SubmitPhoneOtpByUser = () => {
    if (Validation.validate(VALIDATION_CONTEXT)) {
      return;
    }
    NetworkService.CheckConnection(() => {
      let OTP: ISubmitPhoneOtpByUserRequest = {otp: otp, userName: email};

      OTPService.SubmitPhoneOtpByUser({OTP}).subscribe({
        next: Response => {
          if (Response.data.ok) {
            setOtpGuid(Response.data.data?.otpGuid);
            nextStep();
          }
        },
        error: () => {},
      });
    });
  };

  const resetPassword = () => {
    if (Validation.validate(VALIDATION_CONTEXT)) {
      return;
    }

    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let User: IResetPasswordRequest = {
        personalID: personalNumber,
        password,
        confirmPassword,
        userName: email,
        otp,
        otpGuid,
        otpSource,
      };

      UserService.ResetPassword(User).subscribe({
        next: Response => {
          nextStep(PWDRESET_STEPS.STEP_FIVE);
          if (Response.data.ok) {
            nextStep(PWDRESET_STEPS.STEP_FIVE);
          }
        },
        error: () => {
          nextStep(PWDRESET_STEPS.STEP_FIVE);
          setIsLoading(false);
        },
        complete: () => {
          setIsLoading(false);
        },
      });
    });
  };

  const GetPasswordResetData = () => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      UserService.GetPasswordResetData(email).subscribe({
        next: Response => {
          if (Response.data.ok) {
            if (Response.data.data?.resetData?.length) {
              setPhone(Response.data.data?.resetData[0].mask);
              nextStep(PWDRESET_STEPS.STEP_TWO);
            }
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

  const checkUser = () => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let User: ICheckUserPersonalIdRequest = {userName: email};
      UserService.CheckUser(User).subscribe({
        next: Response => {
          if (Response.data.ok) {
            if (Response.data.data?.isRegistred) {
              setIsRegistered(true);
              nextStep(PWDRESET_STEPS.STEP_ONE);
              return;
            }
            GetPasswordResetData();
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

  const nextStep = useCallback(
    (step: number = -1) => {
      if (Validation.validate(VALIDATION_CONTEXT)) {
        return;
      }

      setPwdResetStep(s => {
        if (step >= PWDRESET_STEPS.STEP_ZERO) {
          return step;
        }

        if (s === PWDRESET_STEPS.STEP_ZERO) {
          checkUser();

          return s;
        }

        if (s === PWDRESET_STEPS.STEP_ONE) {
          GetPasswordResetData();

          return s;
        }

        if (s === PWDRESET_STEPS.STEP_TWO) {
          SendPhoneOTP();

          return s;
        }

        if (s === PWDRESET_STEPS.STEP_FOUR) {
          return s;
        }

        s += 1;
        if (s === MAX_STEP) {
          return s;
        }

        return s;
      });
    },
    [pwdResetStep],
  );

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

  let pwdResetStepView = null,
    pwdResetHeaderText = null,
    pwdResetButton = (
      <AppButton
        isLoading={isLoading}
        title={translate.t('common.next')}
        onPress={nextStep}
      />
    );

  if (pwdResetStep === PWDRESET_STEPS.STEP_ZERO) {
    pwdResetHeaderText = (
      <Text style={styles.pwdResettext}>
        {translate.t('login.forgotpassword')}
      </Text>
    );
    pwdResetStepView = (
      <View>
        <Appinput
          requireds={[required]}
          customKey="email"
          context={VALIDATION_CONTEXT}
          style={styles.pwdResetInput}
          value={email}
          onChange={setEmail}
          placeholder={'Username/Email'}
        />
      </View>
    );
  } else if (pwdResetStep === PWDRESET_STEPS.STEP_ONE) {
    pwdResetStepView = (
      <View>
        <Appinput
          requireds={[required]}
          customKey="email"
          context={VALIDATION_CONTEXT}
          style={styles.pwdResetInput}
          value={email}
          onChange={setEmail}
          placeholder={'Username/Email'}
        />

        {isRegistered ? (
          <Appinput
            requireds={[required]}
            customKey="pn"
            context={VALIDATION_CONTEXT}
            style={styles.pwdResetInput}
            value={personalNumber}
            onChange={onPersonalNumberHandle}
            // maxLength={11}
            // minLength={11}
            keyboardType={'numeric'}
            placeholder={translate.t('common.personalNumber')}
          />
        ) : null}
      </View>
    );
  } else if (pwdResetStep === PWDRESET_STEPS.STEP_TWO) {
    pwdResetStepView = (
      <View>
        <Appinput
          requireds={[required]}
          customKey="email"
          context={VALIDATION_CONTEXT}
          style={styles.pwdResetInput}
          value={email}
          onChange={setEmail}
          placeholder={translate.t('login.usernameEmail')}
        />

        {isRegistered ? (
          <Appinput
            requireds={[required]}
            customKey="pn"
            context={VALIDATION_CONTEXT}
            style={styles.pwdResetInput}
            value={personalNumber}
            onChange={onPersonalNumberHandle}
            // maxLength={11}
            // minLength={11}
            keyboardType={'default'}
            placeholder={translate.t('common.personalNumber')}
          />
        ) : null}

        <Appinput
          requireds={[required]}
          customKey="phone"
          context={VALIDATION_CONTEXT}
          style={styles.pwdResetInput}
          value={phone}
          onChange={e => {
              let reg = /^\d+$/;
              if (reg.test(e) || !e) setPhone(e);
            }
          }
          placeholder={translate.t('services.telephone')}
        />
      </View>
    );
  } else if (pwdResetStep === PWDRESET_STEPS.STEP_THREE) {
    pwdResetStepView = (
      <View style={styles.insertOtpSTep}>
        <Text style={styles.insertOtpCode}>{translate.t('otp.enterOtp')}</Text>
        <FloatingLabelInput
          Style={styles.otpBox}
          label={translate.t('otp.smsCode')}
          title={translate.t('otp.otpSentBlank')}
          value={otp}
          onChangeText={setOtp}
          onRetry={SendPhoneOTP}
        />
      </View>
    );
    pwdResetButton = (
      <AppButton
        title={translate.t('common.next')}
        onPress={() => {
          SubmitPhoneOtpByUser();
        }}
      />
    );
  } else if (pwdResetStep === PWDRESET_STEPS.STEP_FOUR) {
    pwdResetStepView = (
      <View style={styles.insertOtpSTep}>
        <Appinput
          requireds={[required, hasLower, hasUpper, hasNumeric, hasSpecial, hasWrongSimbol]}
          minLength={8}
          customKey="password"
          context={VALIDATION_CONTEXT}
          style={styles.formInput}
          value={password}
          onChange={input => setPassword(input)}
          secureTextEntry={true}
          placeholder={translate.t('login.password')}
        />

        <PasswordValidation value={password || ''} />

        <Appinput
          requireds={[required, hasWrongSimbol]}
          customKey="repeatpassword"
          context={VALIDATION_CONTEXT}
          style={styles.formInput}
          value={confirmPassword}
          equalsTo={password}
          onChange={input => setConfirmPassword(input)}
          secureTextEntry={true}
          placeholder={translate.t('login.repeatPassword')}
        />
      </View>
    );
    pwdResetButton = (
      <AppButton
        title={translate.t('common.next')}
        isLoading={isLoading}
        onPress={() => {
          resetPassword();
        }}
      />
    );
  } else if (pwdResetStep === PWDRESET_STEPS.STEP_FIVE) {
    pwdResetStepView = (
      <SuccesContent
        statusText={translate.t('password.pasChanged')}
        style={styles.succesStyle}
      />
    );
    pwdResetButton = (
      <AppButton
        title={translate.t('common.close')}
        isLoading={isLoading}
        onPress={() => {
          props.onComplate();
        }}
      />
    );
  }

  return (
    <ScrollView keyboardShouldPersistTaps='handled'>
    <View style={styles.passwordResetContainer}>
      <View style={styles.passwordResetHeader}>
        <PaginationDots length={6} step={pwdResetStep} />
      </View>
      {pwdResetHeaderText}
      <View style={styles.inputsContainer}>
        {pwdResetStepView}
        {pwdResetButton}
      </View>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  passwordResetContainer: {
    flex: 1,
    padding: 24,
    minHeight: 450,
    paddingTop: 0,
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
  back: {
    height: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backImg: {
    marginRight: 12,
  },
  backText: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.primary,
    fontSize: 14,
    lineHeight: 17,
    textTransform: 'uppercase',
  },
  pwdResettext: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 24,
    lineHeight: 29,
    color: colors.black,
    marginBottom: 36,
  },
  pwdResetInput: {
    backgroundColor: '#F6F6F4',
    marginBottom: 16,
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
  succesStyle: {
    bottom: 20,
  },
  formInput: {
    marginBottom: 10,
  },
});

export default PasswordReset;

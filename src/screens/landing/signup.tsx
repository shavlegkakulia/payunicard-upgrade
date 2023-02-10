import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Keyboard} from 'react-native';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from './../../redux/action_types/translate_action_types';
import Appinput, {autoCapitalize, PasswordValidation} from '../../components/UI/AppInput';
import AppButton from '../../components/UI/AppButton';
import AppCheckbox from '../../components/UI/AppCheckbox';
import PaginationDots from '../../components/PaginationDots';
import colors from '../../constants/colors';
import Validation, {
  email as _email,
  required,
  hasLower,
  hasNumeric,
  hasSpecial,
  hasUpper,
  checked,
  hasWrongSimbol,
} from './../../components/UI/Validation';
import {useSelector} from 'react-redux';
import AuthService, {IRegisterRequest} from './../../services/AuthService';
import OTPService, {
  IOTPServiceRequest,
  ISubmitPhoneOTP,
} from './../../services/OTPService';
import NetworkService from '../../services/NetworkService';
import FloatingLabelInput from '../../containers/otp/Otp';
import DatePicker from 'react-native-date-picker';
import {formatDate} from '../../utils/utils';
import { getString } from '../../utils/Converter';
import SmsRetriever from 'react-native-sms-retriever';
// import analytics from '@react-native-firebase/analytics';
import Routes from '../../navigation/routes';
import { EN, KA, ka_ge } from '../../lang';

interface IProps {
  onComplate: (step: number) => void;
  sendHeader?: (element: JSX.Element | null) => void;
}

const MAX_STEP = 5;
export const REG_STEPS = {
  STEP_ZERO: 0,
  STEP_ONE: 1,
  STEP_TWO_OTP: 2,
  STEP_THREE: 3,
  STEP_FOUR: 4,
  STEP_FIVE: 5,
  STEP_SIX: 6,
};
const VALIDATION_CONTEXT = 'signup';

const SignupForm: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [isLoading, setIsLoading] = useState(false);
  const [regStep, setRegStep] = useState<number>(0);
  const [phone, setPhone] = useState<string | undefined>('');
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [birthDate, setBirtDate] = useState<Date>(new Date());
  const [personalId, setPerosnalId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isApplyTerms, setIsApplyTerms] = useState<number>(1);
  const [otpGuid, setOtpGuid] = useState<string | undefined>();
  const [chooseDate, setChooseDate] = useState<boolean>(false);

  // useEffect(() => {
  //   (async() => {
  //     await analytics().logScreenView({
  //       screen_name: Routes.Signup,
  //       screen_class: Routes.Signup,
  //     });
  //   })();
  // }, []);

  const setAgreement = (value: boolean) => {
    setIsApplyTerms(value ? 1 : 0);
  };

  const SendPhoneOTP = () => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let OTP: IOTPServiceRequest = {otpOperationType: 1, phone};
      OTPService.SendPhoneOTP({OTP}).subscribe({
        next: Response => {
          if (Response.data.ok) {
            nextStep(REG_STEPS.STEP_THREE);
          }
        },
        error: () => {
          setIsLoading(false);
        },
        complete: () => setIsLoading(false),
      });
    });
  };

  const SubmitPhoneOTP = () => {
    NetworkService.CheckConnection(() => {
      let OTP: ISubmitPhoneOTP = {otp: otpGuid, phone: phone};

      OTPService.SubmitPhoneOTP({OTP}).subscribe({
        next: Response => {
          if (Response.data.ok) {
            registerUser(Response.data.data.otpGuid);
          }
        },
        error: () => {},
      });
    });
  };

  const registerUser = (otp: string) => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let User: IRegisterRequest = {
        password,
        confirmPassword,
        userName,
        name,
        birthDate,
        isApplyTerms,
        surname,
        otpGuid: otp,
        personalId,
        phone,
      };
      AuthService.SignUp({User}).subscribe({
        next: Response => {
          if (Response.data.ok) {
            nextStep(REG_STEPS.STEP_FOUR);
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

  const prevStep = () => {
    if (regStep <= REG_STEPS.STEP_ZERO) return;
    setRegStep(step => (step = step - 1));
  };

  const nextStep = useCallback(
    (step: number = -1) => {
      if (Validation.validate(VALIDATION_CONTEXT)) {
        return;
      }

      setRegStep(s => {
        if (step >= REG_STEPS.STEP_ZERO) {
          return step;
        }

        if (s === REG_STEPS.STEP_TWO_OTP) {
          SendPhoneOTP();

          return s;
        }

        s += 1;
        if (s === MAX_STEP) {
          return s;
        }

        return s;
      });

      if (step >= REG_STEPS.STEP_ZERO) {
        props.onComplate(step);
      }
    },
    [regStep],
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

  let signupStep = null,
    signupHeaderText = null,
    singupButton = (
      <AppButton
        isLoading={isLoading}
        title={translate.t('common.next')}
        onPress={nextStep}
      />
    );

  if (regStep === REG_STEPS.STEP_ZERO) {
    signupHeaderText = (
      <Text style={styles.signupSignuptext}>
        {translate.t('signup.startRegister')}
      </Text>
    );
    signupStep = (
      <View>
        <Appinput
          requireds={[required]}
          customKey="phone"
          context={VALIDATION_CONTEXT}
          style={styles.signupInput}
          value={phone}
          onChange={setPhone}
          keyboardType={'phone-pad'}
          placeholder={'+995 5XX XXX XXX'}
        />

        <Appinput
          requireds={[required]}
          customKey="name"
          context={VALIDATION_CONTEXT}
          style={styles.signupInput}
          value={name}
          onChange={setName}
          placeholder={translate.t('common.name')}
        />

        <Appinput
          requireds={[required]}
          customKey="lname"
          context={VALIDATION_CONTEXT}
          style={styles.signupInput}
          value={surname}
          onChange={setSurname}
          placeholder={translate.t('common.lname')}
        />
      </View>
    );
  } else if (regStep === REG_STEPS.STEP_ONE) {
    signupStep = (
      <View>
        <TouchableOpacity onPress={() => setChooseDate(true)}>
          <View style={styles.InputBox}>
           
              <Text style={styles.InputBoxTitle}>{translate.t('common.birthDate')}</Text>
            
              <Text style={styles.birthDateValue}>{formatDate(birthDate?.toString()).split('.').join('/')}</Text>
            
          </View>
        </TouchableOpacity>

        <Appinput
          requireds={[required]}
          customKey="personalnumber"
          context={VALIDATION_CONTEXT}
          style={styles.signupInput}
          value={personalId}
          onChange={setPerosnalId}
          keyboardType={'numeric'}
          placeholder={translate.t('common.personalNumber')}
        />

        <Appinput
          requireds={[_email]}
          customKey="email"
          context={VALIDATION_CONTEXT}
          style={styles.signupInput}
          value={userName}
          onChange={setUserName}
          keyboardType={'email-address'}
          autoCapitalize={autoCapitalize.none}
          placeholder={translate.t('login.email')}
        />
      </View>
    );
  } else if (regStep === REG_STEPS.STEP_TWO_OTP) {
    signupStep = (
      <View>
        <Appinput
          requireds={[required, hasLower, hasUpper, hasNumeric, hasSpecial, hasWrongSimbol]}
          minLength={8}
          customKey="password"
          context={VALIDATION_CONTEXT}
          style={styles.formInputs}
          value={password}
          onChange={input => setPassword(input)}
          secureTextEntry={true}
          placeholder={translate.t('login.password')}
        />

        <PasswordValidation value={password} />

        <Appinput
          requireds={[required, hasWrongSimbol]}
          customKey="repeatpassword"
          context={VALIDATION_CONTEXT}
          style={styles.formInputs}
          value={confirmPassword}
          equalsTo={password}
          onChange={input => setConfirmPassword(input)}
          secureTextEntry={true}
          placeholder={translate.t('login.repeatPassword')}
        />

        <AppCheckbox
          customKey="agree"
          requireds={[checked]}
          context={VALIDATION_CONTEXT}
          value={isApplyTerms != 0}
          style={styles.termCheckBox}
          activeColor={colors.primary}
          label={translate.t('common.agreeTerms')}
          clicked={setAgreement}
        />
      </View>
    );
  } else if (regStep === REG_STEPS.STEP_THREE) {
    signupStep = (
      <View style={styles.insertOtpSTep}>
        <Text style={styles.insertOtpCode}>{translate.t('otp.enterOtp')}</Text>
        <FloatingLabelInput
          Style={styles.otpBox}
          label={translate.t('otp.smsCode')}
          title={translate.t('otp.otpSentBlank')}
          value={otpGuid}
          onChangeText={setOtpGuid}
          onRetry={SendPhoneOTP}
        />
      </View>
    );
    singupButton = (
      <AppButton
        title={translate.t('common.next')}
        onPress={() => {
          SubmitPhoneOTP();
        }}
      />
    );
  } else if (regStep === REG_STEPS.STEP_FOUR) {
    signupStep = (
      <View style={styles.singupSuccess}>
        <Image
          style={styles.singupSuccessImg}
          source={require('./../../assets/images/signup-success.png')}
        />
        <Text style={styles.singupSuccessText}>
          {translate.t('signup.simpleRegistrationComplate')}
        </Text>
        <Text style={styles.singupSuccessText1}>
          {translate.t('signup.addCardsToPoints')}
        </Text>
      </View>
    );
    singupButton = (
      <AppButton
        title={translate.t('common.close')}
        onPress={() => {
          nextStep(REG_STEPS.STEP_FIVE);
        }}
      />
    );
  }

  const regdate = useMemo(() => {
    return (
      <DatePicker
        modal
        mode="date"
        maximumDate={new Date()}
        timeZoneOffsetInMinutes={-7 * 60}
        locale={translate.key === ka_ge ? KA : EN}
        open={chooseDate}
        date={birthDate}
        onDateChange={() => {}}
        onConfirm={date => {
          setChooseDate(false);
          setBirtDate(date);
        }}
        onCancel={() => {
          setChooseDate(false);
        }}
      />
    );
  }, [chooseDate, birthDate]);

  return (
    <View style={styles.signupContainer}>
      <View
        style={[
          styles.signupHeader,
          regStep === REG_STEPS.STEP_ZERO && {justifyContent: 'flex-end'},
        ]}>
        {regStep > REG_STEPS.STEP_ZERO && (
          <TouchableOpacity style={styles.back} onPress={prevStep}>
            <Image
              style={styles.backImg}
              source={require('./../../assets/images/back-arrow-primary.png')}
            />
            <Text style={styles.backText}>{translate.t('common.back')}</Text>
          </TouchableOpacity>
        )}
        <PaginationDots length={5} step={regStep} />
      </View>
      {signupHeaderText}
      <View style={styles.inputsContainer}>
        {signupStep}
        {singupButton}
      </View>

{regdate}
    </View>
  );
};

const styles = StyleSheet.create({
  signupContainer: {
    flex: 1,
    padding: 24,
    minHeight: 450,
    paddingTop: 0,
  },

  signupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 16,
    color: colors.black,
    marginBottom: 34,
    marginTop: 0,
  },

  signupSignuptext: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 24,
    lineHeight: 29,
    color: colors.black,
    marginBottom: 36,
  },

  inputsContainer: {
    justifyContent: 'space-between',
    flex: 1,
  },

  signupInput: {
    backgroundColor: '#F6F6F4',
    marginBottom: 16,
  },

  singupSuccess: {
    marginTop: 17,
    padding: 22,
    alignSelf: 'center',
  },

  singupSuccessImg: {
    alignSelf: 'center',
  },

  singupSuccessText: {
    fontFamily: 'FiraGO-Regular',
    color: colors.black,
    fontSize: 24,
    lineHeight: 29,
    textAlign: 'center',
    marginTop: 79,
    marginBottom: 29,
  },

  singupSuccessText1: {
    fontFamily: 'FiraGO-Regular',
    color: colors.labelColor,
    marginBottom: 29,
    fontSize: 16,
    lineHeight: 19,
    textAlign: 'center',
    width: 290,
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
  InputBox: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
    height: 59,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  InputBoxTitle: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  birthDateValue: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black, 
    marginTop: 5
  },
  formInputs: {
    marginBottom: 10
  },
  termCheckBox: {
    alignSelf: 'flex-start', 
    marginBottom: 47
  }
});

export default memo(SignupForm);

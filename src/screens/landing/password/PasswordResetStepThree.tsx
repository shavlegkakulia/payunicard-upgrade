import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import PaginationDots from '../../../components/PaginationDots';
import AppButton from '../../../components/UI/AppButton';
import Validation, {required} from '../../../components/UI/Validation';
import colors from '../../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import Appinput from '../../../components/UI/AppInput';
import NetworkService from '../../../services/NetworkService';
import OTPService, {
  GeneratePhoneOtpByUserRequest,
} from '../../../services/OTPService';
import {tabHeight} from '../../../navigation/TabNav';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/core';
import Routes from '../../../navigation/routes';

type RouteParamList = {
  params: {
    email: string | undefined;
    phone: string | undefined;
    personalNumber: string | undefined;
  };
};

const VALIDATION_CONTEXT = 'PasswordReset3';

const PasswordResetStepThree: React.FC = () => {
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [phone, setPhone] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();
  

  useEffect(() => {
    setPhone(route.params.phone)
  }, [route.params.phone])

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
            navigation.navigate(Routes.ResetPasswordOtp, {
              email: route.params.email,
              phone,
              personalNumber: route.params.personalNumber,
            });
          } else {
            setIsLoading(false);
          }
        },
        error: () => {
          setIsLoading(false);
        },
        complete: () => setIsLoading(false),
      });
    });
  };

  const nextStep = () => {
    if (Validation.validate(VALIDATION_CONTEXT)) {
      return;
    }
    SendPhoneOTP();
  };

  return (
    <ScrollView contentContainerStyle={styles.avoid}  keyboardShouldPersistTaps='handled'>
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={styles.avoid}>
      <View style={styles.passwordResetContainer}>
        <View style={styles.passwordResetHeader}>
          <PaginationDots length={6} step={2} />
        </View>
        <Text style={styles.pwdResettext}>
          {translate.t('login.forgotpassword')}
        </Text>
        <View style={styles.inputsContainer}>
          <View>
            <Appinput
              requireds={[required]}
              customKey="email"
              context={VALIDATION_CONTEXT}
              style={styles.pwdResetInput}
              value={route.params.email}
              onChange={() => {}}
              placeholder={translate.t('login.usernameEmail')}
            />

            <Appinput
              requireds={[required]}
              customKey="pn"
              context={VALIDATION_CONTEXT}
              style={styles.pwdResetInput}
              value={route.params.personalNumber}
              onChange={() => {}}
              placeholder={translate.t('common.personalNumber')}
              editable={false}
            />

            <Appinput
              customKey="phone"
              context={VALIDATION_CONTEXT}
              style={styles.pwdResetInput}
              value={phone}
              onChange={e => {
                let reg = /^\d+$/;
                if (reg.test(e) || !e) setPhone(e);
              }}
              keyboardType={'phone-pad'}
              placeholder={translate.t('services.telephone')}
            />
          </View>
          <AppButton
            isLoading={isLoading}
            title={translate.t('common.next')}
            onPress={nextStep}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
    </ScrollView>
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
  pwdResettext: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 21,
    lineHeight: 26,
    color: colors.black,
    marginBottom: 36,
  },
  pwdResetInput: {
    backgroundColor: '#F6F6F4',
    marginBottom: 16,
  },
});

export default PasswordResetStepThree;

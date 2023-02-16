import React, {useState} from 'react';
import {KeyboardAvoidingView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import PaginationDots from '../../../../components/PaginationDots';
import AppButton from '../../../../components/UI/AppButton';
import Validation, {
  email as emailRequiredd,
  hasLower,
  hasNumeric,
  hasSpecial,
  hasUpper,
  hasWrongSimbol,
  required,
} from '../../../../components/UI/Validation';
import colors from '../../../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../../redux/action_types/translate_action_types';
import Appinput, {PasswordValidation} from '../../../../components/UI/AppInput';
import {tabHeight} from '../../../../navigation/TabNav';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Routes from '../../../../navigation/routes';
import NavigationService from '../../../../services/NavigationService';
import NetworkService from '../../../../services/NetworkService';
import UserService, {
  IChangePassBySystemRequest,
} from '../../../../services/UserService';
import { PUSH } from '../../../../redux/actions/error_action';

type RouteParamList = {
  params: {
    email: string | undefined;
    backRoute: string | undefined;
    minimizedContent: boolean | undefined;
    systemRequired: boolean | undefined;
  };
};

const VALIDATION_CONTEXT = 'PasswordChange5';

const PasswordChangeStepFour: React.FC = () => {
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [oldPassword, setOldPassword] = useState<string | undefined>('');
  const [password, setPassword] = useState<string | undefined>('');
  const [confirmPassword, setConfirmPassword] = useState<string | undefined>(
    '',
  );
  const [email, setEmail] = useState<string | undefined>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  const changePassBySystem = () => {
    if (isLoading) return;
    setIsLoading(true);
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let User: IChangePassBySystemRequest = {
        oldPassword,
        newPassword: password,
        confirmNewPassword: confirmPassword,
        userName: email,
      };
     
      UserService.changePassBySystem(User).subscribe({
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

  const next = () => {
    if(password !== confirmPassword) {
      dispatch(PUSH(translate.t('forgotPassword.PasswordDoesNotMatch')))
    }
    if (Validation.validate(VALIDATION_CONTEXT)) {
      return;
    }

    if (password === oldPassword) {
      dispatch(PUSH(translate.t('login.oldPassword')));
      return;
    }

    if (route.params.systemRequired) {
      changePassBySystem();
      return;
    }

    NavigationService.navigate(Routes.ChangePasswordOtp, {
      email: route.params.email,
      backRoute: route.params.backRoute,
      minimizedContent: route.params.minimizedContent,
      password,
      oldPassword,
      confirmPassword,
    });
  };

  return (
    <ScrollView keyboardShouldPersistTaps='handled' style={{backgroundColor: colors.white}}>
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={styles.avoid}>
      <View style={styles.passwordResetContainer}>
        {!route.params.minimizedContent && (
          <>
            <View style={styles.passwordResetHeader}>
              <PaginationDots length={6} step={4} />
            </View>
            <Text style={styles.pwdResettext}>
              {translate.t('login.forgotpassword')}
            </Text>
          </>
        )}
        <View style={styles.inputsContainer}>
          <View style={styles.insertOtpSTep}>
            {route.params.systemRequired === true && (
              <Appinput
                requireds={[required]}
                minLength={1}
                customKey="email"
                context={VALIDATION_CONTEXT}
                style={styles.formInput}
                value={email}
                onChange={input => setEmail(input)}
                placeholder={translate.t('common.email')}
              />
            )}

            <Appinput
              requireds={[required]}
              minLength={8}
              customKey="aldpassword"
              context={VALIDATION_CONTEXT}
              style={styles.formInput}
              value={oldPassword}
              onChange={input => setOldPassword(input)}
              secureTextEntry={true}
              placeholder={translate.t('login.oldPassword')}
            />

            <Appinput
              requireds={[required, hasLower, hasUpper, hasNumeric, hasSpecial, hasWrongSimbol]}
              minLength={8}
              customKey="password"
              context={VALIDATION_CONTEXT}
              style={styles.formInput}
              value={password}
              onChange={input => setPassword(input)}
              secureTextEntry={true}
              placeholder={translate.t('login.newPassword')}
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
              placeholder={translate.t('forgotPassword.confirmPassword')}
            />
          </View>
          <AppButton
            title={translate.t('common.next')}
            onPress={next}
            isLoading={isLoading}
            style={{marginTop: 40}}
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
  formInput: {
    marginBottom: 10,
  },
});

export default PasswordChangeStepFour;

import React from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import {useSelector} from 'react-redux';
import AppButton from '../../components/UI/AppButton';
import AppInput from '../../components/UI/AppInput';
import Validation, {required} from '../../components/UI/Validation';
import colors from '../../constants/colors';
import {
  IAuthState,
  IGlobalState as IAuthGlobalState,
} from '../../redux/action_types/auth_action_types';
import {
  ITranslateState,
  IGlobalState,
} from '../../redux/action_types/translate_action_types';
import {useNavigation} from '@react-navigation/core';
import Routes from '../../navigation/routes';

interface IProps {
  UserData: any;
  userPassword: string;
  isLoading: boolean;
  onDismiss?: () => void;
  onLogin: () => void;
  onSetPassword: (password: string) => void;
}

const CONTEXT_TYPE = 'loginWithPassword';

const LoginWithPassword: React.FC<IProps> = ({
  UserData,
  userPassword,
  isLoading,
  onLogin,
  onSetPassword,
  onDismiss = Function,
}) => {
  const translate = useSelector<IGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const state = useSelector<IAuthGlobalState>(
    state => state.AuthReducer,
  ) as IAuthState;
  const navigation = useNavigation<any>();
  const login = () => {
    if (Validation.validate(CONTEXT_TYPE)) {
      return;
    }
    if (state.isLoading || isLoading) return;
    onLogin();
  };

  const NavigateToPWDReset = () => {
    navigation.navigate(Routes.ResetPassword);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{uri: UserData.imageUrl}} />
        <Text style={styles.username}>{UserData.username}</Text>
        <AppButton
          TextStyle={styles.changeAccountText}
          style={styles.changeAccount}
          title={translate.t('login.loginWithAnother')}
          onPress={onDismiss}
        />
      </View>
      <View style={styles.inputsView}>
        <View style={styles.inputsContainer}>
          <AppInput
            placeholder={translate.t('login.password')}
            value={userPassword}
            requireds={[required]}
            customKey="password"
            context={CONTEXT_TYPE}
            secureTextEntry={true}
            onChange={password => {
              onSetPassword(password);
            }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <AppButton
            title={translate.t('login.authorization')}
            onPress={login}
            isLoading={state.isLoading || isLoading}
          />

          <AppButton
            backgroundColor={`${colors.white}`}
            style={styles.btnForgotPassword}
            color={`${colors.black}`}
            title={translate.t('login.forgotpassword')}
            onPress={NavigateToPWDReset}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '80%',
    justifyContent: 'space-between',
  },
  imageContainer: {
    backgroundColor: colors.white,
    marginBottom: 45,
  },
  buttonContainer: {
    marginBottom: 35,
  },
  inputsContainer: {
    marginBottom: 23,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 96 / 2,
    alignSelf: 'center',
  },
  username: {
    fontFamily: 'FiraGO-Book',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 24,
    color: colors.black,
    padding: 10,
    alignSelf: 'center',
  },
  changeAccount: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    alignSelf: 'center',
    backgroundColor: '#FF8F0020',
    borderRadius: 10,
    marginTop: 10,
  },
  changeAccountText: {
    fontFamily: 'FiraGO-Book',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#FF8F00',
  },
  btnForgotPassword: {
    marginTop: 5,
  },
  inputsView: {
    marginBottom: 40,
  },
});

export default LoginWithPassword;

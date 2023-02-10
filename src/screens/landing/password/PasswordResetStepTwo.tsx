import React, { useState} from 'react';
import {KeyboardAvoidingView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import PaginationDots from '../../../components/PaginationDots';
import AppButton from '../../../components/UI/AppButton';
import Validation, {
  required,
} from '../../../components/UI/Validation';
import colors from '../../../constants/colors';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import Appinput from '../../../components/UI/AppInput';
import NetworkService from '../../../services/NetworkService';
import UserService from '../../../services/UserService';
import {tabHeight} from '../../../navigation/TabNav';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Routes from '../../../navigation/routes';

type RouteParamList = {
  params: {
    email: string | undefined;
  };
};

const VALIDATION_CONTEXT = 'PasswordReset2';

const PasswordResetStepTwo: React.FC = () => {
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [personalNumber, setPersonalNumber] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();

  const onPersonalNumberHandle = (pn?: string) => {
    setPersonalNumber(pn);
  }

  const GetPasswordResetData = () => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      UserService.GetPasswordResetData(route.params.email).subscribe({
        next: Response => {
          if (Response.data.ok) {
            console.log(Response.data)
            if (Response.data.data?.resetData?.length) {
              setPhone(Response.data.data?.resetData[0].mask);
              navigation.navigate(Routes.PasswordResetStepThree, {
                email: route.params.email,
                phone,
                personalNumber,
              });
            } else {
              setIsLoading(false);
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

  const nextStep = () => {
    if (Validation.validate(VALIDATION_CONTEXT)) {
      return;
    }
    GetPasswordResetData();
  }

  return (
    <ScrollView contentContainerStyle={styles.avoid}  keyboardShouldPersistTaps='always'>
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={styles.avoid}>
      <View style={styles.passwordResetContainer}>
        <View style={styles.passwordResetHeader}>
          <PaginationDots length={6} step={1} />
        </View>
        <Text style={styles.pwdResettext}>
          {translate.t('login.forgotpassword')}
        </Text>
        <View style={styles.inputsContainer}>
          <View>
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
                  value={personalNumber}
                  onChange={onPersonalNumberHandle}
                  minLength={4}
                  maxLength={21}
                  keyboardType={'default'}
                  placeholder={`${translate.t('common.personalNumber')}  ${translate.t('common.or')}  ${translate.t('verification.passportNumber')}`}
                />
            </View>
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

export default PasswordResetStepTwo;

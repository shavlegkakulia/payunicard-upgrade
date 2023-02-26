import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ScrollView,
  Platform,
} from 'react-native';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import Appinput, { autoCapitalize } from '../../../components/UI/AppInput';
import AppButton from '../../../components/UI/AppButton';
import colors from '../../../constants/colors';
import Validation, {
  email as _email,
  required,
} from '../../../components/UI/Validation';
import {useSelector} from 'react-redux';
import {tabHeight} from '../../../navigation/TabNav';
import Routes from '../../../navigation/routes';
import {useNavigation} from '@react-navigation/core';
import {useKeyboard} from '../../../hooks/useKeyboard';
import AppSelect, {
  SelectItem,
} from '../../../components/UI/AppSelect/AppSelect';
import countryCodes from '../../../constants/countryCodes';
import { SafeAreaView } from 'react-navigation';
import PresentationServive, { ICountry, IGetCoutries } from '../../../services/PresentationServive';
import { getNumber, getString } from '../../../utils/Converter';
import NetworkService from '../../../services/NetworkService';

const VALIDATION_CONTEXT = 'signup';

const SignupForm: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [phone, setPhone] = useState<string | undefined>('');
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [maxLengt, setMaxLength] = useState<number | undefined>();
  const [minLength, setMinLength] = useState<number | undefined>();
  const [code, setCode] = useState<ICountry>();
  const [codeVisible, setCodeVisible] = useState<boolean>(false);
  const [codeErrorStyle, setCodeErrorStyle] = useState<StyleProp<ViewStyle>>(
    {},
  );
  const [phoneErrorStyle, setPhoneErrorStyle] = useState<StyleProp<ViewStyle>>(
    undefined,
  );
  const [countries, setCountries] = useState<Array<ICountry>>();
  const navigation = useNavigation<any>();
  const keyboard = useKeyboard();

  const onSetCode = (c: ICountry) => {
    if(c.dialCode === '+995') {
      setPhone(undefined);
    } else {
      setMaxLength(undefined);
    }
    setMaxLength(c.maxDIG);
    setMinLength(c.minDIG);
    setCode(c);
  }

  const checkPhoneValid = useCallback(() => {
    if(code?.minDIG && getString(phone).length < getNumber(code?.minDIG)) {
      setPhoneErrorStyle({
        borderColor: colors.danger,
        borderWidth: 1,
      });
      return false;
    }else if(code?.maxDIG && getString(phone).length > getNumber(code?.maxDIG)) {
      setPhoneErrorStyle({
        borderColor: colors.danger,
        borderWidth: 1,
      });
      return false;
    }else if(code?.nO1 && getString(phone).length === getNumber(code?.nO1)) {
      setPhoneErrorStyle({
        borderColor: colors.danger,
        borderWidth: 1,
      });
      return false;
    }else if(code?.nO2 && getString(phone).length === getNumber(code?.nO2)) {
      setPhoneErrorStyle({
        borderColor: colors.danger,
        borderWidth: 1,
      });
      return false;
    }else if(code?.nO3 && getString(phone).length === getNumber(code?.nO3)) {
      setPhoneErrorStyle({
        borderColor: colors.danger,
        borderWidth: 1,
      });
      return false;
    }
    else {
      setPhoneErrorStyle(undefined);
      return true;
    }
  }, [phone, code])

  // useEffect(() => {
  //   if(loaded.current) {
  //     checkPhoneValid();
  //   }
  //   loaded.current = true;
  // }, [phone, code])

  const nextStep = () => {
    checkPhoneValid();
    if (!code || !code?.dialCode) {
      setCodeErrorStyle({
        borderColor: colors.danger,
        borderWidth: 1,
      });
      return;

    }
    else {
      setCodeErrorStyle({});
    }
    if(!checkPhoneValid()) {
      return;
    }
    
    if (Validation.validate(VALIDATION_CONTEXT)) {
      return;
    }
    console.log(`+${code.dialCode + phone}`, name, surname)
    const PhoneNumber = `+${code.dialCode + phone}`;
    navigation.navigate(Routes.SignupStepTwo, {
      phone: PhoneNumber,
      countryCode: code.countryCode,
      name,
      surname,
    });
  };

  useEffect(() => {
    NetworkService.CheckConnection(() => {
      PresentationServive.GetCountries().subscribe({
        next: response => {
          setCountries(response.data.data.countries);
          const c = response.data.data.countries?.filter(c => c.dialCode === '995');
      
          if(c.length) {
            onSetCode(c[0]);
          }
        }
      })
    })

  }, [])

  const isKeyboardOpen = keyboard.height > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
      style={styles.avoid}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={"handled"}
        >
          <View style={styles.content}>
            <View>
              <Text
                style={[
                  styles.signupSignuptext,
                  isKeyboardOpen && { marginTop: 0, fontSize: 18 },
                ]}
              >
                {translate.t("signup.startRegister")}
              </Text>
              <View> 
              <View style={{ flexDirection: "row" }}>
                <View style={[styles.countryBox]}>
                  {code?.dialCode ? (
                    <SelectItem
                      itemKey="dialCode"
                      defaultTitle="+995"
                      item={code}
                      onItemSelect={() => setCodeVisible(true)}
                      style={styles.countryItem}
                      prefix='+'
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setCodeVisible(true)}
                      style={[styles.countrySelectHandler, codeErrorStyle]}
                    >
                      <Text style={styles.countryPlaceholder}>+995</Text>
                    </TouchableOpacity>
                  )}

                  <AppSelect
                    itemKey="countryName"
                    elements={countries}
                    selectedItem={code}
                    itemVisible={codeVisible}
                    onSelect={(item) => {
                      onSetCode(item);
                      setCodeVisible(false);
                    }}
                    onToggle={() => setCodeVisible(!codeVisible)}
                  />
                </View>
                <Appinput
                  requireds={[required]}
                  customKey="phone"
                  context={VALIDATION_CONTEXT}
                  style={[
                    styles.signupInput,
                    { marginLeft: 10, flexGrow: 1 },
                    phoneErrorStyle,
                  ]}
                  value={phone}
                  onChange={(e) => {
                    let reg = /^\d+$/;
                    if (reg.test(e) || !e) setPhone(e);
                  }}
                  keyboardType={"phone-pad"}
                  placeholder={"5XX XXX XXX"}
                  maxLength={maxLengt}
                />
              </View>
              {phoneErrorStyle ? <Text style={styles.phoneError}>{translate.t('signup.phoneNotValid')}</Text> : null}</View>
              <Appinput
                requireds={[required]}
                customKey="name"
                context={VALIDATION_CONTEXT}
                style={styles.signupInput}
                value={name}
                onChange={(e) => {
                  if (/^[A-Za-zა-ჰ\s]*$/.test(e) || !e) setName(e);
                }}
                autoCapitalize={autoCapitalize.none}
                placeholder={translate.t("common.name")}
              />

              <Appinput
                requireds={[required]}
                customKey="lname"
                context={VALIDATION_CONTEXT}
                style={styles.signupInput}
                value={surname}
                onChange={(e) => {
                  if (/^[A-Za-zა-ჰ\s]*$/.test(e) || !e) setSurname(e);
                }}
                autoCapitalize={autoCapitalize.none}
                placeholder={translate.t("common.lname")}
              />
            </View>

            <AppButton
              title={translate.t("common.next")}
              onPress={nextStep}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avoid: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: colors.white,
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    justifyContent: 'space-between',
    flex: 1,
  },
  signupSignuptext: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 24,
    lineHeight: 29,
    color: colors.black,
    marginVertical: 36,
  },
  signupInput: {
    backgroundColor: '#F6F6F4',
    marginBottom: 16,
  },
  countryBox: {
    borderRadius: 7,
  },
  countryItem: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
    height: 60,
  },
  countrySelectHandler: {
    height: 60,
    backgroundColor: colors.inputBackGround,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  countryPlaceholder: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.dark,
  },
  button: {
    marginBottom: tabHeight + 40,
  },
  phoneError: {
    color: colors.danger, 
    marginTop: -12, 
    marginBottom: 12, 
    marginLeft: 10, 
    fontSize: 9
  }
});

export default SignupForm;

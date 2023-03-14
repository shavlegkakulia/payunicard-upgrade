import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  KeyboardTypeOptions,
  Platform,
} from 'react-native';
import {TextInput, Text} from 'react-native';
import {useSelector} from 'react-redux';
import colors from '../../constants/colors';
import {
  ITranslateState,
  IGlobalState,
} from './../../redux/action_types/translate_action_types';
import Validation from './Validation';
import {
  ContainsLowercase,
  ContainsNumeric,
  ContainsUppercase,
  ContainsSpecialCharacter,
  TestLength,
} from '././../../utils/Regex';
// @ts-ignore
TextInput.defaultProps = {
  // @ts-ignore
  ...TextInput.defaultProps,
  maxFontSizeMultiplier: 1,
};

// @ts-ignore
Text.defaultProps = {
  // @ts-ignore
  ...Text.defaultProps,
  maxFontSizeMultiplier: 1,
};

export const InputTypes = {
  search: 'search',
};

export enum autoCapitalize {
  none = 'none',
  sentences = 'sentences',
  words = 'words',
  characters = 'characters',
}

interface IProps {
  style?: any;
  value?: string | number;
  equalsTo?: string | number;
  customKey: string;
  requireds: string[];
  context: string;
  minLength?: number;
  hasWrongSimbol?: boolean;
  type?: string;
  input: JSX.Element;
  refer: React.RefObject<TextInput>;
}

interface IInputeProps {
  style?: StyleProp<ViewStyle>;
  placeholder?: string;
  value?: string;
  equalsTo?: string | number;
  onChange: (input: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  autoCapitalize?: autoCapitalize;
  customKey: string;
  requireds?: string[];
  context: string;
  minLength?: number;
  secureTextEntry?: boolean;
  type?: string;
  textContentType?: string;
  keyboardType?: KeyboardTypeOptions | undefined;
  ref?: React.LegacyRef<TextInput> | undefined;
  autoFocus?: boolean;
  editable?: boolean;
  maxLength?: number;
  selectTextOnFocus?: boolean;
}

interface IPwdValidationProps {
  value: string;
}

interface IPwdState {
  length: boolean;
  containsUpper: boolean;
  containsLower: boolean;
  containsNumeric: boolean;
  containsSpecial: boolean;
  hasWrongSimbol: boolean;
}

export const PasswordValidation: React.FC<IPwdValidationProps> = props => {
  const translate = useSelector<IGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [correct, setCorrect] = useState<IPwdState>({
    length: false,
    containsLower: false,
    containsUpper: false,
    containsNumeric: false,
    containsSpecial: false,
    hasWrongSimbol: false
  });

  useEffect(() => {
    const {value} = props;

    try {
      setCorrect(() => {
        return {
          length: TestLength.test(value),
          containsUpper: ContainsUppercase.test(value),
          containsLower: ContainsLowercase.test(value),
          containsSpecial: ContainsSpecialCharacter.test(value),
          containsNumeric: ContainsNumeric.test(value),
          hasWrongSimbol: (value.length && value.indexOf('.') < 0 && value.indexOf('@') < 0) ? ContainsSpecialCharacter.test(value) ? true : false : false
        };
      });
    } catch (_) {}
  }, [props.value]);

  let StyleCheckLength = !correct.length
    ? {color: colors.danger}
    : {color: colors.primary};
  let StyleCheckUpper = !correct.containsUpper
    ? {color: colors.danger}
    : {color: colors.primary};
  let StyleCheckLower = !correct.containsLower
    ? {color: colors.danger}
    : {color: colors.primary};
  let StyleCheckNumeric = !correct.containsNumeric
    ? {color: colors.danger}
    : {color: colors.primary};
  let StyleCheckSpecial = !correct.containsSpecial
    ? {color: colors.danger}
    : {color: colors.primary};
  let StyleCheckWrongSimbols = !correct.hasWrongSimbol
    ? {color: colors.danger}
    : {color: colors.primary};
  let StyleComplexityCheck =
    correct.length &&
    correct.containsUpper &&
    correct.containsLower &&
    correct.containsNumeric &&
    correct.containsSpecial &&
    StyleCheckWrongSimbols
      ? {color: colors.primary}
      : {color: colors.danger};

  return (
    <View style={styles.passwordValidationContainer}>
      <Text style={[styles.passwordHint, StyleComplexityCheck]}>
        {translate.t('signup.passwordValidationSection1')}
      </Text>
      <Text style={[styles.passwordHint, StyleCheckLength]}>
        - {translate.t('signup.passwordValidationSection2')}
      </Text>
      <Text style={[styles.passwordHint, StyleCheckUpper]}>
        - {translate.t('signup.passwordValidationSection3')}
      </Text>
      <Text style={[styles.passwordHint, StyleCheckLower]}>
        - {translate.t('signup.passwordValidationSection4')}
      </Text>
      <Text style={[styles.passwordHint, StyleCheckNumeric]}>
        - {translate.t('signup.passwordValidationSection5')}
      </Text>
      <Text style={[styles.passwordHint, StyleCheckSpecial, StyleCheckWrongSimbols]}>
        - {translate.t('signup.passwordValidationSection6')}
      </Text>
    </View>
  );
};

const BaseInput: React.FC<IProps> = props => {
  let mounted = false;
  const [style, setStyle] = useState({borderColor: colors.none});

  useEffect(() => {
    mounted = true;
    Validation.push(props.customKey, props.context)(
      [...props.requireds],
      (s: boolean) => redraw(s),
      props.value,
      props.minLength,
      props.equalsTo,
    );

    return () => {
      mounted = false;
      Validation.delete(props.customKey);
    };
  }, [props.value, props.equalsTo]);

  const redraw = (is: boolean) => {
    if (mounted) {
      setStyle({
        borderColor: is ? colors.none : colors.danger,
      });
    }

    return is;
  };
  
  return (
    <TouchableOpacity
      style={[styles.baseInput, {...style}, props.style]}
      onPress={() => props.refer?.current?.focus()}>
      {props.input}
      {/* {style.borderColor === colors.danger && 
      <Text style={styles.errorText}>შეავსეთ ველი</Text>} */}
    </TouchableOpacity>
  );
};

const AppInput = React.forwardRef(
  (props: IInputeProps, ref: React.LegacyRef<TextInput>) => {
    const [showPassword, setShowPassword] = useState<boolean | undefined>(
      false,
    );
    useEffect(() => {
      setShowPassword(props.secureTextEntry);
    }, [props.secureTextEntry]);

    const toggleSwitch = useCallback(() => {
      if (!props.secureTextEntry) return;
      setShowPassword(showPassword => !showPassword);
    }, [props.secureTextEntry]);
    let inputRef = React.createRef<TextInput>();
    return (
      <BaseInput
        {...props}
        refer={inputRef}
        value={props.value}
        minLength={props.minLength}
        equalsTo={props.equalsTo}
        customKey={props.customKey}
        requireds={props.requireds || []}
        context={props.context}
        input={
          <>
            <TextInput
              ref={(ref = inputRef)}
              autoFocus={props.autoFocus}
              keyboardType={props.keyboardType}
              secureTextEntry={showPassword || false}
              style={styles.defaultInputStyle}
              value={props.value}
              onChangeText={props.onChange}
              onSubmitEditing={props.onBlur}
              onFocus={props.onFocus}
              autoCapitalize={props.autoCapitalize || 'none'}
              placeholder={props.placeholder}
              placeholderTextColor={colors.placeholderColor}
              editable={props.editable}
              maxLength={props.maxLength || 1000}
              selectTextOnFocus={props.selectTextOnFocus}
            />
            {props.secureTextEntry && (
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={toggleSwitch}>
                <Image
                  style={styles.eye}
                  source={
                    showPassword
                      ? require('./../../assets/images/eye.png')
                      : require('./../../assets/images/eye_hidden.png')
                  }
                />
              </TouchableOpacity>
            )}
            {props.type && props.type === InputTypes.search && (
              <TouchableOpacity style={styles.search} onPress={toggleSwitch}>
                <Image
                  style={styles.sicon}
                  source={require('./../../assets/images/search-18x18.png')}
                />
              </TouchableOpacity>
            )}
          </>
        }
      />
    );
  },
);

const styles = StyleSheet.create({
  baseInput: {
    paddingHorizontal: 16,
    backgroundColor: colors.inputBackGround,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.none,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 5.5 : 0
  },
  passwordHint: {
    fontFamily: 'FiraGo-Regular',
    fontSize: 9,
    color: colors.danger,
  },
  passwordValidationContainer: {
    marginBottom: 10,
    marginLeft: 8,
  },
  defaultInputStyle: {
    fontSize: 14,
    fontFamily: 'FiraGO-Regular',
    lineHeight: 17,
    padding: 0,
    color: colors.black,
    flex: 1,
    marginVertical: 15,
  },
  passwordToggle: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10
  },
  eye: {
    width: 22,
  },
  search: {
    height: 24,
    width: 24,
  },
  sicon: {
    height: 24,
    width: 24,
  },
  errorText: {
    position: 'absolute',
    fontFamily: 'FiraGO-Normal',
    fontSize: 10,
    color: colors.danger,
    left: 15,
    bottom: -14,
  },
});

export default AppInput;

import React from 'react';
import {
  Image,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
} from 'react-native';
import { useSelector } from 'react-redux';
import AppButton from '../../../components/UI/AppButton';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import { tabHeight } from '../../../navigation/TabNav';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import NavigationService from '../../../services/NavigationService';
import screenStyles from '../../../styles/screens';

const TopupSucces: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const complate = () => {
    NavigationService.navigate(Routes.Dashboard);
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={styles.avoid}>
      <View style={[screenStyles.wraper, styles.container]}>
        <View style={styles.succesInner}>
          <Text style={styles.succesText}>{translate.t('payments.paymentSuccessfull')}</Text>
          <Image
            source={require('./../../../assets/images/succes_icon.png')}
            style={styles.succesImg}
          />
        </View>
        <AppButton
          onPress={complate}
          title={translate.t('common.close')}
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'space-between',
    paddingBottom: tabHeight
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white
  },
  button: {
    marginBottom: 40,
  },
  succesText: {
    textAlign: 'center',
    justifyContent: 'space-between',
    fontFamily: 'FiraGO-Medium',
    fontSize: 16,
    lineHeight: 19,
    color: colors.black,
    marginTop: 28,
  },
  succesInner: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
  },
  succesImg: {
    marginTop: 40,
  },
});

export default TopupSucces;

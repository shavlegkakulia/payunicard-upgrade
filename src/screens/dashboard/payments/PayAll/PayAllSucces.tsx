import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
} from 'react-native';
import AppButton from '../../../../components/UI/AppButton';
import colors from '../../../../constants/colors';
import screenStyles from '../../../../styles/screens';
import {INavigationProps} from '../../transfers';
import {useDispatch, useSelector} from 'react-redux';
import {
  NAVIGATION_ACTIONS,
} from '../../../../redux/action_types/navigation_action_types';
import {tabHeight} from '../../../../navigation/TabNav';
import Routes from '../../../../navigation/routes';
import NavigationService from '../../../../services/NavigationService';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../../redux/action_types/translate_action_types';

const PayAllSucces: React.FC<INavigationProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;

  const dispatch = useDispatch<any>();

  const handleStep = () => {
    Keyboard.dismiss();
    dispatch({
      type: NAVIGATION_ACTIONS.SET_HIDER_VISIBLE,
      visible: true,
    });
    
    NavigationService.navigate(Routes.Payments);
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <View style={{height: Dimensions.get('window').height}}>
            <View style={styles.succesInner}>
              <Text style={styles.succesText}>{translate.t('payments.paymentSuccessfull')}</Text>
              <Image
                source={require('./../../../../assets/images/succes_icon.png')}
                style={styles.succesImg}
              />
            </View>
            <View style={[screenStyles.wraper, styles.buttonContainer]}>
              <AppButton onPress={handleStep} title={translate.t('common.close')} />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flexGrow: 1,
  },
  buttonContainer: {
    marginTop: 27,
    marginBottom: tabHeight + 20,
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

export default PayAllSucces;

import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Image,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AppButton from '../../../../components/UI/AppButton';
import AppInput from '../../../../components/UI/AppInput';
import colors from '../../../../constants/colors';
import Routes from '../../../../navigation/routes';
import {tabHeight} from '../../../../navigation/TabNav';
import {
  addPayTemplate,
  getPayTemplates,
} from '../../../../redux/actions/payments_actions';
import {NAVIGATION_ACTIONS} from '../../../../redux/action_types/navigation_action_types';
import {
  IGlobalPaymentState,
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../../../../redux/action_types/payments_action_type';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../../redux/action_types/translate_action_types';
import NavigationService from '../../../../services/NavigationService';
import screenStyles from '../../../../styles/screens';

type RouteParamList = {
  params: {
    withTemplate: boolean;
  };
};

const ValidationContext = 'payment4';

const PaymentSucces: React.FC = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [templateNameInputToggle, setTemplateNameInputToggle] =
    useState<boolean>(false);
  const PaymentStore = useSelector<IGlobalPaymentState>(
    state => state.PaymentsReducer,
  ) as IPaymentState;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const dispatch = useDispatch<any>();;

  const onTemplateSave = (templName: string) => {
    dispatch({
      type: PAYMENTS_ACTIONS.SET_PAYMENT_TEMPLATE_NAME,
      templName: templName,
    });
  };

  const complate = () => {
    const reset = function () {
      dispatch({
        type: NAVIGATION_ACTIONS.SET_HIDER_VISIBLE,
        visible: true,
      });
      dispatch(getPayTemplates());
      NavigationService.navigate(Routes.Payments);
    };
    const {op_id} = PaymentStore.paymentTransactionData || {};
    if (PaymentStore.templName && op_id) {
      dispatch(
        addPayTemplate(
          {longOpID: op_id, templName: PaymentStore.templName},
          status => {
            if (status) {
              reset();
            }
          },
        ),
      );
    } else {
      reset();
    }
  };

  useEffect(() => {
    dispatch({type: NAVIGATION_ACTIONS.SET_HIDER_VISIBLE, visible: false});
  }, []);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={styles.avoid}>
      <View style={[screenStyles.wraper, styles.container]}>
        <View style={styles.succesInner}>
          <Text style={styles.succesText}>
            {route.params.withTemplate
              ? translate.t('template.paymentTemplateSuccess')
              : translate.t('payments.paymentSuccessfull')}
          </Text>
          <Image
            source={require('./../../../../assets/images/succes_icon.png')}
            style={styles.succesImg}
          />
          {!PaymentStore.isTemplate && !route.params.withTemplate && (
            <View>
              <Image
                source={require('./../../../../assets/images/templateIcon.png')}
                style={styles.templateIcon}
              />
              <AppButton
                backgroundColor={colors.none}
                color={colors.labelColor}
                title={translate.t('template.saveTemplate')}
                onPress={() => {
                  setTemplateNameInputToggle(toggle => !toggle);
                }}
              />
              {templateNameInputToggle ? (
                <View style={styles.templateNameColumn}>
                  <AppInput
                    autoFocus={true}
                    value={PaymentStore.templName}
                    onChange={name => {
                      onTemplateSave(name);
                    }}
                    context={ValidationContext}
                    placeholder={translate.t('template.templateName')}
                    customKey="templateName"
                    style={styles.templateNameInput}
                  />
                </View>
              ) : null}
            </View>
          )}
        </View>
        <AppButton
          isLoading={PaymentStore.isActionLoading}
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
    paddingBottom: tabHeight,
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  templateNameColumn: {
    width: 170,
    alignSelf: 'center',
    marginTop: 5,
  },
  templateNameInput: {
    marginTop: 0,
    backgroundColor: colors.none,
    alignSelf: 'center',
    borderRadius: 0,
    borderWidth: 1,
    borderBottomColor: colors.inputBackGround,
  },
  templateIcon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginTop: 30,
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

export default PaymentSucces;

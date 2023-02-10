import { RouteProp, useRoute } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  KeyboardAvoidingView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AppButton from '../../../../components/UI/AppButton';
import AppInput from '../../../../components/UI/AppInput';
import Validation, { required} from '../../../../components/UI/Validation';
import colors from '../../../../constants/colors';
import Routes from '../../../../navigation/routes';
import { tabHeight } from '../../../../navigation/TabNav';
import {
  IGlobalPaymentState,
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../../../../redux/action_types/payments_action_type';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
}  from '../../../../redux/action_types/translate_action_types';
import { IAccountBallance } from '../../../../services/UserService';
import screenStyles from '../../../../styles/screens';
import {INavigationProps} from '../../transfers';

type RouteParamList = {
    params: {
      paymentStep: string;
      step: number;
      currentAccount: IAccountBallance | undefined;
      withTemplate: boolean;
    };
  };

const ValidationContext = 'payment1';
const servicePatrolsMerchantServiceId = 99;

const InsertAbonentCode: React.FC<INavigationProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [serviceName, setServiceName] = useState<string | undefined>('');
  const PaymentStore = useSelector<IGlobalPaymentState>(
    state => state.PaymentsReducer,
  ) as IPaymentState;
  const dispatch = useDispatch<any>();;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();

  const next = () => {
    if (Validation.validate(ValidationContext)) return;

    const index = parseInt(route.params.step.toString()) + 1;
    props.navigation?.navigate(Routes.Payments_CHECK_DEBT, {
      paymentStep: Routes.Payments_CHECK_DEBT,
      step: index,
      withTemplate: route.params.withTemplate
    });
  }

  const setAbonentCode = (abonentCode: string | undefined) => {
    dispatch({type: PAYMENTS_ACTIONS.PAYMENT_SET_ABONENT_CODE, abonentCode: abonentCode});
  }

  const setCarPlate = (carPlate: string | undefined) => {
    dispatch({type: PAYMENTS_ACTIONS.PAYMENT_SET_CARPLATE, carPlate: carPlate});
  }

  useEffect(() => {
    if (PaymentStore.isTemplate) {
      const {abonentCode} = PaymentStore.paymentDetails || {};
      let isFine =
        PaymentStore.currentService?.merchantServiceID ===
        servicePatrolsMerchantServiceId;
      let _abonentData = [];
      if (isFine) {
        _abonentData = abonentCode?.split('/') || [];
        if (_abonentData[0]) setAbonentCode(_abonentData[0]);
        if (_abonentData[1]) setCarPlate(_abonentData[1]);
      } else {
        setAbonentCode(abonentCode);
      }
    }
  }, [PaymentStore.isTemplate]);

  const _serviceName =
    PaymentStore.currentService?.name ||
    PaymentStore.currentService?.resourceValue ||
    serviceName;
  const _serviceImageUrl =
    PaymentStore.currentService?.imageUrl ||
    PaymentStore.currentService?.merchantServiceURL;

  let isFine =
    PaymentStore.currentService?.merchantServiceID ===
    servicePatrolsMerchantServiceId;

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={styles.avoid}>
      <View style={[screenStyles.wraper, styles.container]}>
        <View>
          <View style={styles.abonentInfo}>
            <View style={styles.imageBox}>
              <Image style={styles.logo} source={{uri: _serviceImageUrl}} resizeMode={'contain'} />
            </View>
            <View>
              <Text numberOfLines={1} style={styles.serviceName}>
                {_serviceName}
              </Text>
            </View>
          </View>

          <View style={[styles.abonentCodeColumn, isFine && styles.isFine]}>
            <View style={isFine && {flex: 1, marginRight: 5}}>
              <Text style={styles.abonentLabel}>{translate.t('payments.abonentNumber')}</Text>
              <AppInput
                value={PaymentStore.abonentCode}
                onChange={abonentCode => setAbonentCode(abonentCode)}
                context={ValidationContext}
                customKey="abonentCode"
                requireds={[required]}
                placeholder={translate.t('payments.abonentNumber')}
                style={styles.abonentCodeInput}
              />
            </View>
            {isFine && (
              <View style={styles.carPlate}>
                <Text style={styles.abonentLabel}>{translate.t('payments.carNumber')}</Text>
                <AppInput
                  value={PaymentStore.carPlate}
                  onChange={carPlate => setCarPlate(carPlate)}
                  context={ValidationContext}
                  placeholder={translate.t('payments.carNumber')}
                  customKey="carPlate"
                  requireds={[required]}
                  style={styles.abonentCodeInput}
                />
              </View>
            )}
          </View>
        </View>

        <AppButton
          isLoading={PaymentStore.isActionLoading}
          onPress={next}
          title={translate.t('common.next')}
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
  },
  abonentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  imageBox: {
    width: 40,
    height: 40,
    marginRight: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBackGround,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  serviceName: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  abonentCodeInput: {
    marginTop: 17,
  },
  abonentLabel: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  abonentCodeColumn: {
    marginTop: 35,
  },
  isFine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  carPlate: {
    flex: 1,
    marginLeft: 5,
  },
  button: {
    marginBottom: 40,
  },
});

export default InsertAbonentCode;

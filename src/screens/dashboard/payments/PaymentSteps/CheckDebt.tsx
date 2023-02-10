import {RouteProp, useRoute} from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AppButton from '../../../../components/UI/AppButton';
import AppInput from '../../../../components/UI/AppInput';
import Validation, {required} from '../../../../components/UI/Validation';
import colors from '../../../../constants/colors';
import Routes from '../../../../navigation/routes';
import { tabHeight } from '../../../../navigation/TabNav';
import { mobileNetworkMerchantCategoryIds, onCheckDebt } from '../../../../redux/actions/payments_actions';
import {
  IGlobalPaymentState,
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../../../../redux/action_types/payments_action_type';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
}  from '../../../../redux/action_types/translate_action_types';
import {IAccountBallance} from '../../../../services/UserService';
import screenStyles from '../../../../styles/screens';
import {CurrencySimbolConverter} from '../../../../utils/Converter';
import {INavigationProps} from '../../transfers';

type RouteParamList = {
  params: {
    paymentStep: string;
    step: number;
    currentAccount: IAccountBallance | undefined;
    withTemplate: boolean;
  };
};

const ValidationContext = 'payment2';
const servicePatrolsMerchantServiceId = 99;

const CheckDebt: React.FC<INavigationProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const PaymentStore = useSelector<IGlobalPaymentState>(
    state => state.PaymentsReducer,
  ) as IPaymentState;

  const dispatch = useDispatch<any>();;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();

  const setAbonentCode = (abonentCode: string | undefined) => {
    dispatch({
      type: PAYMENTS_ACTIONS.PAYMENT_SET_ABONENT_CODE,
      abonentCode: abonentCode,
    });
  };

  const setCarPlate = (carPlate: string | undefined) => {
    dispatch({type: PAYMENTS_ACTIONS.PAYMENT_SET_CARPLATE, carPlate: carPlate});
  };

  const next = () => {
    const isMobile = mobileNetworkMerchantCategoryIds.includes(
      PaymentStore.currentService?.categoryID,
    )
    if ((Validation.validate(ValidationContext) || !PaymentStore.debtData) && !isMobile) return;

    const index = parseInt(route.params.step.toString()) + 1;
    props.navigation?.navigate(Routes.Payments_INSERT_ACCOUNT_AND_AMOUNT, {
      paymentStep: Routes.Payments_INSERT_ACCOUNT_AND_AMOUNT,
      step: index,
      withTemplate: route.params.withTemplate
    });
  };

  const _onCheckDebt = () => {
    setIsLoading(true);
    if (Validation.validate(ValidationContext) && !PaymentStore.isTemplate) {
      setIsLoading(false);
      return;
    }
    
    dispatch(onCheckDebt(PaymentStore, () => setIsLoading(false)));
  };

  useEffect(() => {
    if(!PaymentStore.debtData)
    _onCheckDebt();
  }, [PaymentStore.debtData]);

  let debt = PaymentStore.debtData?.filter(
    i =>
      i.FieldCode === 'Debt' ||
      i.FieldCode === 'FineAmount' ||
      i.FieldCode === 'TotalDebt' ||
      i.FieldCode === 'Balance',
  );
  let custumer = PaymentStore.debtData?.filter(
    i =>
      i.FieldCode === 'AbonentName' ||
      i.FieldCode === 'NameAndSurname' ||
      i.FieldCode === 'Name' ||
      i.FieldCode === 'UserName',
  );
  let cosumerAddress = PaymentStore.debtData?.filter(
    i => i.FieldCode === 'AbonentAddress' || i.FieldCode === 'Region',
  );

  const _serviceName =
    PaymentStore.currentService?.name ||
    PaymentStore.currentService?.resourceValue;
  const _serviceImageUrl =
    PaymentStore.currentService?.imageUrl ||
    PaymentStore.currentService?.merchantServiceURL;

  let isFine =
    PaymentStore.currentService?.merchantServiceID ===
    servicePatrolsMerchantServiceId;

  return (
    <ScrollView contentContainerStyle={styles.avoid}>
      <KeyboardAvoidingView behavior="padding" style={styles.avoid}>
        <View style={[screenStyles.wraper, styles.container]}>
          <View>
            <View style={styles.abonentInfo}>
              <Image style={styles.logo} source={{uri: _serviceImageUrl}} />
              <View style={styles.shrink}>
                <Text numberOfLines={1} style={styles.serviceName}>
                  {_serviceName}
                </Text>
                <View>
                  <Text style={styles.address}>
                    {custumer && custumer[0]?.Value}
                    {cosumerAddress && cosumerAddress[0]?.Value}
                  </Text>
                  <Text style={styles.debt}>
                    {PaymentStore.abonentCode}/{debt && debt[0]?.Value}
                    {CurrencySimbolConverter(debt && debt[0]?.CCY, translate.key)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.abonentCodeColumn, isFine && styles.isFine]}>
              <View style={isFine && {flex: 1, marginRight: 5}}>
                <Text style={styles.abonentLabel}>{translate.t('payments.abonentNumber')}</Text>
                <AppInput
                  value={PaymentStore.abonentCode}
                  onChange={() => {}}
                  context={ValidationContext}
                  customKey="abonentCode"
                  requireds={[required]}
                  style={styles.abonentCodeInput}
                  editable={false}
                />
              </View>

              {isFine && (
                <View style={styles.carPlate}>
                  <Text style={styles.abonentLabel}>{translate.t('payments.carNumber')}</Text>
                  <AppInput
                    value={PaymentStore.carPlate}
                    onChange={carPlate => setCarPlate(carPlate)}
                    context={ValidationContext}
                    customKey="carPlate"
                    requireds={[required]}
                    style={styles.abonentCodeInput}
                  />
                </View>
              )}
            </View>

            <View style={[styles.debtBox, styles.shrink]}>
              {debt && debt?.length > 0 ? (
                <View style={styles.debtColumn}>
                  <Text style={styles.item}>{translate.t('payments.debt')}: </Text>
                  <Text style={[styles.item, styles.ccy]}>
                    {debt[0].Value}
                    {CurrencySimbolConverter(debt[0].CCY, translate.key)}
                  </Text>
                </View>
              ) : null}
              {custumer && custumer?.length > 0 ? (
                <View style={styles.abonentColumn}>
                  <Text style={styles.item}>{translate.t('payments.abonent')}: </Text>
                  <Text style={styles.item}>{custumer[0].Value}</Text>
                </View>
              ) : null}
              {cosumerAddress && cosumerAddress?.length > 0 && cosumerAddress[0].Value ? (
                <View style={styles.addressColumn}>
                  <Text style={styles.item}>{translate.t('verification.address')}: </Text>
                  <Text style={[styles.item, styles.shrink]}>{cosumerAddress[0].Value}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <AppButton
            isLoading={PaymentStore.isActionLoading || isLoading}
            onPress={next}
            title={translate.t('common.next')}
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
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
    backgroundColor: 'green',
  },
  abonentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBackGround
  },
  serviceName: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  address: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.placeholderColor,
  },
  debt: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.placeholderColor,
  },
  debtBox: {
    marginTop: 40,
  },
  debtColumn: {
    flexDirection: 'row',
  },
  abonentColumn: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  addressColumn: {
    flexDirection: 'row',
  },
  item: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  ccy: {
    color: colors.danger,
  },
  abonentCodeColumn: {
    marginTop: 40,
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
  isFine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  carPlate: {
    flex: 1,
    marginLeft: 5,
  },
  button: {
    marginVertical: 40,
  },
  shrink :{
    flexShrink: 1
  }
});

export default CheckDebt;

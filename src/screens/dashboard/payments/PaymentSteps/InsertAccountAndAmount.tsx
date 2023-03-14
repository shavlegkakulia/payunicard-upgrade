import {RouteProp, useRoute} from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AccountSelect, {
  AccountItem,
} from '../../../../components/AccountSelect/AccountSelect';
import OtpModal from '../../../../components/OtpModal';
import AppButton from '../../../../components/UI/AppButton';
import AppInput from '../../../../components/UI/AppInput';
import Validation, {
  hasNumeric,
  required,
} from '../../../../components/UI/Validation';
import {TYPE_UNICARD} from '../../../../constants/accountTypes';
import colors from '../../../../constants/colors';
import {GEL} from '../../../../constants/currencies';
import Routes from '../../../../navigation/routes';
import {tabHeight} from '../../../../navigation/TabNav';
import {PUSH} from '../../../../redux/actions/error_action';
import {
  addPayTemplate,
  GetPaymentDetails,
  onCheckDebt,
  startPaymentTransaction,
} from '../../../../redux/actions/payments_actions';
import {
  IGlobalPaymentState,
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../../../../redux/action_types/payments_action_type';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../../redux/action_types/translate_action_types';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../../redux/action_types/user_action_types';
import NavigationService from '../../../../services/NavigationService';
import NetworkService from '../../../../services/NetworkService';
import TransactionService, {
  ISendUnicardOtpRequest,
} from '../../../../services/TransactionService';
import {IAccountBallance} from '../../../../services/UserService';
import screenStyles from '../../../../styles/screens';
import {
  CurrencyConverter,
  CurrencySimbolConverter,
  getNumber,
  getString,
} from '../../../../utils/Converter';
import SetOtp from './SetOtp';

type RouteParamList = {
  params: {
    paymentStep: string;
    step: number;
    currentAccount: IAccountBallance | undefined;
    withTemplate: boolean;
  };
};

const ValidationContext = 'payment3';

const InsertAccointAndAmount: React.FC = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accountVisible, setAccountVisible] = useState<boolean>(false);
  const [otpVisible, setOtpVisible] = useState<boolean>(false);
  const [otp, setOtp] = useState<string | undefined>();
  const [unicardOtpGuid, setUnicardOtpGuid] = useState<string | undefined>();
  const [_accounts, setAccounts] = useState<IAccountBallance[] | undefined>();
  const [accountErrorStyle, setAccountErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const PaymentStore = useSelector<IGlobalPaymentState>(
    state => state.PaymentsReducer,
  ) as IPaymentState;
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;
  const dispatch = useDispatch<any>();;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();

  const next = () => {
    if (!PaymentStore.selectedAccount) {
      setAccountErrorStyle({borderColor: colors.danger, borderWidth: 1});
      return;
    }

    if (Validation.validate(ValidationContext)) return;

    if (
      getNumber(PaymentStore.amount) <
      getNumber(PaymentStore.paymentDetails?.minAmount)
    ) {
      dispatch(
        PUSH(
          `${translate.t('common.minPayAmount')} ${
            PaymentStore.paymentDetails?.minAmount
          }${CurrencySimbolConverter(GEL, translate.key)}`,
        ),
      );
      setIsLoading(false);
      return;
    }

    if (
      getNumber(PaymentStore.amount) >
      getNumber(PaymentStore.paymentDetails?.maxAmount)
    ) {
      dispatch(
        PUSH(
          `${translate.t('common.maxPayfAmount')} ${
            PaymentStore.paymentDetails?.maxAmount
          }${CurrencySimbolConverter(GEL, translate.key)}`,
        ),
      );
      setIsLoading(false);
      return;
    }

    if (
      PaymentStore.selectedAccount?.type === TYPE_UNICARD &&
      (!otp || !unicardOtpGuid) &&
      !route.params.withTemplate
    ) {
      SendUnicardOTP();
      setOtpVisible(true);
      setIsLoading(false);
      return;
    }

    if (route.params.withTemplate) {
      dispatch(
        addPayTemplate(
          {
            templName: _serviceName,
            forOpClassCode: 'P2B',
            abonentCode: PaymentStore.abonentCode,
            amount: getNumber(PaymentStore.amount),
            externalAccountId: PaymentStore.selectedAccount.accountId,
            merchantServiceID: PaymentStore.paymentDetails?.merchantId,
          },
          status => {
            if (status) {
              NavigationService.navigate(Routes.Payments_SUCCES, {
                withTemplate: route.params.withTemplate,
              });
            }
          },
        ),
      );
      return;
    }
    startPay();
  };

  const onAccountSelect = (account: IAccountBallance) => {
    dispatch({
      type: PAYMENTS_ACTIONS.PAYMENT_SET_SELECTED_ACCOUNT,
      selectedAccount: account,
    });
    setAccountVisible(!accountVisible);
  };

  const onSetAmount = (amount: string) => {
    dispatch({type: PAYMENTS_ACTIONS.PAYMENT_SET_AMOUNT, amount: amount.replace(',', '.')});
  };

  const startPay = () => {
    let params: any = {};
    if (otp && unicardOtpGuid) {
      params.unicard = PaymentStore.selectedAccount?.accountId;
      params.AccountId = null;
      params.forFundsSPCode = 'UNICARD';
      params.unicardOtpGuid = unicardOtpGuid;
      params.unicardOtp = otp;
    }

    let _abonentCode = PaymentStore.abonentCode;
    if (PaymentStore.carPlate) {
      _abonentCode = _abonentCode + '/' + PaymentStore.carPlate;
    }

    dispatch(
      startPaymentTransaction(
        {
          forOpClassCode: PaymentStore.currentService?.forOpClassCode || PaymentStore.paymentDetails?.forOpClassCode,
          forFundsSPCode: 'UniWallet',
          forMerchantCode: PaymentStore.currentService?.merchantCode,
          forMerchantServiceCode:
            PaymentStore.currentService?.merchantServiceCode,
          AccountId: PaymentStore.selectedAccount?.accountId?.toString(),
          amount: PaymentStore.amount,
          serviceId: PaymentStore.paymentDetails?.debtCode,
          abonentCode: _abonentCode,
          forPaySPCode:
            PaymentStore.paymentDetails?.forPaySPCode ||
            PaymentStore.paymentDetails?.forPaySpCode,
          ...params,
        },
        status => {
          if (status) {
            setOtpVisible(false);
            setOtp(undefined);
            setUnicardOtpGuid(undefined);
            NavigationService.navigate(Routes.Payments_SUCCES, {
              withTemplate: route.params.withTemplate,
            });
          }
        },
      ),
    );
  };

  const SendUnicardOTP = () => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      let OTP: ISendUnicardOtpRequest = {
        card: PaymentStore.selectedAccount?.accountNumber,
      };

      TransactionService.UnicardOtp(OTP).subscribe({
        next: Response => {
          if (Response.data.ok) {
            setUnicardOtpGuid(Response.data.data?.otpGuid);
          }
        },
        error: () => {
          setIsLoading(false);
        },
        complete: () => setIsLoading(false),
      });
    });
  };

  const _onCheckDebt = () => {
    if (!PaymentStore.paymentDetails) return;
    setIsLoading(true);
    if (Validation.validate(ValidationContext) && !PaymentStore.isTemplate) {
      setIsLoading(false);
      return;
    }

    dispatch(onCheckDebt({...PaymentStore}, () => setIsLoading(false)));
  };

  useEffect(() => {
    if (
      PaymentStore.selectedAccount &&
      PaymentStore.amount //&&
      //PaymentStore.isTemplate
    ) {
      if (Validation.validate(ValidationContext)) return;

      dispatch(
        GetPaymentDetails(
          {
            ForOpClassCode: PaymentStore.paymentDetails?.forOpClassCode,
            ForFundsSPCode: 'UniWallet',
            ForMerchantCode: PaymentStore.currentService?.merchantCode,
            ForMerchantServiceCode:
              PaymentStore.currentService?.merchantServiceCode,
            AccountNumber: PaymentStore.selectedAccount.accountNumber,
            InAmount: getNumber(PaymentStore.amount),
            ForCustomerType: getString(
              PaymentStore.selectedAccount.customerAccountType?.toString(),
            ),
          },
          () => {
            if (PaymentStore.isTemplate) {
              _onCheckDebt();
            }
          },
        ),
      );
    }
  }, [PaymentStore.selectedAccount, PaymentStore.amount]);

  useEffect(() => {
    if (PaymentStore.selectedAccount && PaymentStore.isTemplate) {
      if (Validation.validate(ValidationContext)) return;
      _onCheckDebt();
    }
  }, [PaymentStore.selectedAccount, PaymentStore.isTemplate]);

  useEffect(() => {
    if (PaymentStore.isTemplate) {
      dispatch({
        type: PAYMENTS_ACTIONS.PAYMENT_SET_ABONENT_CODE,
        abonentCode: PaymentStore.currentPayTemplate?.abonentCode,
      });

      const account = userData.userAccounts?.filter(
        account =>
          account.accountId === PaymentStore.currentPayTemplate?.forFromAccount,
      );

      if (account?.length) {
        dispatch({
          type: PAYMENTS_ACTIONS.PAYMENT_SET_SELECTED_ACCOUNT,
          selectedAccount: account[0],
        });
      }
      onSetAmount(getString(PaymentStore.currentPayTemplate?.debt?.toString()));
    }
  }, [PaymentStore.isTemplate]);

  useEffect(() => {
    if (userData.userAccounts && !userData.isAccountsLoading) {
      let uac = [...(userData.userAccounts || [])];
      setAccounts(uac);
    }
  }, [userData.isAccountsLoading]);

  useEffect(() => {
    if (PaymentStore.paymentDetails?.canPayWithUnipoints === 0) {
      setAccounts(accounts => {
        return accounts?.filter(acc => acc.type !== TYPE_UNICARD);
      });
    }
  }, [PaymentStore.paymentDetails, PaymentStore.selectedAccount]);

  useEffect(() => {
    if (PaymentStore.currentService?.categoryID === 8) {
      setAccounts(accounts => {
        return accounts?.filter(
          acc =>
            acc.type !== TYPE_UNICARD &&
            acc.customerPaketId !== 2 &&
            acc.type !== 0,
        );
      });
    }
  }, [PaymentStore.currentService]);

  let debt = PaymentStore.debtData?.filter(
    i =>
      i.FieldCode === 'Debt' ||
      i.FieldCode === 'FineAmount' ||
      i.FieldCode === 'TotalDebt' ||
      i.FieldCode === 'Balance',
  );
  if (!debt || debt.length) {
    debt = [];
  }
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
    PaymentStore.currentService?.resourceValue ||
    PaymentStore.currentPayTemplate?.merchServiceName;
  const _serviceImageUrl =
    PaymentStore.currentService?.imageUrl ||
    PaymentStore.currentService?.merchantServiceURL ||
    PaymentStore.currentPayTemplate?.imageUrl;

  return (
    <>
      <ScrollView contentContainerStyle={styles.avoid}>
        <KeyboardAvoidingView behavior="padding" style={styles.avoid}>
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
                  <View>
                    <Text style={styles.address}>
                      {custumer?.length && custumer[0].Value}
                      {cosumerAddress?.length && cosumerAddress[0].Value}
                    </Text>
                    <Text style={styles.debt}>
                      <Text selectable={true} selectionColor={colors.primary}>{PaymentStore.abonentCode}</Text>/{debt?.length && debt[0].Value}
                      {debt.length &&
                        CurrencySimbolConverter(getString(debt[0].CCY), translate.key)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.accountBox}>
                <Text style={styles.accountBoxTitle}>
                  {translate.t('common.selectAccount')}
                </Text>

                {PaymentStore.selectedAccount ? (
                  <AccountItem
                    account={PaymentStore.selectedAccount}
                    onAccountSelect={() => setAccountVisible(true)}
                    style={styles.accountItem}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => setAccountVisible(true)}
                    style={[styles.accountSelectHandler, accountErrorStyle]}>
                       <Text style={styles.accountPlaceholder}>{translate.t('common.selectAccount')}</Text>
                    <Image
                      style={styles.dropImg}
                      source={require('./../../../../assets/images/down-arrow.png')}
                    />
                  </TouchableOpacity>
                )}

                <AccountSelect
                  accounts={_accounts}
                  selectedAccount={PaymentStore.selectedAccount}
                  accountVisible={accountVisible}
                  onSelect={account => onAccountSelect(account)}
                  onToggle={() => setAccountVisible(!accountVisible)}
                />
              </View>

              <View style={styles.amountColumn}>
                <Text style={styles.amountLabel}>
                  {translate.t('common.amount')}
                </Text>
                <AppInput
                  keyboardType="numeric"
                  value={PaymentStore.amount}
                  onChange={amount => {
                  //  if(/^(\d)*(\.)?([0-9]{1})?$/gm.test(amount) || !amount)
                    onSetAmount(amount)
                  }}
                  context={ValidationContext}
                  placeholder={CurrencyConverter(0)}
                  customKey="amount"
                  requireds={[required, hasNumeric]}
                  style={styles.amountInput}
                  selectTextOnFocus={true}
                />
              </View>

              {!route.params.withTemplate && (
                <View style={styles.amountBox}>
                  <Text style={[styles.amountLabel, styles.amountFeeLabel]}>
                    {translate.t('common.commission')}:{' '}
                    {CurrencyConverter(
                      getNumber(PaymentStore.paymentDetails?.amountFee),
                    )}{' '}
                    {CurrencySimbolConverter(GEL, translate.key)}
                  </Text>
                  {PaymentStore.paymentDetails?.amount !== undefined && (
                    <Text style={styles.amountValue}>
                      {translate.t('payments.totalDue')}:{' '}
                      {CurrencyConverter(
                        // PaymentStore.isTemplate
                        // ? PaymentStore.amount
                        // :
                        getNumber(PaymentStore.paymentDetails?.amount),
                      )}{' '}
                      {CurrencySimbolConverter(GEL, translate.key)}
                    </Text>
                  )}

                  <View>
                    <Text style={[styles.amountRange]}>
                      {translate.t('common.minAmount')}:{' '}
                      {CurrencyConverter(
                        getNumber(PaymentStore.paymentDetails?.minAmount),
                      )}{' '}
                      {CurrencySimbolConverter(GEL, translate.key)}
                    </Text>
                    <Text style={[styles.amountRange]}>
                      {translate.t('common.maxAmount')}:{' '}
                      {CurrencyConverter(
                        getNumber(PaymentStore.paymentDetails?.maxAmount),
                      )}{' '}
                      {CurrencySimbolConverter(GEL, translate.key)}
                    </Text>
                  </View>
                </View>
              )}
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
      <OtpModal
        modalVisible={otpVisible}
        otp={otp}
        onSetOtp={setOtp}
        onSendOTP={SendUnicardOTP}
        onComplate={next}
        isLoading={PaymentStore.isActionLoading || isLoading}
        label={translate.t('otp.smsCode')}
        buttonText={translate.t('common.next')}
        onClose={() => {
          setOtpVisible(false);
          setOtp(undefined);
        }}
      />
    </>
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
  accountBox: {
    marginTop: 50,
  },
  accountBoxTitle: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    marginBottom: 15,
  },
  accountItem: {
    backgroundColor: colors.inputBackGround,
    borderRadius: 7,
  },
  accountSelectHandler: {
    height: 54,
    backgroundColor: colors.inputBackGround,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15
  },
  accountPlaceholder: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  dropImg: {
    marginRight: 12,
  },
  amountInput: {
    marginTop: 17,
  },
  amountLabel: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  amountFeeLabel: {
    color: colors.danger,
  },
  amountColumn: {
    marginTop: 35,
  },
  amountBox: {
    marginTop: 50,
  },
  amountValue: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    marginTop: 10,
  },
  amountRange: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 12,
    lineHeight: 15,
    color: colors.black,
    marginTop: 10,
  },
  button: {
    marginVertical: 40,
  },
});

export default InsertAccointAndAmount;

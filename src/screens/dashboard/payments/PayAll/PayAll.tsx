import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import AccountSelect, {
  AccountItem,
} from '../../../../components/AccountSelect/AccountSelect';
import SuccesContent from '../../../../containers/SuccesContent';
import SwipableListItem from '../../../../containers/SwipableListItem/SwipableListItem';
import AppButton from '../../../../components/UI/AppButton';
import {TYPE_UNICARD} from '../../../../constants/accountTypes';
import colors from '../../../../constants/colors';
import {GEL} from '../../../../constants/currencies';
import NetworkService from '../../../../services/NetworkService';
import PresentationServive, {
  IGetBatchPaymentDetailsRequets,
  IPaymentDetailResponses,
} from '../../../../services/PresentationServive';
import {ITemplates} from '../../../../services/TemplatesService';
import TransactionService, {
  IRegisterPayBatchTransactionRequest,
  IRegisterPayBatchTransactionResponse,
  ISendUnicardOtpRequest,
} from '../../../../services/TransactionService';
import {IAccountBallance} from '../../../../services/UserService';
import screenStyles from '../../../../styles/screens';
import {
  CurrencyConverter,
  CurrencySimbolConverter,
  getNumber,
} from '../../../../utils/Converter';
import SetOtp from './../PaymentSteps/SetOtp';
import {INavigationProps} from '../../transfers';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../../redux/action_types/user_action_types';
import {useDispatch, useSelector} from 'react-redux';
import {
  IGlobalPaymentState,
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../../../../redux/action_types/payments_action_type';
import {RouteProp, useRoute} from '@react-navigation/core';
import Routes from '../../../../navigation/routes';
import {
  INavigationState,
  IGlobalState as INAVGlobalState,
  NAVIGATION_ACTIONS,
} from '../../../../redux/action_types/navigation_action_types';
import { tabHeight } from '../../../../navigation/TabNav';
import NavigationService from '../../../../services/NavigationService';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../../redux/action_types/translate_action_types';

type RouteParamList = {
  params: {
    paymentStep: number;
  };
};

const PAYMENT_STEPS = {
  SELECT_ACCOUNT: 0,
  CHECK_DEBT: 1,
  OTP: 2
};

const RightActionOptions = [
  <Image source={require('./../../../../assets/images/delete-40x40.png')} />,
];

const PayAll: React.FC<INavigationProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [accountVisible, setAccountVisible] = useState(false);
  const [_accounts, setAccounts] = useState<IAccountBallance[] | undefined>();

  const [paymentDetailResponses, setPaymentDetailResonses] =
    useState<IPaymentDetailResponses[]>();

  const [otp, setOtp] = useState<string | undefined>();
  const [unicardOtpGuid, setUnicardOtpGuid] = useState<string | undefined>();
  const [accountErrorStyle, setAccountErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;

  const PaymentStore = useSelector<IGlobalPaymentState>(
    state => state.PaymentsReducer,
  ) as IPaymentState;

  const navStore = useSelector<INAVGlobalState>(
    state => state.NavigationReducer,
  ) as INavigationState;

  const dispatch = useDispatch<any>();

  console.log('PaymentStore.PayTemplates ===>>', PaymentStore.PayTemplates)

  const [_templates, setTemplates] = useState<ITemplates[]>(
    [...PaymentStore.PayTemplates].filter(
      template => template.checkForPay && template.debt && template.debt > 0,
    ),
  );

  const route = useRoute<RouteProp<RouteParamList, 'params'>>();

  const onAccountSelect = (account: IAccountBallance) => {
    dispatch({
      type: PAYMENTS_ACTIONS.PAYMENT_SET_SELECTED_ACCOUNT,
      selectedAccount: account,
    });
    setAccountVisible(!accountVisible);
  };

  const startPayBatchTransaction = () => {
    NetworkService.CheckConnection(() => {
      let requestData: IRegisterPayBatchTransactionRequest[] = [];
      setIsLoading(true);
      paymentDetailResponses?.map((detail, index) => {
        requestData.push({
          forMerchantCode: detail.forMerchantCode,
          forMerchantServiceCode: detail.forMerchantServiceCode,
          amount: _templates[index].amount,
          abonentCode: _templates[index].abonentCode,
          forPaySPCode: detail.forPaySPCode,
          forOpClassCode: detail.forOpClassCode,
          bankId: null,
          AccountId: PaymentStore.selectedAccount?.accountId,
          forFundsSPCode: 'UniWallet',
          serviceId: detail.debtCode,
        });
      });

      if (PaymentStore.selectedAccount?.type === TYPE_UNICARD) {
        requestData.map(payData => {
          payData.unicardOtpGuid = unicardOtpGuid;
          payData.unicard = PaymentStore.selectedAccount?.accountId?.toString();
          payData.unicardOtp = otp;
          payData.forFundsSPCode = 'UNICARD';
          payData.accountId = null;
          return payData;
        });
      }

      TransactionService.startPayBatchTransaction({
        transactions: requestData,
      }).subscribe({
        error: () => {
          setIsLoading(false);
        },
        complete: () => {
          setIsLoading(false);
          NavigationService.navigate(Routes.Payments_PAY_ALL_SUCCES);
        },
      });
    });
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

  const coumputeTemplatesDebt = useCallback(() => {
    let templates = [...PaymentStore.PayTemplates];
    templates = templates.filter(
      template => template.checkForPay && template.debt && template.debt > 0,
    );
    return templates.reduce((sum, {debt}) => sum + getNumber(debt), 0);
  }, [PaymentStore.PayTemplates]);

  const coumputeTemplatesDetailDebt = useCallback(() => {
    let templates = [...(paymentDetailResponses || [])];
    return templates.reduce(
      (sum, {amountFee}) => sum + getNumber(amountFee),
      0,
    );
  }, [paymentDetailResponses]);

  useEffect(() => {
    let templates = [..._templates];
    templates = templates.filter(template => template.checkForPay);
    let canNotPayWithUnipoints = templates.some(
      template => template.canPayWithUnipoints === 0,
    );

    if (canNotPayWithUnipoints) {
      setAccounts([
        ...(userData.userAccounts?.filter(acc => acc.type !== TYPE_UNICARD) ||
          []),
      ]);
    } else {
      setAccounts([...(userData.userAccounts || [])]);
    }
  }, [PaymentStore.PayTemplates, userData.userAccounts]);

  useEffect(() => {
    setTemplates(
      PaymentStore.PayTemplates.filter(
        template => template.checkForPay && template.debt && template.debt > 0,
      ),
    );
  }, [PaymentStore.PayTemplates]);

  const changeTemplateDebt = (templID?: number, newDebt: string = '0') => {
    let templateIndex = _templates.findIndex(
      template => template.payTempID === templID,
    );

    if (templateIndex >= 0) {
      if (isNaN(parseInt(newDebt))) {
        _templates[templateIndex].debt = undefined;
      } else {
        _templates[templateIndex].debt = parseFloat(newDebt);
        setTemplates([..._templates]);
      }
    }
  };

  const getBatchPaymentDetails = () => {
    NetworkService.CheckConnection(() => {
      let requestData: IGetBatchPaymentDetailsRequets[] = [];
     
      let templates = [...PaymentStore.PayTemplates];
      templates = templates.filter(
        template => template.checkForPay && template.debt && template.debt > 0,
      );
      templates.map(template => {
        console.log('template ==>>', template)
        requestData.push({
          forOpClassCode: template.forOpClassCode,
          forMerchantCode: template.merchantCode,
          forMerchantServiceCode: template.merchantServiceCode,
          forFundsSPCode: PaymentStore.selectedAccount?.type == 7? "UNICARD":"UniWallet",
          accountNumber:
            PaymentStore.selectedAccount?.accountNumber ||
            PaymentStore.selectedAccount?.accountId?.toString(),
          inAmount: template.debt,
          forCustomerType:
            PaymentStore.selectedAccount?.customerAccountType?.toString(),
          payTempID: getNumber(template?.payTempID),
        });
        return template;
      });
      setIsLoading(true);
      console.log('request data ============>', requestData)
      PresentationServive.GetBatchPaymentDetails(requestData).subscribe({

        next: Response => {
          //console.log('Response.data.data.paymentDetailResponses ---------', Response.data.data.paymentDetailResponses)
          setPaymentDetailResonses(Response.data.data.paymentDetailResponses);
        },
        error: () => setIsLoading(false),
        complete: () => setIsLoading(false),
      });
    });
  };

  const checkForPayTemplateToggleHandle = (
    index: number,
    payTempID?: number | undefined,
  ) => {
    const templateIndex = PaymentStore.PayTemplates.findIndex(
      template => template.payTempID === payTempID,
    );

    if (templateIndex >= 0) {
      const payTemplates = [...PaymentStore.PayTemplates];
      payTemplates[templateIndex].checkForPay = undefined;
      dispatch({
        type: PAYMENTS_ACTIONS.SET_PAY_TEMPLATES,
        PayTemplates: payTemplates,
      });
    }
  };

  useEffect(() => {
    if (route.params.paymentStep === PAYMENT_STEPS.CHECK_DEBT) {
      getBatchPaymentDetails();
    }
    if (route.params.paymentStep === PAYMENT_STEPS.OTP) {
      SendUnicardOTP();
    }
  }, []);

  const handleStep = () => {
    Keyboard.dismiss();
    setIsLoading(true);

    if (!PaymentStore.selectedAccount) {
      setAccountErrorStyle({borderColor: colors.danger, borderWidth: 1});
      setIsLoading(false);
      return;
    }
    if (route.params.paymentStep === PAYMENT_STEPS.SELECT_ACCOUNT) {
      setIsLoading(false);
      props.navigation?.navigate(Routes.Payments_PAY_ALL_CHECK_DEBT, {
        paymentStep: PAYMENT_STEPS.CHECK_DEBT,
      });
      return;
    } else if (route.params.paymentStep === PAYMENT_STEPS.CHECK_DEBT) {
      if (
        PaymentStore.selectedAccount?.type === TYPE_UNICARD &&
        (!otp || !unicardOtpGuid)
      ) {
        setIsLoading(false);
        props.navigation?.navigate(Routes.Payments_PAY_ALL_OTP, {
          paymentStep: PAYMENT_STEPS.OTP,
        });
        return;
      }
      startPayBatchTransaction();
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          {route.params.paymentStep >= PAYMENT_STEPS.SELECT_ACCOUNT &&
            route.params.paymentStep < PAYMENT_STEPS.OTP && (
              <View>
                <View style={[screenStyles.wraper, styles.accountBox]}>
                  <Text style={styles.accountBoxTitle}>{translate.t('common.selectAccount')}</Text>

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

                <View style={[screenStyles.wraper, styles.merchantsBox]}>
                  {_templates.map((template, index) => (
                    <SwipableListItem
                      swipeId={template.payTempID}
                      key={template.payTempID}
                      style={styles.templatesItem}
                      onAcionClick={checkForPayTemplateToggleHandle}
                      options={RightActionOptions}>
                      <View style={styles.merchantInfo}>
                        <Image
                          style={styles.logo}
                          source={{uri: template.imageUrl}}
                        />
                        <View style={styles.rightContent}>
                          <View style={styles.nameBox}>
                            <Text numberOfLines={1} style={styles.serviceName}>
                              {template.templName}
                            </Text>
                            <Text style={styles.address}>
                              {'adres'} {'code'}
                            </Text>
                          </View>
                          <View style={styles.amountBox}>
                            <TextInput
                              keyboardType="numeric"
                              selectTextOnFocus
                              onChangeText={debt =>
                                changeTemplateDebt(template.payTempID, debt)
                              }
                              value={getNumber(
                                template?.debt?.toString(),
                              ).toString()}
                              style={styles.amount}
                            />
                            <Text style={{color: colors.danger}}>
                              {CurrencySimbolConverter(GEL, translate.key)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </SwipableListItem>
                  ))}
                </View>

                <View style={[screenStyles.wraper, styles.templatesPayAllBox]}>
                  <Text style={styles.templatesComputedDebt}>
                    {translate.t('common.amount')}{' '}
                    <Text style={{color: colors.danger}}>
                      {CurrencyConverter(coumputeTemplatesDebt().toFixed(2))}
                      {CurrencySimbolConverter(GEL, translate.key)}
                    </Text>
                  </Text>
                  {route.params.paymentStep === PAYMENT_STEPS.CHECK_DEBT && (
                    <>
                      <Text style={styles.templatesComputedDebt}>
                      {translate.t('common.commission')}{' '}
                        <Text style={{color: colors.danger}}>
                          {CurrencyConverter(
                            coumputeTemplatesDetailDebt().toFixed(2),
                          )}
                          {CurrencySimbolConverter(GEL, translate.key)}
                        </Text>
                      </Text>
                      <Text style={styles.templatesComputedDebt}>
                        { translate.t("payments.totalDue")}{' '}
                        <Text style={{color: colors.danger}}>
                          {CurrencyConverter(
                            (
                              coumputeTemplatesDebt() +
                              coumputeTemplatesDetailDebt()
                            ).toFixed(2),
                          )}
                          {CurrencySimbolConverter(GEL, translate.key)}
                        </Text>
                      </Text>
                    </>
                  )}
                </View>
              </View>
            )}

          {route.params.paymentStep === PAYMENT_STEPS.OTP && (
            <SetOtp
              otp={otp}
              onSetOtp={setOtp}
              onSendUnicardOTP={SendUnicardOTP}
              style={styles.otp}
            />
          )}
            <View style={[screenStyles.wraper, styles.buttonContainer]}>
              <AppButton
                onPress={handleStep}
                title={translate.t('common.next')}
                disabled={_templates.every(
                  template => template.checkForPay === false,
                )}
                isLoading={isLoading}
              />
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
    paddingBottom: tabHeight
  },
  scrollView: {
    flexGrow: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  paymentStepHeaderHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 16,
    marginTop: 0,
    paddingHorizontal: 20,
    height: 27,
  },
  titleBox: {
    flex: 1,
  },
  titleText: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.black,
    fontSize: 14,
    lineHeight: 27,
    flex: 1,
    textAlign: 'right',
    alignSelf: 'stretch',
  },
  merchantsBox: {
    marginTop: 25,
    backgroundColor: colors.white,
  },
  accountBox: {
    marginTop: 40,
    backgroundColor: colors.white,
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dropImg: {
    marginRight: 12,
  },
  merchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    height: 54,
    padding: 7,
    backgroundColor: colors.white,
    borderColor: colors.baseBackgroundColor,
    borderRadius: 10,
    borderWidth: 1,
  },
  templatesItem: {},
  logo: {
    width: 40,
    height: 40,
    marginRight: 20,
  },
  serviceName: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  address: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 10,
    lineHeight: 13,
    color: colors.placeholderColor,
  },
  buttonContainer: {
    marginTop: 27,
    marginBottom: 20,
  },
  templatesPayAllBox: {
    marginTop: 0,
    backgroundColor: colors.white,
  },
  templatesComputedDebt: {
    marginTop: 18,
    textAlign: 'right',
    fontFamily: 'FiraGO-Book',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  otp: {
    marginTop: 150,
  },
  rightContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountBox: {
    borderWidth: 1,
    borderColor: colors.baseBackgroundColor,
    borderRadius: 10,
    padding: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    color: colors.danger,
    padding: 0,
    textAlign: 'center',
  },
  nameBox: {
    flex: 1,
  }
});

export default PayAll;

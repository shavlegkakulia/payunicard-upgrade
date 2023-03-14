import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AccountSelect, {
  AccountItem,
} from '../../../components/AccountSelect/AccountSelect';
import CurrencySelect, {
  CurrencyItem,
} from '../../../components/CurrencySelect/CurrencySelect';
import FloatingLabelInput from '../../../containers/otp/Otp';
import AppButton from '../../../components/UI/AppButton';
import AppInput from '../../../components/UI/AppInput';
import AppInputText from '../../../components/UI/AppInputText';
import colors from '../../../constants/colors';
import currencies, {GEL} from '../../../constants/currencies';
import opClassCodes from '../../../constants/opClassCodes';
import {PUSH} from '../../../redux/actions/error_action';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import NetworkService from '../../../services/NetworkService';
import OTPService, {
  GeneratePhoneOtpByUserRequest,
} from '../../../services/OTPService';
import PresentationServive, {
  IGetPaymentDetailsRequest,
  IGetPaymentDetailsResponseData,
} from '../../../services/PresentationServive';
import TransactionService, {IP2PTransactionRequest} from '../../../services/TransactionService';
import {IAccountBallance, ICurrency} from '../../../services/UserService';
import {
  CurrencyConverter,
  CurrencySimbolConverter,
  getNumber,
  getString,
} from '../../../utils/Converter';
import {
  ITransfersState,
  IGlobalState as ITRansferGlobalState,
  TRANSFERS_ACTION_TYPES,
} from '../../../redux/action_types/transfers_action_types';
import {INavigationProps, TRANSFER_TYPES} from '.';
import {RouteProp, useRoute} from '@react-navigation/core';
import {IAddTransferTemplateRequest} from '../../../services/TemplatesService';
import {
  addTransactionTemplate,
  getTransferTemplates,
} from '../../../redux/actions/transfers_actions';
import Routes from '../../../navigation/routes';
import {
  INavigationState,
  IGlobalState as INAVGlobalState,
} from '../../../redux/action_types/navigation_action_types';
import {TYPE_UNICARD} from '../../../constants/accountTypes';
import NavigationService from '../../../services/NavigationService';
import {tabHeight} from '../../../navigation/TabNav';
import Validation, {required} from '../../../components/UI/Validation';
import {subscriptionService} from '../../../services/subscriptionService';
import SUBSCRIBTION_KEYS from '../../../constants/subscribtionKeys';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import SmsRetriever from 'react-native-sms-retriever';
import { ka_ge } from '../../../lang';

type RouteParamList = {
  params: {
    transferStep: string;
  };
};

const ValidationContext = 'transferToBank';

const TransferToBank: React.FC<INavigationProps> = props => {
  const [fromAccountVisible, setFromAccountVisible] = useState(false);
  const [toCurrencyVisible, setToCurrencyVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [fromAccountErrorStyle, setFromAccountErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});

  const [benificarAccountErrorStyle, setBenificarAccountErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [benificarNameErrorStyle, setBenificarNameErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});

  const [toCurrencyErrorStyle, setToCurrencyErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [amountErrorStyle, setAmountErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [nominationErrorStyle, setNominationErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [templateNameInputToggle, setTemplateNameInputToggle] = useState(false);
  const [maskedNumber, setMaskedNumber] = useState<string | undefined>();
  const [transferDetail, setTransferDetails] = useState<
    IGetPaymentDetailsResponseData | undefined
  >();
  const [currenciesFrom, setCurrenciesFrom] = useState<ICurrency[] | undefined>(
    undefined,
  );

  const [accounts, setAccounts] = useState<IAccountBallance[] | undefined>();

  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;

  const TransfersStore = useSelector<ITRansferGlobalState>(
    state => state.TransfersReducer,
  ) as ITransfersState;

  const navStore = useSelector<INAVGlobalState>(
    state => state.NavigationReducer,
  ) as INavigationState;

  const dispatch = useDispatch<any>();;

  const [otp, setOtp] = useState<string | undefined>();
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();

  const setTransferStep = (step: string) => {
    const params = {
      ...route.params,
      transferStep: step,
    };
    NavigationService.navigate(`${step}`, params);
  };

  const AddTransactionTemplate = () => {
    const data: IAddTransferTemplateRequest = {
      longopId: TransfersStore.transactionResponse?.longOpId,
      templName: TransfersStore.templateName,
      isBetweenOwnAccounts: false,
    };

    dispatch(
      addTransactionTemplate(data, () => {
        subscriptionService.sendData(
          SUBSCRIBTION_KEYS.FETCH_USER_ACCOUNTS,
          true,
        );
        NavigationService.navigate(navStore.parentRoute);
      }),
    );
  };

  
  const MakeTransaction =
  (toBank: boolean = false, data: IP2PTransactionRequest = {
    beneficiaryBankName: undefined,
    beneficiaryBankCode: undefined,
    recipientAddress: undefined,
    recipientCity: undefined,
    beneficiaryRegistrationCountryCode: undefined
  }) => { 
    setIsLoading(true);
    TransactionService.makeTransaction(toBank, data).subscribe({
      next: Response => { 
        if(Response.data.ok) {
          dispatch({
            type: TRANSFERS_ACTION_TYPES.SET_TRANSACTION_RESPONSE,
            transactionResponse: {...Response.data.data},
          });
        } else { 
          if(Response.data.errors) {
            dispatch(PUSH(getString(Response.data.errors?.[0]?.displayText)));
          }
        }
        setIsLoading(false);
      },
      error: e => { 
        setTimeout(() => {
          dispatch(PUSH(getString(e.data.errors?.[0]?.displayText)));
        }, 2000);
        setIsLoading(false);
      },
    });
  };

  const makeTransaction = (toBank: boolean = false) => {
    const data: IP2PTransactionRequest = {
      toAccountNumber: TransfersStore.selectedToAccount?.accountNumber,
      fromAccountNumber: TransfersStore.selectedFromAccount?.accountNumber,
      nomination: TransfersStore.nomination || translate.t('transfer.toBank'),
      Nomination: TransfersStore.nomination || translate.t('transfer.toBank'),
      ccy: TransfersStore.selectedToCurrency?.key,
      ccyto: TransfersStore.selectedToCurrency?.key,
      amount: getNumber(TransfersStore.amount),
      otp: null,
    };
    if (TransfersStore.transferType === TRANSFER_TYPES.toBank) {
      data.toAccountNumber = TransfersStore.benificarAccount;
      data.beneficiaryName = TransfersStore.benificarName;
      data.otp = otp;
      data.ccy = GEL;
      data.ccyto = GEL;
    }
    if (TransfersStore.transferType === TRANSFER_TYPES.toUni) {
      data.toAccountNumber = TransfersStore.benificarAccount;
      data.beneficiaryName = TransfersStore.benificarName;
      data.otp = otp;
      data.ccy = TransfersStore.selectedFromCurrency?.key;
      data.ccyto = TransfersStore.selectedFromCurrency?.key;
    }
    if (TransfersStore.transferType === TRANSFER_TYPES.Convertation) {
      data.toAccountNumber = TransfersStore.selectedToAccount?.accountNumber;
      data.ccy = TransfersStore.selectedFromCurrency?.key;
      data.ccyto = TransfersStore.selectedToCurrency?.key;
    }

    MakeTransaction(toBank, data);
  };

  const setBenificarAccount = (account: string | undefined) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_BENIFICARY_ACCOUNT,
      benificarAccount: account,
    });
  };

  const setSelectedToCurrency = (currency: ICurrency | undefined) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_TO_CURRENCY,
      selectedToCurrency: currency,
    });
  };

  const setBenificarName = (name: string | undefined) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_BENIFICARY_NAME,
      benificarName: name,
    });
  };

  const setAmount = (amount: string | undefined) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_AMOUNT,
      amount: amount?.replace(',', '.'),
    });
  };

  const setNomination = (nomination: string | undefined) => {
    dispatch({type: TRANSFERS_ACTION_TYPES.SET_NOMINATION, nomination});
  };

  const setTemplateName = (name: string | undefined) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_TEMPLATE_NAME,
      templateName: name,
    });
  };

  /**********************************/

  const onFromAccountSelect = (account: IAccountBallance) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_ACCOUNT,
      selectedFromAccount: account,
    });
    setFromAccountVisible(!fromAccountVisible);
  };

  useEffect(() => {
    let _acount = {...TransfersStore.selectedFromAccount};
    setCurrenciesFrom(_acount.currencies);
  }, [TransfersStore.selectedFromAccount]);

  const onToAccountSet = (account: string) => {
    setBenificarAccount(account);
  };

  const onToCurrencySelect = (currency: ICurrency) => {
    setSelectedToCurrency(currency);
    setToCurrencyVisible(!toCurrencyVisible);
  };

  const SendPhoneOTP = () => {
    NetworkService.CheckConnection(() => {
      setIsLoading(true);

      let OTP: GeneratePhoneOtpByUserRequest = {
        userName: userData.userDetails?.username,
      };
      OTPService.GeneratePhoneOtpByUser({OTP}).subscribe({
        next: Response => {
          if (Response.data.ok) {
            setMaskedNumber(Response.data.data?.phoneMask);
          }
        },
        error: _ => {
          setIsLoading(false);
        },
        complete: () => {
          setIsLoading(false);
        },
      });
    });
  };

  const GetPaymentDetails = () => {
    let _amount = 0;
    if (!isNaN(getNumber(TransfersStore.amount))) {
      _amount = getNumber(TransfersStore.amount);
    }

    const data: IGetPaymentDetailsRequest = {
      ForOpClassCode: opClassCodes.toBank,
      AccountNumber: TransfersStore.selectedFromAccount?.accountNumber,
      IbanAccountNumber: TransfersStore.benificarAccount,
      InAmount: _amount,
    };

    NetworkService.CheckConnection(() => {
      PresentationServive.GetPaymentDetails(data).subscribe({
        next: Response => {
          setTransferDetails(Response.data?.data);
        },
      });
    });
  };

  const setTransferType = (type: string | undefined) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_TRASNSFER_TYPE,
      transferType: type,
    });
  };

  useEffect(() => {
    if (route.params.transferStep === Routes.TransferToBank_SET_OTP) {
      SendPhoneOTP();
    }
  }, []);

  useEffect(() => {
    if (TransfersStore.amount) {
      GetPaymentDetails();
    }
  }, [TransfersStore.amount, TransfersStore.selectedFromAccount]);

  useEffect(() => {
    if (TransfersStore.transactionResponse) {
      setTransferStep(Routes.TransferToBank_SUCCES);
    }
  }, [TransfersStore.transactionResponse]);

  useEffect(() => {
    if (!TransfersStore.fullScreenLoading) {
      setIsLoading(false);
    }
  }, [TransfersStore.fullScreenLoading]);

  useEffect(() => {
    if (!TransfersStore.nomination?.trim()){
      setNomination(translate.t('transfer.toBank'));
    };
    setTransferType(TRANSFER_TYPES.toBank);
  }, []);

  useEffect(() => {
    if (userData.userAccounts && !userData.isAccountsLoading) {
      let uac = [...(userData.userAccounts || [])];
      uac = uac.filter(account => account.type !== TYPE_UNICARD);
      setAccounts(uac);
    }
  }, [userData.isAccountsLoading]);

  const onOperationHandle = () => {
    setIsLoading(true);
    if (route.params.transferStep === Routes.TransferToBank_CHOOSE_ACCOUNTS) {
      if (!TransfersStore.selectedFromAccount) {
        setFromAccountErrorStyle({borderColor: colors.danger, borderWidth: 1});
        setIsLoading(false);
        return;
      }

      if (Validation.validate(ValidationContext)) {
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setTransferStep(Routes.TransferToBank_SET_CURRENCY);
    } else if (
      route.params.transferStep === Routes.TransferToBank_SET_CURRENCY
    ) {
      if (!TransfersStore.amount || isNaN(parseInt(TransfersStore.amount))) {
        setAmountErrorStyle({
          borderBottomColor: colors.danger,
          borderBottomWidth: 1,
        });
        setIsLoading(false);
        return;
      } else {
        setAmountErrorStyle({});
      }

      if (!TransfersStore.nomination) {
        setNominationErrorStyle({borderColor: colors.danger, borderWidth: 1});
        setIsLoading(false);
        return;
      } else {
        setNominationErrorStyle({});
      }

      if (getNumber(TransfersStore.amount) < 0.1) {
        dispatch(
          PUSH(
            `${translate.t('transfer.minimumTransferAmount')} ${CurrencySimbolConverter(GEL, translate.key)}`,
          ),
        );
        setIsLoading(false);
        setAmountErrorStyle({
          borderBottomColor: colors.danger,
          borderBottomWidth: 1,
        });
        return;
      } else {
        setAmountErrorStyle({});
      }

      setTransferStep(Routes.TransferToBank_SET_OTP);
      setIsLoading(false);
      return;
    } else if (route.params.transferStep === Routes.TransferToBank_SET_OTP) {
      if (otp) {
        makeTransaction(true);
      }
    } else if (route.params.transferStep === Routes.TransferToBank_SUCCES) {
      if (TransfersStore.templateName) {
        AddTransactionTemplate();
        return;
      }
      subscriptionService.sendData(SUBSCRIBTION_KEYS.FETCH_USER_ACCOUNTS, true);
      dispatch({type: TRANSFERS_ACTION_TYPES.RESET_TRANSFER_STATES});
      dispatch(getTransferTemplates());
      NavigationService.navigate(Routes.Transfers);
    }
  };

  const onSmsListener = async () => {
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        SmsRetriever.addSmsListener(event => {
          if (event && event?.message) {
            try {
              const otpobj = /(\d{4})/g?.exec(getString(event?.message));
            if (otpobj && otpobj?.length > 0) {
              setOtp(otpobj[1]);
              Keyboard.dismiss();
            }
            } catch (error) {
              console.log(JSON.stringify(error))
            }
          }
        })
      }
    } catch (error) {
  
    }
  };

  useEffect(() => {
    onSmsListener();

    return () => SmsRetriever.removeSmsListener();
  }, []);

  const _currency: ICurrency[] = [
    {
      key: GEL,
      value: translate.key === ka_ge ? currencies.GEL : GEL,
      balance: 0,
      available: 0,
      availableBal: 0,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.avoid}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0}
        style={styles.avoid}>
        <View style={styles.container}>
          <View
            style={[
              styles.contentContainer,
              route.params.transferStep === Routes.TransferToBank_SUCCES &&
                styles.withSucces,
            ]}>
            {(route.params.transferStep ===
              Routes.TransferToBank_CHOOSE_ACCOUNTS ||
              route.params.transferStep ===
                Routes.TransferToBank_SET_CURRENCY) && (
              <View>
                <View style={styles.accountBox}>
                  <Text style={styles.accountBoxTitle}>{translate.t('transfer.from')}</Text>

                  {TransfersStore.selectedFromAccount ? (
                    <AccountItem
                      account={TransfersStore.selectedFromAccount}
                      onAccountSelect={() => setFromAccountVisible(true)}
                      style={styles.accountItem}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setFromAccountVisible(true)}
                      style={[
                        styles.accountSelectHandler,
                        fromAccountErrorStyle,
                      ]}>
                        <Text style={styles.accountPlaceholder}>{translate.t('common.selectAccount')}</Text>
                      <Image
                        style={styles.dropImg}
                        source={require('./../../../assets/images/down-arrow.png')}
                      />
                    </TouchableOpacity>
                  )}

                  <AccountSelect
                    accounts={accounts}
                    selectedAccount={TransfersStore.selectedFromAccount}
                    accountVisible={fromAccountVisible}
                    onSelect={account => onFromAccountSelect(account)}
                    onToggle={() => setFromAccountVisible(!fromAccountVisible)}
                  />
                </View>
                {route.params.transferStep !==
                  Routes.TransferToBank_SET_CURRENCY && (
                  <>
                    <View style={styles.accountBox}>
                      <Text style={styles.accountBoxTitle}>{translate.t('transfer.to')}</Text>

                      <AppInput
                        style={benificarAccountErrorStyle}
                        value={TransfersStore.benificarAccount}
                        onChange={onToAccountSet}
                        placeholder={translate.t('transfer.beneficiaryAccount')}
                        context={ValidationContext}
                        customKey="benificarAccount"
                        requireds={[required]}
                      />
                    </View>

                    <View style={styles.accountBox}>
                      <Text style={styles.accountBoxTitle}>
                      {translate.t('transfer.beneficiaryName')}
                      </Text>

                      <AppInput
                        style={benificarNameErrorStyle}
                        value={TransfersStore.benificarName}
                        onChange={setBenificarName}
                        placeholder={translate.t('transfer.beneficiaryName')}
                        context={ValidationContext}
                        customKey="benificarName"
                        requireds={[required]}
                      />
                    </View>
                  </>
                )}
              </View>
            )}
            {route.params.transferStep ===
              Routes.TransferToBank_SET_CURRENCY && (
              <View>
                <View style={styles.benificarBox}>
                  <Text style={styles.benificarDetail}>
                    {translate.t('transfer.to')}: {TransfersStore.benificarAccount}
                  </Text>
                  <Text style={styles.benificarDetail}>
                    {translate.t('transfer.beneficiary')}: {TransfersStore.benificarName}
                  </Text>
                </View>

                <View style={styles.amountContainer}>
                  <AppInputText
                    label={translate.t('transfer.amount')}
                    onChangeText={setAmount}
                    Style={[styles.amountInput, amountErrorStyle]}
                    autoFocus={TransfersStore.isTemplate}
                    value={TransfersStore.amount}
                  />

                  <View style={styles.currencyBox}>
                    {_currency[0] ? (
                      <CurrencyItem
                        defaultTitle={ translate.t("transfer.currency")}
                        currency={_currency[0]}
                        onCurrencySelect={() => setToCurrencyVisible(true)}
                        style={styles.currencyItem}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => setToCurrencyVisible(true)}
                        style={[
                          styles.currencySelectHandler,
                          toCurrencyErrorStyle,
                        ]}>
                        <Text style={styles.currencyPlaceholder}>{ translate.t("transfer.currency")}</Text>
                        <Image
                          style={styles.dropImg}
                          source={require('./../../../assets/images/down-arrow.png')}
                        />
                      </TouchableOpacity>
                    )}

                    <CurrencySelect
                      currencies={_currency}
                      selectedCurrency={TransfersStore.selectedToCurrency}
                      currencyVisible={toCurrencyVisible}
                      onSelect={currency => onToCurrencySelect(currency)}
                      onToggle={() => setToCurrencyVisible(!toCurrencyVisible)}
                    />
                  </View>
                </View>
                {transferDetail && (
                  <View style={styles.debtBox}>
                    <Text style={styles.debt}>
                    {translate.t('common.commission')}{' '}
                      {CurrencyConverter(getNumber(transferDetail?.amountFee))}
                      {translate.key === ka_ge ? currencies.GEL : GEL}
                    </Text>
                  </View>
                )}

                <View style={styles.nominationBox}>
                  <Text style={styles.accountBoxTitle}>{translate.t('transfer.nomination')}</Text>
                  <AppInput
                    customKey="Nomination"
                    context={ValidationContext}
                    placeholder={translate.t('transfer.nomination')}
                    value={TransfersStore.nomination}
                    style={nominationErrorStyle}
                    requireds={[required]}
                    onChange={setNomination}
                  />
                </View>
              </View>
            )}

            {route.params.transferStep === Routes.TransferToBank_SET_OTP && (
              <View style={styles.insertOtpSTep}>
                <Text style={styles.insertOtpCode}>{translate.t('otp.enterOtp')}</Text>
                <FloatingLabelInput
                  Style={styles.otpBox}
                  label={translate.t('otp.smsCode')}
                  resendTitle={translate.t('otp.resend')}
                  title={`${translate.t('otp.otpSent')} ${getString(maskedNumber)}`}
                  value={otp}
                  onChangeText={setOtp}
                  onRetry={SendPhoneOTP}
                />
              </View>
            )}

            {route.params.transferStep === Routes.TransferToBank_SUCCES && (
              <View style={styles.succesInner}>
                <Text style={styles.succesText}>
                {translate.t('transfer.transactionSuccessfull')}
                </Text>
                <Image
                  source={require('./../../../assets/images/succes_icon.png')}
                  style={styles.succesImg}
                />
                {!TransfersStore.isTemplate && (
                  <View>
                    <Image
                      source={require('./../../../assets/images/templateIcon.png')}
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
                          value={TransfersStore.templateName}
                          onChange={name => {
                            setTemplateName(name);
                          }}
                          context={ValidationContext}
                          placeholder={translate.t('template.templateName')}
                          customKey="templateName"
                          requireds={[required]}
                          style={styles.templateNameInput}
                        />
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            )}
          </View>
          <AppButton
            isLoading={TransfersStore.fullScreenLoading || isLoading}
            onPress={onOperationHandle}
            title={
              route.params.transferStep === Routes.TransferToBank_SUCCES
                ? translate.t('common.close')
                : translate.t('common.next')
            }
            style={styles.handleButton}
            disabled={(route.params.transferStep === Routes.Internatinal_set_otp && (!otp || otp?.length < 4))}
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
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: tabHeight,
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    paddingTop: 20,
  },
  handleButton: {
    marginVertical: 40,
  },
  accountBox: {
    marginTop: 20,
  },
  nominationBox: {
    marginTop: 40,
  },
  debtBox: {
    marginTop: 20,
  },
  debt: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 10,
    lineHeight: 12,
    color: colors.danger,
  },
  accountBoxTitle: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    marginBottom: 15,
  },
  accountItem: {
    //paddingLeft: 0
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
  currencyBox: {
    height: 50,
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.baseBackgroundColor,
  },
  currencyItem: {
    backgroundColor: colors.none,
    borderTopColor: colors.none,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderBottomColor: colors.none,
  },
  currencySelectHandler: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  currencyPlaceholder: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.placeholderColor,
    marginRight: 7,
  },
  amountInput: {
    paddingTop: 0,
    marginHorizontal: 0,
    marginLeft: 5,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.baseBackgroundColor,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  benificarBox: {
    marginTop: 13,
    paddingLeft: 7,
  },
  benificarDetail: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.placeholderColor,
  },
  insertOtpSTep: {
    marginTop: 25,
  },
  insertOtpCode: {
    fontFamily: 'FiraGO-Bold',
    fontWeight: '500',
    color: colors.black,
    fontSize: 24,
    lineHeight: 29,
    textAlign: 'left',
  },
  otpBox: {
    marginTop: 40,
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
  templateIcon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginTop: 30,
  },
  withSucces: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TransferToBank;

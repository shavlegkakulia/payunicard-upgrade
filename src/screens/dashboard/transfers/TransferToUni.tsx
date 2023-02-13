import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  StyleProp,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard
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
import {GEL} from '../../../constants/currencies';
import {PUSH} from '../../../redux/actions/error_action';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import NetworkService from '../../../services/NetworkService';
import OTPService, {
  GeneratePhoneOtpByUserRequest,
} from '../../../services/OTPService';
import TransactionService, {
  IGetUserDataByAccountNumberRequest,
  IP2PTransactionRequest,
} from '../../../services/TransactionService';
import {IAccountBallance, ICurrency} from '../../../services/UserService';
import {
  CurrencySimbolConverter,
  getNumber,
  getString,
} from '../../../utils/Converter';
import {
  ITransfersState,
  IGlobalState as ITRansferGlobalState,
  TRANSFERS_ACTION_TYPES,
} from '../../../redux/action_types/transfers_action_types';
import Validation, {required} from '../../../components/UI/Validation';
import {accountTpeCheckRegX} from '../../../utils/Regex';
import opClassCodes from '../../../constants/opClassCodes';
import {TRANSFER_TYPES} from './index';
import {RouteProp, useRoute} from '@react-navigation/native';
import Routes from '../../../navigation/routes';
import {
  addTransactionTemplate,
  getTransferTemplates,
} from '../../../redux/actions/transfers_actions';
import {IAddTransferTemplateRequest} from '../../../services/TemplatesService';
import {TYPE_UNICARD} from '../../../constants/accountTypes';
import {
  INavigationState,
  IGlobalState as INAVGlobalState,
} from '../../../redux/action_types/navigation_action_types';
import {tabHeight} from '../../../navigation/TabNav';
import NavigationService from '../../../services/NavigationService';
import {subscriptionService} from '../../../services/subscriptionService';
import SUBSCRIBTION_KEYS from '../../../constants/subscribtionKeys';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import SmsRetriever from 'react-native-sms-retriever';

type RouteParamList = {
  params: {
    transferStep: string;
    withTemplate: boolean;
    newTemplate: boolean;
  };
};

const ValidationContext = 'transferToUni';

const TransferToUni: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  
  const [fromAccountVisible, setFromAccountVisible] = useState(false);
  const [fromCurrencyVisible, setFromCurrencyVisible] = useState(false);
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
  const [fromCurrencyErrorStyle, setFromCurrencyErrorStyle] = useState<
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

  const [currenciesFrom, setCurrenciesFrom] = useState<ICurrency[] | undefined>(
    undefined,
  );

  const navStore = useSelector<INAVGlobalState>(
    state => state.NavigationReducer,
  ) as INavigationState;

  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;

  const TransfersStore = useSelector<ITRansferGlobalState>(
    state => state.TransfersReducer,
  ) as ITransfersState;
  const [accounts, setAccounts] = useState<IAccountBallance[] | undefined>();
  const [otp, setOtp] = useState<string | undefined>();
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();

  const dispatch = useDispatch<any>();;


  const setTransferStep = (step: string) => {
    const params = {
      ...route.params,
      transferStep: step,
    };
    NavigationService.navigate(`${step}`, params);
  };

  const setBenificarAccount = (account: string | undefined) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_BENIFICARY_ACCOUNT,
      benificarAccount: account,
    });
  };

  const setSelectedFromCurrency = (currency: ICurrency | undefined) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_CURRENCY,
      selectedFromCurrency: currency,
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

  /**************************/

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
    GetUserDataByAccountNumber(account);
    setBenificarAccount(account);
  };

  const onFromCurrencySelect = (currency: ICurrency) => {
    setSelectedFromCurrency(currency);
    setFromCurrencyVisible(!fromCurrencyVisible);
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
          setTransferStep(Routes.TransferToUni_SET_OTP);
          setIsLoading(false);
        },
      });
    });
  };

  const GetUserDataByAccountNumber = (account: string | undefined) => {
    if (account && account.length < 20) {
      return;
    }

    const isUNI = accountTpeCheckRegX.test(getString(account));
   
    if (isUNI) {
      dispatch({
        type: TRANSFERS_ACTION_TYPES.SET_TRASNSFER_TYPE,
        transferType: opClassCodes.inWallet,
      });
    } else {
      dispatch({
        type: TRANSFERS_ACTION_TYPES.SET_TRASNSFER_TYPE,
        transferType: opClassCodes.toBank,
      });
      return;
    }

    NetworkService.CheckConnection(() => {
      setIsLoading(true);

      let data: IGetUserDataByAccountNumberRequest = {
        accountNumber: account,
      };
      TransactionService.GetUserDataByAccountNumber(data).subscribe({
        next: Response => {
          if (Response.data.ok) {
            setBenificarName(Response.data.data?.fullName || '');
          }
        },
        error: _ => {
          setIsLoading(false);
        },
        complete: () => {
          Validation.validate(ValidationContext);
          setIsLoading(false);
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

  const AddTransactionTemplate = () => {
    if (!route.params.withTemplate && !route.params.newTemplate) {
      const data: IAddTransferTemplateRequest = {
        longopId: TransfersStore.transactionResponse?.longOpId,
        templName: TransfersStore.templateName,
        isBetweenOwnAccounts: false,
      };

      dispatch(
        addTransactionTemplate(data, () => {
          setTransferStep(Routes.TransferToUni_TEMPLATE_IS_SAVED);
        }),
      );
    } else {
      const data: IAddTransferTemplateRequest = {
        amount: TransfersStore.amount,
        description: TransfersStore.nomination,
        ccyTo: TransfersStore.selectedFromCurrency?.key,
        beneficiaryName: TransfersStore.benificarName,
        templName: TransfersStore.templateName,
        opClassCode: TransfersStore.transferType,
      };

      if (TransfersStore.transferType === opClassCodes.toBank) {
        data.forFromAccountId = TransfersStore.selectedFromAccount?.accountId;
        data.senderAccountNumber =
          TransfersStore.selectedFromAccount?.accountNumber;
        data.beneficiaryAccountNumber = TransfersStore.benificarAccount;
      } else {
        data.forFromExternalAccountId =
          TransfersStore.selectedFromAccount?.accountId;
        data.forToExternalAccount = TransfersStore.benificarAccount;
      }
  
      dispatch(
        addTransactionTemplate(data, () => {
          setTransferStep(Routes.TransferToUni_TEMPLATE_IS_SAVED);
        }),
      );
    }
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
      nomination: TransfersStore.nomination,
      description: TransfersStore.nomination,
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

  useEffect(() => {
    if (!TransfersStore.nomination?.trim()){
      setNomination(translate.t('transfer.toUniWallet'));
    };
    setTransferType(TRANSFER_TYPES.toUni);
  }, []);

  useEffect(() => {
    if (
      (route.params.withTemplate || route.params.newTemplate) &&
      TransfersStore.benificarAccount &&
      route.params.transferStep === Routes.TransferToUni_CHOOSE_ACCOUNTS
    ) {
      GetUserDataByAccountNumber(TransfersStore.benificarAccount);
    }
  }, [route.params.withTemplate, route.params.newTemplate]);

  useEffect(() => {
    if (TransfersStore.isTemplate) {
      setCurrenciesFrom(TransfersStore.selectedFromAccount?.currencies);
    }
  }, []);

  useEffect(() => {
    if (
      TransfersStore.transactionResponse &&
      route.params.transferStep !== Routes.TransferToUni_TEMPLATE_IS_SAVED
    ) {
      if (route.params.newTemplate) {
        setTransferStep(Routes.TransferToUni_TEMPLATE_IS_SAVED);
        return;
      }
      setTransferStep(Routes.TransferToUni_SUCCES);
    }
  }, [TransfersStore.transactionResponse]);

  useEffect(() => {
    if (!TransfersStore.fullScreenLoading) {
      setIsLoading(false);
    }
  }, [TransfersStore.fullScreenLoading]);

  useEffect(() => {
    if (userData.userAccounts && !userData.isAccountsLoading) {
      let uac = [...(userData.userAccounts || [])];
      uac = uac.filter(account => account.type !== TYPE_UNICARD);
      setAccounts(uac);
    }
  }, [userData.isAccountsLoading]);

  useEffect(() => {
    if (route.params.withTemplate) {
      setCurrenciesFrom(TransfersStore.selectedFromAccount?.currencies);
    }
  }, []);

  const onOperationHandle = () => {
    setIsLoading(true);
    if (route.params.transferStep === Routes.TransferToUni_CHOOSE_ACCOUNTS) {
      if (!TransfersStore.selectedFromAccount) {
        setFromAccountErrorStyle({borderColor: colors.danger, borderWidth: 1});
        setIsLoading(false);
        return;
      }
      const val = Validation.validate(ValidationContext);

      if (val) {
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setTransferStep(Routes.TransferToUni_SET_CURRENCY);
    } else if (
      route.params.transferStep === Routes.TransferToUni_SET_CURRENCY
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

      if (!TransfersStore.selectedFromCurrency) {
        setFromCurrencyErrorStyle({
          borderBottomColor: colors.danger,
          borderBottomWidth: 1,
        });
        setIsLoading(false);
        return;
      } else {
        setFromCurrencyErrorStyle({});
      }

      if (!TransfersStore.nomination?.trim().length) {
        setNominationErrorStyle({borderColor: colors.danger, borderWidth: 1});
        setIsLoading(false);
        return;
      } else {
        setNominationErrorStyle({});
      }

      if (getNumber(TransfersStore.amount) < 0.1) {
        dispatch(
          PUSH(
            `${translate.t(
              'transfer.minimumTransferAmount',
            )} ${CurrencySimbolConverter(GEL, translate.key)}`,
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

      if (route.params.newTemplate) {
        setIsLoading(false);
        AddTransactionTemplate();
        return;
      }

      SendPhoneOTP();
    } else if (route.params.transferStep === Routes.TransferToUni_SET_OTP) {
      if (otp) {
        makeTransaction();
      }
    } else if (route.params.transferStep === Routes.TransferToUni_SUCCES) {
      if (TransfersStore.templateName) {
        AddTransactionTemplate();
        return;
      }
      subscriptionService.sendData(SUBSCRIBTION_KEYS.FETCH_USER_ACCOUNTS, true);
      dispatch(getTransferTemplates());
      dispatch({type: TRANSFERS_ACTION_TYPES.RESET_TRANSFER_STATES});
      NavigationService.navigate(Routes.Transfers);
    } else if (
      route.params.transferStep === Routes.TransferToUni_TEMPLATE_IS_SAVED
    ) {
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
    } catch (error) {}
  };

  useEffect(() => {
    onSmsListener();

    return () => SmsRetriever.removeSmsListener();
  }, []);

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
              route.params.transferStep >= Routes.TransferToUni_SUCCES &&
                styles.withSucces,
            ]}>
            {(route.params.transferStep ===
              Routes.TransferToUni_CHOOSE_ACCOUNTS ||
              route.params.transferStep ===
                Routes.TransferToUni_SET_CURRENCY) && (
              <>
                <View style={styles.accountBox}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('transfer.from')}
                  </Text>

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
                  Routes.TransferToUni_SET_CURRENCY && (
                  <>
                    <View style={styles.accountBox}>
                      <Text style={styles.accountBoxTitle}>
                        {translate.t('transfer.to')}
                      </Text>

                      <AppInput
                        style={benificarAccountErrorStyle}
                        value={TransfersStore.benificarAccount}
                        onChange={onToAccountSet}
                        placeholder={translate.t('transfer.beneficiaryAccount')}
                        requireds={[required]}
                        context={ValidationContext}
                        customKey="benificarAccount"
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
              </>
            )}
            {route.params.transferStep ===
              Routes.TransferToUni_SET_CURRENCY && (
              <>
                <View style={styles.benificarBox}>
                  <Text style={styles.benificarDetail}>
                    {translate.t('transfer.to')}:{' '}
                    {TransfersStore.benificarAccount}
                  </Text>
                  <Text style={styles.benificarDetail}>
                    {translate.t('transfer.beneficiary')}:{' '}
                    {TransfersStore.benificarName}
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
                    {TransfersStore.selectedFromCurrency ? (
                      <CurrencyItem
                        defaultTitle={translate.t('transfer.currency')}
                        currency={TransfersStore.selectedFromCurrency}
                        onCurrencySelect={() => setFromCurrencyVisible(true)}
                        style={styles.currencyItem}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => setFromCurrencyVisible(true)}
                        style={[
                          styles.currencySelectHandler,
                          fromCurrencyErrorStyle,
                        ]}>
                        <Text style={styles.currencyPlaceholder}>
                          {translate.t('transfer.currency')}
                        </Text>
                        <Image
                          style={styles.dropImg}
                          source={require('./../../../assets/images/down-arrow.png')}
                        />
                      </TouchableOpacity>
                    )}

                    <CurrencySelect
                      currencies={currenciesFrom}
                      selectedCurrency={TransfersStore.selectedFromCurrency}
                      currencyVisible={fromCurrencyVisible}
                      onSelect={currency => onFromCurrencySelect(currency)}
                      onToggle={() =>
                        setFromCurrencyVisible(!fromCurrencyVisible)
                      }
                    />
                  </View>
                </View>

                <View style={styles.nominationBox}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('transfer.nomination')}
                  </Text>
                  <AppInput
                    customKey="nomination"
                    context={ValidationContext}
                    requireds={[required]}
                    placeholder={translate.t('transfer.nomination')}
                    value={
                      TransfersStore.nomination
                    }
                    style={nominationErrorStyle}
                    onChange={setNomination}
                  />
                </View>

                {route.params.newTemplate && (
                  <View style={styles.nominationBox}>
                    <Text style={styles.accountBoxTitle}>
                      {translate.t('template.templateName')}
                    </Text>
                    <AppInput
                      customKey="templateName"
                      context={ValidationContext}
                      placeholder={translate.t('template.templateName')}
                      requireds={[required]}
                      value={TransfersStore.templateName}
                      style={nominationErrorStyle}
                      onChange={setTemplateName}
                    />
                  </View>
                )}
              </>
            )}

            {route.params.transferStep === Routes.TransferToUni_SET_OTP && (
              <View style={styles.insertOtpSTep}>
                <Text style={styles.insertOtpCode}>
                  {translate.t('otp.enterOtp')}
                </Text>
                <FloatingLabelInput
                  Style={styles.otpBox}
                  label={translate.t('otp.smsCode')}
                  title={`${translate.t('otp.otpSent')} ${getString(
                    maskedNumber,
                  )}`}
                  resendTitle={translate.t('otp.resend')}
                  value={otp}
                  onChangeText={setOtp}
                  onRetry={SendPhoneOTP}
                />
              </View>
            )}

            {route.params.transferStep === Routes.TransferToUni_SUCCES && (
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
                          style={styles.templateNameInput}
                        />
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            )}

            {route.params.transferStep ===
              Routes.TransferToUni_TEMPLATE_IS_SAVED && (
              <View style={styles.succesInner}>
                <Text style={styles.succesText}>
                  {translate.t('template.transfTemplateSuccess')}
                </Text>
                <Image
                  source={require('./../../../assets/images/succes_icon.png')}
                  style={styles.succesImg}
                />
              </View>
            )}
          </View>
          <AppButton
            isLoading={
              TransfersStore.fullScreenLoading ||
              TransfersStore.isLoading ||
              isLoading
            }
            onPress={onOperationHandle}
            title={
              route.params.transferStep === Routes.TransferToUni_SUCCES ||
              route.params.transferStep ===
                Routes.TransferToUni_TEMPLATE_IS_SAVED
                ? translate.t('common.close')
                : route.params.newTemplate
                ? translate.t('common.save')
                : translate.t('common.next')
            }
            style={styles.handleButton}
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
  withSucces: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default TransferToUni;

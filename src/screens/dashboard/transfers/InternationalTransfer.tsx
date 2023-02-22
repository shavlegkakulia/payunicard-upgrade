import React, {useEffect, useRef, useState} from 'react';
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
import currencies, {EUR, GEL, USD} from '../../../constants/currencies';
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
  ICitizenshipCountry,
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
import {TYPE_UNICARD, WALLET_TYPE} from '../../../constants/accountTypes';
import NavigationService from '../../../services/NavigationService';
import {tabHeight} from '../../../navigation/TabNav';
import Validation, {required} from '../../../components/UI/Validation';
import {subscriptionService} from '../../../services/subscriptionService';
import SUBSCRIBTION_KEYS from '../../../constants/subscribtionKeys';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import SmsRetriever from 'react-native-sms-retriever';
import {ka_ge} from '../../../lang';
import TransferServices, {
  IGetSwiftResponseDataItem,
} from '../../../services/TransferServices';
import AppSelect, {
  SelectItem,
} from '../../../components/UI/AppSelect/AppSelect';
import {debounce} from '../../../utils/utils';
import AppTransferTypeSelect, {TransferTypeSelect} from './../../../components/UI/TransferTypeSelect/TransferTypeSelect';
enum ETransferType {
  Guaranteed = 'Guaranteed',
  NonGuaranteed = 'Non-guaranteed'
}
interface ITransferType {
  value: string;
  title: any,
  desc: any
}
const transferTypes: Array<ITransferType> = [
  {
    value: ETransferType.Guaranteed,
    title: [{lang: 'ka', title: 'გარანტირებული'}, {lang: 'en', title: 'Guaranteed'}],
    desc: [{lang: 'ka', desc: 'გადარიცხვა გამგზავნის ხარჯით სრულდება, მიმღები სრულად მიიღებს თანხას.'}, {lang: 'en', desc: 'The transfer is carried out at the expense of the sender, the recipient will receive the amount in full.'}]
  },
  {
    value: ETransferType.NonGuaranteed,
    title: [{lang: 'ka', title: 'არაგარანტირებული'}, {lang: 'en', title: 'Non-guaranteed'}],
    desc: [{lang: 'ka', desc: 'საკომისიოს გადაიხდის გამგზავნიც და მიმღებიც, მიმღების საკომისიო ჩამოიჭრება გადარიცხული თანხიდან, საკომისიო დამოკიდებულია შუამავალი ბანკების ტარიფებზე.'}, {lang: 'en', desc: "The fee will be paid by both the sender and the recipient, the recipient's commission will be deducted from the transferred amount, the commission depends on the tariffs of intermediary banks."}]
  }
]

type RouteParamList = {
  params: {
    transferStep: string;
  };
};

const ValidationContext = 'internationalTransfer';

const InternationalTransfer: React.FC<INavigationProps> = props => {
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
  const [swiftErrorStyle, setSwiftErrorStyle] = useState<StyleProp<ViewStyle>>(
    {},
  );
  const [templateNameInputToggle, setTemplateNameInputToggle] = useState(false);
  const [maskedNumber, setMaskedNumber] = useState<string | undefined>();
  const [transferDetail, setTransferDetails] = useState<
    IGetPaymentDetailsResponseData | undefined
  >();
  const [currenciesFrom, setCurrenciesFrom] = useState<ICurrency[] | undefined>(
    undefined,
  );
  const [visible, setVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<ITransferType | null>(null);
  const [typeErrorStyle, setTypeErrorStyle] = useState<StyleProp<ViewStyle>>(
    {},
  );

  const [accounts, setAccounts] = useState<IAccountBallance[] | undefined>();

  const [{bankName, swiftCode}, setSwiftValues] = useState({
    bankName: '',
    swiftCode: '',
  });
  const [swiftDataFetching, setSwiftDataFetching] = useState(false);
  const [swiftData, setSwiftData] = useState<IGetSwiftResponseDataItem[]>();
  const [swiftItemsVisible, setSwiftItemsVisible] = useState(false);
  const [swiftItems2Visible, setSwiftItems2Visible] = useState(false);
  const [countryes, setCountries] = useState<
    ICitizenshipCountry[] | undefined
  >();
  const [isCountryLoading, setIsCountryLoading] = useState(false);
  const [countrySelectVisible, setCountrySelectVisible] = useState(false);
  const [codeErrorStyle, setCodeErrorStyle] = useState<StyleProp<ViewStyle>>(
    {},
  );

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

  const setSelectedSwiftItem = (data?: IGetSwiftResponseDataItem) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_RECIVER_SWIFT,
      reciverSwift: data,
    });
  };

  const setSelectedCountry = (data?: ICitizenshipCountry) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_RECIVER_COUNTRYCODE,
      reciverCountry: data,
    });
  };

  const setReciverCity = (data?: string) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_RECIVER_CITY,
      reciverCity: data,
    });
  };

  const setReciverAddress = (data?: string) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_RECIVER_ADDRESS,
      reciverAddress: data,
    });
  };

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

const MakeP2PForeignTransaction = (data: IP2PTransactionRequest) => {
  setIsLoading(true);
    TransactionService.makeP2PForeignTransaction(data).subscribe({
      next: Response => {
      dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_TRANSACTION_RESPONSE,
          transactionResponse: {...Response.data.data},
        });

        setIsLoading(true);
      },
      error: e => {
        setTimeout(() => {
          dispatch(PUSH(getString(e.data.errors?.[0]?.displayText)));
        }, 2000);
        setIsLoading(true);
      },
    });
  }

  const makeTransaction = () => {
    const data: IP2PTransactionRequest = {
      toAccountNumber: TransfersStore.benificarAccount,
      fromAccountNumber: TransfersStore.selectedFromAccount?.accountNumber,
      nomination: TransfersStore.nomination || translate.t('transfer.internationalTransfer'),
      ccy: TransfersStore.selectedToCurrency?.key,
      ccyto: TransfersStore.selectedToCurrency?.key,
      amount: getNumber(TransfersStore.amount),
      otp: otp,
      beneficiaryName: TransfersStore.benificarName,
      beneficiaryBankName: TransfersStore.reciverSwift?.bankName,
      beneficiaryBankCode: TransfersStore.reciverSwift?.swiftCode,
      recipientAddress: TransfersStore.reciverAddress,
      recipientCity: TransfersStore.reciverCity,
      beneficiaryRegistrationCountryCode:
        TransfersStore.reciverCountry?.countryCode,
        opClassCode: TransfersStore.selectedToCurrency?.key?.toLocaleUpperCase() === USD
        ? selectedType?.value === ETransferType.Guaranteed ? opClassCodes.internationalUsd : opClassCodes.internationalUsdNotGuaranteed
        : selectedType?.value === ETransferType.Guaranteed ? opClassCodes.internationalEur : opClassCodes.internationalEurNotGuaranteed,
    };

    MakeP2PForeignTransaction(data);
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
      ForOpClassCode:
        TransfersStore.selectedToCurrency?.key?.toLocaleUpperCase() === USD
          ? selectedType?.value === ETransferType.Guaranteed ? opClassCodes.internationalUsd : opClassCodes.internationalUsdNotGuaranteed
          : selectedType?.value === ETransferType.Guaranteed ? opClassCodes.internationalEur : opClassCodes.internationalEurNotGuaranteed,
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
    if (route.params.transferStep === Routes.Internatinal_set_otp) {
      SendPhoneOTP();
    }
  }, []);

  useEffect(() => {
    if (TransfersStore.amount && selectedType) {
      GetPaymentDetails();
    }
  }, [
    TransfersStore.amount,
    TransfersStore.selectedFromAccount,
    TransfersStore.selectedToCurrency,
    TransfersStore.transferType,
    selectedType
  ]);

  useEffect(() => {
    if (TransfersStore.transactionResponse) {
      setTransferStep(Routes.TransferToBank_SUCCES);
    }
  }, [TransfersStore.transactionResponse]);

  useEffect(() => {
    if (!TransfersStore.nomination?.trim()){
      setNomination(translate.t('transfer.internationalTransfer'));
    };
   
    setTransferType(TRANSFER_TYPES.international);
  }, []);

  useEffect(() => {
    if (userData.userAccounts && !userData.isAccountsLoading) {
      let uac = [
        ...(userData.userAccounts?.filter(
          acc => acc.type !== TYPE_UNICARD && acc.type !== WALLET_TYPE,
        ) || []),
      ];
      uac = uac.map(m => {
        m.currencies = [
          ...(m.currencies || []).filter(s => s.key === USD || s.key === EUR),
        ];
        return m;
      });
      setAccounts(uac);
    }
  }, [userData.isAccountsLoading]);

  const swiftSearchRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
   if(swiftSearchRef.current) clearTimeout(swiftSearchRef.current);
    swiftSearchRef.current = setTimeout(() => {
      setSwiftDataFetching(true);
      
      TransferServices.GetSwiftCategories(bankName, swiftCode).subscribe({
        next: Response => {
          if (Response.data.ok) {
            setSwiftData(Response.data.data?.categories);
          }
          setSwiftDataFetching(false)
        },
        error: error => {
          setSwiftDataFetching(false);
        },
      });
    }, 1000);
    
return () => {
  if(swiftSearchRef.current) clearTimeout(swiftSearchRef.current);
}
  }, [bankName, swiftCode]);

  const getCitizenshipCountries = () => {
    if (isCountryLoading) return;
    setIsCountryLoading(true);
    PresentationServive.GetCitizenshipCountries().subscribe({
      next: Response => {
        if (Response.data.ok) {
          setCountries([...(Response.data.data?.countries || [])]);
        }
      },
      complete: () => {
        setIsCountryLoading(false);
      },
      error: () => {
        setIsCountryLoading(false);
      },
    });
  };

  useEffect(() => {
    getCitizenshipCountries();
  }, []);

  const onOperationHandle = () => {
    setIsLoading(true);
    if (route.params.transferStep === Routes.Internatinal_choose_account) {
      if (!TransfersStore.selectedFromAccount) {
        setFromAccountErrorStyle({borderColor: colors.danger, borderWidth: 1});
        setIsLoading(false);
        return;
      } else {
        setFromAccountErrorStyle({borderColor: colors.none, borderWidth: 0});
      }

      if (Validation.validate(ValidationContext)) {
        setIsLoading(false);
        return;
      }

      if (!TransfersStore.reciverSwift) {
        setSwiftErrorStyle({borderColor: colors.danger, borderWidth: 1});
        setIsLoading(false);
        return;
      } else {
        setSwiftErrorStyle({borderColor: colors.none, borderWidth: 0});
      }

      if (!TransfersStore.reciverCountry) {
        setCodeErrorStyle({borderColor: colors.danger, borderWidth: 1});
        setIsLoading(false);
        return;
      } else {
        setCodeErrorStyle({borderColor: colors.none, borderWidth: 0});
      }



      setIsLoading(false);
      setTransferStep(Routes.Internatinal_set_currency);
    } else if (route.params.transferStep === Routes.Internatinal_set_currency) {
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
      if(!selectedType) {
        setTypeErrorStyle({borderColor: colors.danger, borderWidth: 1});
        setIsLoading(false);
        return;
      } else {
        setTypeErrorStyle({borderColor: colors.none, borderWidth: 0})
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

      setTransferStep(Routes.Internatinal_set_otp);
      setIsLoading(false);
      return;
    } else if (route.params.transferStep === Routes.Internatinal_set_otp) {
      if (otp) {
        makeTransaction();
      }
    } else if (route.params.transferStep === Routes.Internatinal_succes) {
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
    } catch (error) {}
  };

  useEffect(() => {
    onSmsListener();

    return () => SmsRetriever.removeSmsListener();
  }, []);

  useEffect(() => {
    let _acount = {...TransfersStore.selectedFromAccount};
    setCurrenciesFrom(_acount.currencies);
  }, [TransfersStore.selectedFromAccount]);

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
              Routes.Internatinal_choose_account ||
              route.params.transferStep ===
                Routes.Internatinal_set_currency) && (
              <View>
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
                      <Text style={styles.accountPlaceholder}>
                        {translate.t('common.selectAccount')}
                      </Text>
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
                  Routes.Internatinal_set_currency && (
                  <>
                    <View style={styles.accountBox}>
                      <Text style={styles.accountBoxTitle}>
                        {translate.t('transfer.to')}
                      </Text>

                      <AppInput
                        style={benificarAccountErrorStyle}
                        value={TransfersStore.benificarAccount}
                        onChange={e => {
                          if(!e || /^[a-z][a-z0-9]*$/i.test(e)) {
                            onToAccountSet(e);
                          }
                        }}
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

                <View style={[styles.accountBox]}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('transfer.reciverBankName')}
                  </Text>
                  {TransfersStore.reciverSwift?.bankName ? (
                    <SelectItem
                      itemKey="bankName"
                      defaultTitle={translate.t('transfer.reciverBankName')}
                      item={TransfersStore.reciverSwift}
                      onItemSelect={() => setSwiftItemsVisible(true)}
                      style={styles.Item}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setSwiftItemsVisible(true)}
                      style={[styles.itemSelectHandler, swiftErrorStyle]}>
                      <Text style={styles.itemPlaceholder}>
                        {translate.t('common.choose')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <AppSelect
                    itemKey="bankName"
                    elements={swiftData}
                    selectedItem={TransfersStore.reciverSwift}
                    itemVisible={swiftItemsVisible}
                    onSelect={item => {
                      setSelectedSwiftItem(item);
                      setSwiftItemsVisible(false);
                    }}
                    showSearchView={true}
                    searchValue={bankName}
                    onSearch={value =>
                      setSwiftValues({bankName: value, swiftCode: ''})
                    }
                    onToggle={() => {
                      setSwiftItemsVisible(!swiftItemsVisible);
                      setSwiftValues({bankName: '', swiftCode: ''});
                    }}
                    isDataLoading={swiftDataFetching}
                  />
                </View>

                <View style={[styles.accountBox]}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('transfer.reciverSwiftCode')}
                  </Text>
                  {TransfersStore.reciverSwift?.swiftCode ? (
                    <SelectItem
                      itemKey="swiftCode"
                      defaultTitle={translate.t('transfer.reciverBankName')}
                      item={TransfersStore.reciverSwift}
                      onItemSelect={() => setSwiftItems2Visible(true)}
                      style={styles.Item}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setSwiftItems2Visible(true)}
                      style={[styles.itemSelectHandler, swiftErrorStyle]}>
                      <Text style={styles.itemPlaceholder}>
                        {translate.t('common.choose')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <AppSelect
                    itemKey="swiftCode"
                    elements={swiftData}
                    selectedItem={TransfersStore.reciverSwift}
                    itemVisible={swiftItems2Visible}
                    onSelect={item => {
                      setSelectedSwiftItem(item);
                      setSwiftItems2Visible(false);
                    }}
                    showSearchView={true}
                    searchValue={swiftCode}
                    onSearch={value =>
                      setSwiftValues({bankName: '', swiftCode: value})
                    }
                    onToggle={() => {
                      setSwiftItems2Visible(!swiftItems2Visible);
                      setSwiftValues({bankName: '', swiftCode: ''});
                    }}
                    isDataLoading={swiftDataFetching}
                  />
                </View>

                {/* <View style={[styles.accountBox]}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('transfer.chooseTransferType')}
                  </Text>
                  {selectedType ? (
                    <TransferTypeSelect item={selectedType} isSelected={true} onItemSelect={() => setVisible(true)} langKey={translate.key} />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setVisible(true)}
                      style={[styles.itemSelectHandler, typeErrorStyle]}>
                      <Text style={styles.itemPlaceholder}>
                        {translate.t('common.choose')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <AppTransferTypeSelect elements={transferTypes} selectedItem={selectedType} itemVisible={visible} onSelect={item => { setSelectedType(item); setVisible(false)}} onToggle={
                    () => setVisible(!visible)
                  } />
                </View> */}

                <View style={[styles.accountBox]}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('transfer.reciverCountry')}
                  </Text>
                  {TransfersStore.reciverCountry?.countryName ? (
                    <SelectItem
                      itemKey="countryName"
                      defaultTitle={translate.t('common.choose')}
                      item={TransfersStore.reciverCountry}
                      onItemSelect={() => setCountrySelectVisible(true)}
                      style={styles.Item}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setCountrySelectVisible(true)}
                      style={[styles.itemSelectHandler, codeErrorStyle]}>
                      <Text style={styles.itemPlaceholder}>
                        {translate.t('common.choose')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <AppSelect
                    itemKey="countryName"
                    elements={countryes}
                    selectedItem={TransfersStore.reciverCountry}
                    itemVisible={countrySelectVisible}
                    onSelect={item => {
                      setSelectedCountry(item);
                      setCountrySelectVisible(false);
                    }}
                    onToggle={() =>
                      setCountrySelectVisible(!countrySelectVisible)
                    }
                  />
                </View>

                <View style={styles.accountBox}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('transfer.reciverCity')}
                  </Text>

                  <AppInput
                    style={benificarNameErrorStyle}
                    value={TransfersStore.reciverCity}
                    onChange={setReciverCity}
                    placeholder={translate.t('transfer.reciverCity')}
                    context={ValidationContext}
                    customKey="city"
                    requireds={[required]}
                  />
                </View>

                <View style={styles.accountBox}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('verification.address')}
                  </Text>

                  <AppInput
                    style={benificarNameErrorStyle}
                    value={TransfersStore.reciverAddress}
                    onChange={setReciverAddress}
                    placeholder={translate.t('verification.address')}
                    context={ValidationContext}
                    customKey="address"
                    requireds={[required]}
                  />
                </View>
              </View>
            )}
            {route.params.transferStep === Routes.Internatinal_set_currency && (
              <View>
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
                    {TransfersStore.selectedToCurrency ? (
                      <CurrencyItem
                        defaultTitle={translate.t('transfer.currency')}
                        currency={TransfersStore.selectedToCurrency}
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
                      {CurrencySimbolConverter(TransfersStore.selectedToCurrency?.key?.toLocaleUpperCase())}
                    </Text>
                  </View>
                )}

<View style={[styles.accountBox]}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('transfer.chooseTransferType')}
                  </Text>
                  {selectedType ? (
                    <TransferTypeSelect item={selectedType} isSelected={true} onItemSelect={() => setVisible(true)} langKey={translate.key} />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setVisible(true)}
                      style={[styles.itemSelectHandler, typeErrorStyle]}>
                      <Text style={styles.itemPlaceholder}>
                        {translate.t('common.choose')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <AppTransferTypeSelect elements={transferTypes} selectedItem={selectedType} itemVisible={visible} onSelect={item => { setSelectedType(item); setVisible(false)}} onToggle={
                    () => setVisible(!visible)
                  } />
                </View>

                <View style={styles.nominationBox}>
                  <Text style={styles.accountBoxTitle}>
                    {translate.t('transfer.nomination')}
                  </Text>
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

            {route.params.transferStep === Routes.Internatinal_set_otp && (
              <View style={styles.insertOtpSTep}>
                <Text style={styles.insertOtpCode}>
                  {translate.t('otp.enterOtp')}
                </Text>
                <FloatingLabelInput
                  Style={styles.otpBox}
                  label={translate.t('otp.smsCode')}
                  resendTitle={translate.t('otp.resend')}
                  title={`${translate.t('otp.otpSent')} ${getString(
                    maskedNumber,
                  )}`}
                  value={otp}
                  onChangeText={setOtp}
                  onRetry={SendPhoneOTP}
                />
              </View>
            )}

            {route.params.transferStep === Routes.Internatinal_succes && (
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
              route.params.transferStep === Routes.Internatinal_succes
                ? translate.t('common.close')
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
    paddingLeft: 15,
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
  Item: {
    backgroundColor: '#F6F6F4',
    borderRadius: 7,
    height: 60,
  },
  itemSelectHandler: {
    height: 60,
    backgroundColor: '#F6F6F4',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  itemPlaceholder: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
 
});

export default InternationalTransfer;

import React, {useEffect, useState} from 'react';
import {useRef} from 'react';
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
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AccountSelect, {
  AccountItem,
} from '../../../components/AccountSelect/AccountSelect';
import CurrencySelect from '../../../components/CurrencySelect/CurrencySelect';
import AppButton from '../../../components/UI/AppButton';
import AppInput from '../../../components/UI/AppInput';
import colors from '../../../constants/colors';
import {GEL, USD} from '../../../constants/currencies';
import {PUSH} from '../../../redux/actions/error_action';
import CurrencyService, {
  ICurrencyConverterAmountByDirRequest,
} from '../../../services/CurrencyService';
import TransactionService, {
  IP2PTransactionRequest,
} from '../../../services/TransactionService';
import {IAccountBallance, ICurrency} from '../../../services/UserService';
import {CurrencySimbolConverter, getNumber, getString} from '../../../utils/Converter';
import {INavigationProps, TRANSFER_TYPES} from '.';
import {
  ITransfersState,
  IGlobalState as ITRansferGlobalState,
  TRANSFERS_ACTION_TYPES,
} from '../../../redux/action_types/transfers_action_types';
import {
  INavigationState,
  IGlobalState as INAVGlobalState,
} from '../../../redux/action_types/navigation_action_types';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import {TYPE_UNICARD} from '../../../constants/accountTypes';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/core';
import Routes from '../../../navigation/routes';
import {tabHeight} from '../../../navigation/TabNav';
import NavigationService from '../../../services/NavigationService';
import { subscriptionService } from '../../../services/subscriptionService';
import SUBSCRIBTION_KEYS from '../../../constants/subscribtionKeys';
import { ITranslateState, IGlobalState as ITranslateGlobalState }  from '../../../redux/action_types/translate_action_types';

const ValidationContext = 'convertation';

type RouteParamList = {
  params: {
    transferStep: string;
  };
};

const TransferConvertation: React.FC<INavigationProps> = props => {
  const [fromAccountVisible, setFromAccountVisible] = useState(false);
  const [toAccountVisible, setToAccountVisible] = useState(false);
  const [fromCurrencyVisible, setFromCurrencyVisible] = useState(false);
  const [toCurrencyVisible, setToCurrencyVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [fromAccountErrorStyle, setFromAccountErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [toAccountErrorStyle, setToAccountErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [toCurrencyErrorStyle, setToCurrencyErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [amountErrorStyle, setAmountErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [amountToErrorStyle, setAmountToErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [nominationErrorStyle, setNominationErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [fromBaseAmount, setFromBaseAmount] = useState(true);
  const [amountTo, setAmountTo] = useState<string | undefined>();
  const [currencyRate, setCurrencyRate] = useState<number | undefined>();
  const [baseCcyFrom, setBaseCcyFrom] = useState<string | undefined>();
  const [baseCcyTo, setBaseCcyTo] = useState<string | undefined>();
  const [isToDefault, setIsToDefault] = useState<boolean | undefined>(
    undefined,
  );
  const [isSwitchProcessing, setIsSwitchProcessing] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<IAccountBallance[] | undefined>();
  const [baseCcyFromView, setBaseCcyFromView] = useState<string | undefined>();
  const [baseCcyToView, setBaseCcyToView] = useState<string | undefined>();
  const calculationTimeoutRef = useRef<NodeJS.Timeout>();
  const [currenciesFrom, setCurrenciesFrom] = useState<ICurrency[] | undefined>(
    undefined,
  );

  const [currenciesTo, setCurrenciesTo] = useState<ICurrency[] | undefined>(
    undefined,
  );
  const [fromAmount, setFromAmount] = useState<string | undefined>();
  const TransfersStore = useSelector<ITRansferGlobalState>(
    state => state.TransfersReducer,
  ) as ITransfersState;

  const navStore = useSelector<INAVGlobalState>(
    state => state.NavigationReducer,
  ) as INavigationState;

  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;

  const dispatch = useDispatch<any>();;

  useEffect(() => {
    if (userData.userAccounts && !userData.isAccountsLoading) {
      let uac = [...(userData.userAccounts || [])];
      uac = uac.filter(account => account.type !== TYPE_UNICARD);
      setAccounts(uac);
    }
  }, [userData.isAccountsLoading]);

  const setNomination = (nomination: string | undefined) => {
    dispatch({type: TRANSFERS_ACTION_TYPES.SET_NOMINATION, nomination});
  };

  const setAmount = (amount: string | undefined) => {
    setFromAmount(amount?.replace(',', '.'));
  };

  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();

  const setTransferStep = (step: string) => {
    const params = {
      ...route.params,
      transferStep: step,
    };
    navigation.navigate(`${step}`, params);
  };

  const setTransferType = (type: string | undefined) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_TRASNSFER_TYPE,
      transferType: type,
    });
  };

  /*********************/

  useEffect(() => {
    setBaseCcyFromView(TransfersStore.selectedFromCurrency?.value);
  }, [TransfersStore.selectedFromCurrency]);

  useEffect(() => {
    setBaseCcyToView(TransfersStore.selectedToCurrency?.value);
  }, [TransfersStore.selectedToCurrency]);

  const updateAmountTo = (amount: string) => {
    setIsToDefault(true);
    setFromBaseAmount(false);
    setAmountTo(amount.replace(',', '.'));
  };

  const updateAmountFrom = (amount: string) => {
    setIsToDefault(true);
    setFromBaseAmount(true);
    setAmount(amount.replace(',', '.'));
  };

  useEffect(() => {
    return () => {
      if (calculationTimeoutRef.current)
        clearTimeout(calculationTimeoutRef.current);
    };
  }, []);

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

  const onToAccountSelect = (account: IAccountBallance) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_TO_ACCOUNT,
      selectedToAccount: account,
    });
    setToAccountVisible(!toAccountVisible);
  };

  useEffect(() => {
    let _acount = {...TransfersStore.selectedToAccount};
    setCurrenciesTo(_acount.currencies);
  }, [TransfersStore.selectedToAccount]);

  const onFromCurrencySelect = (currency: ICurrency | undefined) => {
    if (TransfersStore.selectedFromCurrency) setFromBaseAmount(true);
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_CURRENCY,
      selectedFromCurrency: currency,
    });
    setFromCurrencyVisible(!fromCurrencyVisible);
  };

  const onToCurrencySelect = (currency: ICurrency | undefined) => {
    setFromBaseAmount(true);
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_TO_CURRENCY,
      selectedToCurrency: currency,
    });
    setToCurrencyVisible(!toCurrencyVisible);
  };

  const CurrencyConverterCalculatror = (_amount: string = '1') => {
    if (calculationTimeoutRef.current)
      clearTimeout(calculationTimeoutRef.current);
    const data: ICurrencyConverterAmountByDirRequest = {
      ccy: TransfersStore.selectedFromCurrency?.key,
      buyCcy: TransfersStore.selectedToCurrency?.key,
      fromBaseAmount: fromBaseAmount,
      amountFROM: isNaN(parseInt(_amount)) ? 0 : parseFloat(_amount),
    };

    calculationTimeoutRef.current = setTimeout(() => {
      setIsLoading(true);
      setIsToDefault(false);

      CurrencyService.CurrencyConverterCalculatror(data).subscribe({
        next: Response => {
          if (Response.data.ok) {
            let realrate = Response.data.data?.realrate;
            let ammount = Response.data.data?.amountTo;
            if (!isSwitchProcessing) {
              setBaseCcyFrom(Response.data.data?.ccY1);
              setBaseCcyTo(Response.data.data?.ccY2);
            } else {
              setIsSwitchProcessing(false);
            }

            setCurrencyRate(realrate);

            if (!fromAmount && !amountTo) {
              setAmount('');
              setAmountTo('');
              return;
            }

            if (fromBaseAmount) setAmountTo(ammount?.toString());
            else setAmount(ammount?.toString() || '0');
          }
        },
        complete: () => {
          setIsLoading(false);
        },
        error: () => {
          setIsLoading(false);
        },
      });
    }, 1000);
  };

  useEffect(() => {
    if (isToDefault) return;
    if (!TransfersStore.selectedFromCurrency) {
      let currency: ICurrency[] | undefined = currenciesFrom?.filter(
        cur => cur.key === GEL,
      );
      if (currency)
        //props.onCurrencyFromSelect && props.onCurrencyFromSelect(currency[0]);
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_CURRENCY,
          selectedFromCurrency: currency[0],
        });
    }

    if (!TransfersStore.selectedToCurrency) {
      let currency: ICurrency[] | undefined = currenciesFrom?.filter(
        cur => cur.key === USD,
      );
      if (currency)
        //props.onCurrencyToSelect(currency[0]);
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_SELECTED_TO_CURRENCY,
          selectedToCurrency: currency[0],
        });
    }

    if (
      TransfersStore.selectedFromCurrency &&
      TransfersStore.selectedToCurrency &&
      TransfersStore.selectedFromAccount &&
      TransfersStore.selectedToAccount
    ) {
      CurrencyConverterCalculatror(fromAmount);
    }
  }, [
    TransfersStore.selectedFromCurrency,
    TransfersStore.selectedToCurrency,
    currenciesFrom,
    currenciesTo,
    fromBaseAmount,
  ]);

  useEffect(() => {
    if (fromBaseAmount === true && isToDefault === true) {
      CurrencyConverterCalculatror(fromAmount);
      return;
    } else if (fromBaseAmount === false && isToDefault === true) {
      CurrencyConverterCalculatror(amountTo);
      return;
    }
  }, [isToDefault, amountTo, fromAmount]);

  useEffect(() => {
    if(!fromAmount) {
      setAmountTo('');
    }
  }, [fromAmount]);

  useEffect(() => {
    if (TransfersStore.transactionResponse) {
      setTransferStep(Routes.TransferConvertation_SUCCES);
    }
  }, [TransfersStore.transactionResponse]);

  useEffect(() => {
    if (!TransfersStore.fullScreenLoading) {
      setIsLoading(false);
    }
  }, [TransfersStore.fullScreenLoading]);

  useEffect(() => {
    if (!TransfersStore.nomination?.trim()){
      setNomination(translate.t('transfer.currencyExchange'));
    };
    setTransferType(TRANSFER_TYPES.toBank);
  }, []);

  const switchCurrency = () => {
    setIsSwitchProcessing(true);
    let temp = baseCcyFromView;
    setBaseCcyFromView(baseCcyToView);
    setBaseCcyToView(temp);
    let selectedFromCurrency = TransfersStore.selectedFromCurrency;
    // props.onCurrencyFromSelect &&
    //   props.onCurrencyFromSelect(TransfersStore.selectedToCurrency);
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_CURRENCY,
      selectedFromCurrency: TransfersStore.selectedToCurrency,
    });
    //props.onCurrencyToSelect(selectedFromCurrency);
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_TO_CURRENCY,
      selectedToCurrency: selectedFromCurrency,
    });
    setFromBaseAmount(true);
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
      nomination: TransfersStore.nomination || translate.t('transfer.currencyExchange'),
      description: TransfersStore.nomination || translate.t('transfer.currencyExchange'),
      ccy: TransfersStore.selectedFromCurrency?.key,
      ccyto: TransfersStore.selectedToCurrency?.key,
      amount: getNumber(fromAmount),
      otp: null,
    };

    MakeTransaction(toBank, data);
  };

  //cleare state on succes
  useEffect(() => {
    if (route.params.transferStep === Routes.TransferConvertation_SUCCES) {
      setAmount(undefined);
      dispatch({type: TRANSFERS_ACTION_TYPES.RESET_TRANSFER_STATES});
    }
  }, [route.params.transferStep]);

  const onOperationHandle = () => {
    if (route.params.transferStep === Routes.TransferConvertation_SUCCES) {
      subscriptionService.sendData(SUBSCRIBTION_KEYS.FETCH_USER_ACCOUNTS, true);
      NavigationService.navigate(Routes.Transfers);
    }
    setIsLoading(true);
    if (!TransfersStore.selectedFromAccount) {
      setFromAccountErrorStyle({borderColor: colors.danger, borderWidth: 1});
      setIsLoading(false);
      return;
    }

    if (!TransfersStore.selectedToAccount) {
      setToAccountErrorStyle({borderColor: colors.danger, borderWidth: 1});
      setIsLoading(false);
      return;
    }

    if (
      route.params.transferStep === Routes.TransferConvertation_CHOOSE_ACCOUNTS
    ) {
      setTransferStep(Routes.TransferConvertation_SET_CURRENCY);
      setIsLoading(false);
      return;
    } else if (
      route.params.transferStep === Routes.TransferConvertation_SET_CURRENCY
    ) {
      if (!TransfersStore.selectedToCurrency) {
        setToCurrencyErrorStyle({
          borderBottomColor: colors.danger,
          borderBottomWidth: 1,
        });
        setIsLoading(false);
        return;
      }

      if (!fromAmount || isNaN(parseInt(fromAmount))) {
        setAmountErrorStyle({
          borderBottomColor: colors.danger,
          borderBottomWidth: 1,
        });
        setIsLoading(false);
        return;
      }

      if (!amountTo || isNaN(parseInt(amountTo))) {
        setAmountToErrorStyle({
          borderBottomColor: colors.danger,
          borderBottomWidth: 1,
        });
        setIsLoading(false);
        return;
      }

      if (!TransfersStore.nomination) {
        setNominationErrorStyle({borderColor: colors.danger, borderWidth: 1});
        setIsLoading(false);
        return;
      }

      if (getNumber(fromAmount) < 1) {
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

      makeTransaction();
    }
  };
  const formtNumberForDigit = (num?: string) => {
    const pointIndex = num?.indexOf('.');
    if(pointIndex && pointIndex >= 0) {
      return num?.substring(0, pointIndex + 5);
    }
    return num;
  }
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
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
              route.params.transferStep === Routes.TransferConvertation_SUCCES &&
                styles.withSucces,
            ]}>
            {(route.params.transferStep ===
              Routes.TransferConvertation_CHOOSE_ACCOUNTS ||
              route.params.transferStep ===
                Routes.TransferConvertation_SET_CURRENCY) && (
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
                    notSelectable={TransfersStore.selectedToAccount}
                  />
                </View>

                <View style={styles.accountBox}>
                  <Text style={styles.accountBoxTitle}>{translate.t('transfer.to')}</Text>

                  {TransfersStore.selectedToAccount ? (
                    <AccountItem
                      account={TransfersStore.selectedToAccount}
                      onAccountSelect={() => setToAccountVisible(true)}
                      style={styles.accountItem}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setToAccountVisible(true)}
                      style={[
                        styles.accountSelectHandler,
                        toAccountErrorStyle,
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
                    selectedAccount={TransfersStore.selectedToAccount}
                    accountVisible={toAccountVisible}
                    onSelect={account => onToAccountSelect(account)}
                    onToggle={() => setToAccountVisible(!toAccountVisible)}
                    notSelectable={TransfersStore.selectedFromAccount}
                  />
                </View>
              </View>
            )}
            {route.params.transferStep ===
              Routes.TransferConvertation_SET_CURRENCY && (
              <View>
                <View style={styles.amountContainer}>
                  <View style={{flex: 1}}>
                    <TouchableOpacity
                      onPress={() => setFromCurrencyVisible(true)}
                      style={[
                        styles.currencySelectHandler,
                        styles.currencySelectHandlerLeft,
                        toCurrencyErrorStyle,
                      ]}>
                      <Image
                        source={require('./../../../assets/images/down-arrow.png')}
                      />
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginHorizontal: 10,
                          width: 30,
                          height: 30,
                          borderColor: colors.inputBackGround,
                          borderWidth: 1,
                          borderRadius: 15,
                        }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            marginRight: 3,
                            marginBottom: 2,
                          }}>
                          {' '}
                          {baseCcyFromView}
                        </Text>
                      </View>
                      <Text style={styles.currencyPlaceholder}>{translate.t('transfer.from')}</Text>
                    </TouchableOpacity>
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

                  <TouchableOpacity onPress={switchCurrency}>
                    <Image
                      style={{width: 40, height: 40}}
                      source={require('./../../../assets/images/ConvertationArrow.png')}
                    />
                  </TouchableOpacity>

                  <View style={{flex: 1, justifyContent: 'flex-end'}}>
                    <TouchableOpacity
                      onPress={() => setToCurrencyVisible(true)}
                      style={[
                        styles.currencySelectHandler,
                        toCurrencyErrorStyle,
                      ]}>
                      <Text style={styles.currencyPlaceholder}>{translate.t('transfer.to')}</Text>

                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginHorizontal: 10,
                          width: 30,
                          height: 30,
                          borderColor: colors.inputBackGround,
                          borderWidth: 1,
                          borderRadius: 15,
                        }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            marginRight: 3,
                            marginBottom: 2,
                          }}>
                          {' '}
                          {baseCcyToView}
                        </Text>
                      </View>
                      <Image
                        source={require('./../../../assets/images/down-arrow.png')}
                      />
                    </TouchableOpacity>
                    <CurrencySelect
                      currencies={currenciesTo}
                      selectedCurrency={TransfersStore.selectedToCurrency}
                      currencyVisible={toCurrencyVisible}
                      onSelect={currency => onToCurrencySelect(currency)}
                      onToggle={() => setToCurrencyVisible(!toCurrencyVisible)}
                    />
                  </View>
                </View>

                <View style={styles.amountContainer}>
                  <View style={[styles.amountBox, {flex: 1, marginRight: 20}]}>
                    <Text style={styles.accountBoxTitle}>{translate.t('transfer.toSell')}</Text>
                    <AppInput
                      customKey="fromAmount"
                      context={ValidationContext}
                      placeholder={translate.t('common.amount')}
                      value={fromAmount}
                      keyboardType="numeric"
                      style={amountErrorStyle}
                      onChange={updateAmountFrom}
                      selectTextOnFocus={true}
                    />
                  </View>

                  <View style={[styles.amountBox, {flex: 1, marginLeft: 20}]}>
                    <Text style={styles.accountBoxTitle}>{translate.t('transfer.toReceive')}</Text>
                    <AppInput
                      customKey="toAmount"
                      context={ValidationContext}
                      placeholder={translate.t('common.amount')}
                      value={amountTo}
                      keyboardType="numeric"
                      style={amountToErrorStyle}
                      onChange={updateAmountTo}
                      selectTextOnFocus={true}
                    />
                  </View>
                </View>

                <View style={{marginTop: 20}}>
                  <Text>
                  {translate.t('transfer.currencyRate')} : 1{CurrencySimbolConverter(baseCcyFrom, translate.key)} ={' '}
                    {/* {currencyRate?.toString()} */}
                    {formtNumberForDigit(currencyRate?.toString())}
                    {/* {currencyRate?.toString()?.match(/^-?\d+(?:\.\d{0,2})?/)?.[0]} */}
                    {CurrencySimbolConverter(baseCcyTo, translate.key)}
                  </Text>
                </View>

                <View style={styles.nominationBox}>
                  <Text style={styles.accountBoxTitle}>{translate.t('transfer.nomination')}</Text>
                  <AppInput
                    customKey="transfer"
                    context={ValidationContext}
                    placeholder= {translate.t('transfer.currencyExchange')}
                    value={TransfersStore.nomination}
                    style={nominationErrorStyle}
                    onChange={setNomination}
                  />
                </View>
              </View>
            )}

            {route.params.transferStep === Routes.TransferConvertation_SUCCES && (
              <View style={styles.succesInner}>
                <Text style={styles.succesText}>
                {translate.t('transfer.transactionSuccessfull')}
                </Text>
                <Image
                  source={require('./../../../assets/images/succes_icon.png')}
                  style={styles.succesImg}
                />
              </View>
            )}
          </View>
          
          <AppButton
            isLoading={TransfersStore.fullScreenLoading || isLoading}
            onPress={onOperationHandle}
            title={
              route.params.transferStep === Routes.TransferConvertation_SUCCES
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
  amountBox: {
    marginTop: 0,
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
  currencySelectHandlerLeft: {
    justifyContent: 'flex-start',
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
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    alignItems: 'center'
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

export default TransferConvertation;

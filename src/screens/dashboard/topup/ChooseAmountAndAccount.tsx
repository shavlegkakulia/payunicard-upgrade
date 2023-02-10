import {RouteProp, useRoute} from '@react-navigation/core';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {useDispatch, useSelector} from 'react-redux';
import AccountSelect, {
  AccountItem,
} from '../../../components/AccountSelect/AccountSelect';
import CurrencySelect, {
  CurrencyItem,
} from '../../../components/CurrencySelect/CurrencySelect';
import AppButton from '../../../components/UI/AppButton';
import AppInput from '../../../components/UI/AppInput';
import Validation, {
  hasNumeric,
  required,
} from '../../../components/UI/Validation';
import {TYPE_UNICARD} from '../../../constants/accountTypes';
import colors from '../../../constants/colors';
import currencies, {GEL} from '../../../constants/currencies';
import { ka_ge } from '../../../lang';
import Routes from '../../../navigation/routes';
import {tabHeight} from '../../../navigation/TabNav';
import {PUSH} from '../../../redux/actions/error_action';
import { ITranslateState, IGlobalState as ITranslateGlobalState } from '../../../redux/action_types/translate_action_types';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import NavigationService from '../../../services/NavigationService';
import TransactionService, {
  ITopUpTransactionRequest,
} from '../../../services/TransactionService';
import {
  IAccountBallance,
  IBankCard,
  ICurrency,
} from '../../../services/UserService';
import screenStyles from '../../../styles/screens';
import {CurrencyConverter, getNumber, getString} from '../../../utils/Converter';
import {parseUrlParamsegex} from '../../../utils/Regex';

type RouteParamList = {
  params: {
    card: IBankCard | undefined;
    currentAccount: IAccountBallance | undefined;
  };
};

const ValidationContext = 'Topup';

const ChooseAmountAndAccount: React.FC = () => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  const [amount, setAmount] = useState<string | undefined>();
  const [tranId, setTranId] = useState<string | null | undefined>();
  const [account, setAccount] = useState<IAccountBallance>();
  const [accounts, setAccounts] = useState<IAccountBallance[] | undefined>();
  const [accountVisible, setAccountVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEcommerce, setIsEcommerce] = useState<string>();
  const [accountErrorStyle, setAccountErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [toCurrencyVisible, setToCurrencyVisible] = useState(false);
  const [toCurrencyErrorStyle, setToCurrencyErrorStyle] = useState<
    StyleProp<ViewStyle>
  >({});
  const [selectedToCurrency, setSelectedToCurrency] = useState<
    ICurrency | undefined
  >();
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;
  const dispatch = useDispatch<any>();;
  const payBillTimeout = useRef<NodeJS.Timeout>();

  const onToCurrencySelect = (currency: ICurrency) => {
    setSelectedToCurrency(currency);
    setToCurrencyVisible(!toCurrencyVisible);
  };

  const onAccountSelect = (account: IAccountBallance) => {
    setAccount(account);
    setAccountVisible(false);
  };

  const GetPayBills = (op_id: number | undefined) => {
    TransactionService.GetPayBills(op_id).subscribe({
      next: Response => {
        if (Response.data.Ok) {
          if (
            Response.data.Data?.Status === 6 ||
            Response.data.Data?.Status === 50
          ) {
            const baseAccounts = [...(userData.userAccounts || [])];
            const accountIndex = baseAccounts?.findIndex(
              acc => acc.accountId === account?.accountId,
            );
            if (accountIndex && accountIndex >= 0) {
              baseAccounts[accountIndex].availableInGEL =
                getNumber(baseAccounts[accountIndex].availableInGEL) +
                getNumber(amount);
            }
            setIsLoading(false);
            NavigationService.navigate(Routes.TopupSucces);

            return true;
          } else if (
            Response.data.Data?.Status === 4 ||
            Response.data.Data?.Status === 5
          ) {
            payBillTimeout.current = setTimeout(() => {
              GetPayBills(op_id);
            }, 3000);
          } else {
            if (payBillTimeout.current) clearTimeout(payBillTimeout.current);
            dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
            setIsLoading(false);
            return;
          }
        } else {
          setIsLoading(false);
          if (payBillTimeout.current) clearTimeout(payBillTimeout.current);
          if (Response.data?.errors?.length)
            dispatch(PUSH(getString(Response.data?.errors[0]?.displayText)));
          return;
        }
      },
      error: err => {
        setIsLoading(false);
        dispatch(PUSH(getString(err)));
      },
    });
  };

  const CheckTransaction = () => {
    TransactionService.GetPayBills(undefined, tranId).subscribe({
      next: Response => {
        if (Response.data.Ok) {
          if (
            Response.data.Data?.Status === 6 ||
            Response.data.Data?.Status === 50 ||
            (Response.data.Data?.Status == 33 &&
              Response.data.Data?.forOpClassCode == 'B2B.Recurring')
          ) {
            const baseAccounts = [...(userData.userAccounts || [])];
            const accountIndex = baseAccounts?.findIndex(
              acc => acc.accountId === account?.accountId,
            );
            if (accountIndex && accountIndex >= 0) {
              baseAccounts[accountIndex].availableInGEL =
                getNumber(baseAccounts[accountIndex].availableInGEL) +
                getNumber(amount);
            }

            NavigationService.navigate(Routes.TopupSucces);

            return true;
          }
        } else {
          setIsLoading(false);
          dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
          return;
        }
      },
      complete: () => setIsLoading(false),
      error: err => {
        dispatch(PUSH(getString(err)));
        setIsLoading(false);
      },
    });
  };

  const next = () => {
    if (isLoading) return;

    if (Validation.validate(ValidationContext)) return;

    if (getNumber(amount) < 1) {
      dispatch(PUSH(`${translate.t('common.minTransfAmount')} 1 GEL`));
      return;
    }

    if (!account) {
      setAccountErrorStyle({borderColor: colors.danger, borderWidth: 1});
      return;
    }
    setIsLoading(true);
    let data: ITopUpTransactionRequest = {
      accountID: account.accountId,
      amounth: getNumber(amount),
    };

    if (route.params.card !== undefined) {
      data = {...data, isRecurring: true, bankCardId: route.params.card.cardId};
    }
    TransactionService.TopupTransaction(data).subscribe({
      next: Response => {
        if (Response.data.data?.isecommerce) {
          setIsEcommerce(Response.data.data.redirectUrl);
        } else {
          GetPayBills(Response.data.data?.op_id);
        }
      },
      error: err => {
        dispatch(PUSH(getString(err)));
        setIsLoading(false);
      },
    });
  };

  const _onNavigationStateChange = (webViewState: WebViewNavigation) => {
    let match: RegExpExecArray | null;
    while ((match = parseUrlParamsegex.exec(webViewState.url.toString()))) {
      let m = match[1];
      if (m.toString() === 'trans_id') {
        setTranId(decodeURI(match[2]));
      }
    }

    const retriveUrl = webViewState.url.toString().trim();

    if (retriveUrl.endsWith('Payment_Success')) {
      setIsEcommerce(undefined);
      CheckTransaction();
    } else if (retriveUrl.endsWith('Payment_Failure')) {
      setIsEcommerce(undefined);
      dispatch(PUSH(translate.t('generalErrors.errorOccurred')));
    }
  };

  useEffect(() => {
    if (userData.userAccounts?.length) {
      setAccounts(
        [...(userData.userAccounts || [])]?.filter(
          acc => acc.type !== TYPE_UNICARD,
        ),
      );
    }

    return () => {
      if (payBillTimeout.current) clearTimeout(payBillTimeout.current);
    };
  }, [userData.userAccounts]);

  useEffect(() => {
    if (route.params.currentAccount) {
      const accs = [...(accounts || [])];
      const index = accs?.findIndex(
        acc => acc.accountId === route.params.currentAccount?.accountId,
      );
      if (index >= 0) {
        onAccountSelect(accs[index]);
      }
    }
  }, [route.params.currentAccount, accounts]);

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
      <KeyboardAvoidingView behavior="padding" style={styles.avoid}>
        {isEcommerce?.length ? (
          <WebView
            source={{uri: isEcommerce}}
            onNavigationStateChange={_onNavigationStateChange.bind(this)}
            cacheEnabled={false}
            thirdPartyCookiesEnabled={true}
          />
        ) : (
          <View style={[screenStyles.wraper, styles.container]}>
            <View style={styles.content}>
              <View style={styles.amountColumn}>
              <Text style={styles.accountBoxTitle}>{translate.t('transfer.amount')}</Text>
                <AppInput
                  keyboardType="numeric"
                  value={amount}
                  onChange={amount => setAmount(amount.replace(',', '.'))}
                  context={ValidationContext}
                  customKey="amount"
                  placeholder={CurrencyConverter(0)}
                  requireds={[required, hasNumeric]}
                  style={styles.amountInput}
                />
              </View>

              <View style={styles.accountBox}>
                <Text style={styles.accountBoxTitle}>{translate.t('transfer.currency')}</Text>

                <CurrencyItem
                  defaultTitle={translate.t('transfer.currency')}
                  currency={_currency[0]}
                  onCurrencySelect={() => setToCurrencyVisible(true)}
                  style={styles.currencyBox}
                />
              </View>

              <View style={styles.accountBox}>
                <Text style={styles.accountBoxTitle}>
                  {translate.t('topUp.whichAccount')}
                </Text>

                {account ? (
                  <AccountItem
                    account={account}
                    onAccountSelect={() => setAccountVisible(true)}
                    style={styles.accountItem}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => setAccountVisible(true)}
                    style={[styles.accountSelectHandler, accountErrorStyle]}>
                    <Text style={styles.selectPlaceholder}>
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
                  selectedAccount={account}
                  accountVisible={accountVisible}
                  onSelect={account => onAccountSelect(account)}
                  onToggle={() => setAccountVisible(!accountVisible)}
                />
              </View>
            </View>
            <AppButton
              isLoading={isLoading}
              style={styles.button}
              title={translate.t('common.next')}
              onPress={next.bind(this)}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingBottom: tabHeight,
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  avoid: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  amountColumn: {
    marginTop: 35,
  },
  amountInput: {
    marginTop: 0,
  },
  accountBox: {
    marginTop: 25,
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
  },
  dropImg: {
    marginRight: 12,
  },
  selectPlaceholder: {
    fontFamily: 'FiraGO-Regular',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    marginLeft: 15,
  },
  currencyBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.inputBackGround,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingLeft: 20,
    paddingRight: 30,
    height: 54,
    borderRadius: 10,
  },
  currencyItem: {
    backgroundColor: colors.none,
    borderTopColor: colors.none,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderBottomColor: colors.none,
  },

  button: {
    marginVertical: 40,
  },
});

export default ChooseAmountAndAccount;

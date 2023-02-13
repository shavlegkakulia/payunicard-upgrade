import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import AppButton from '../../../components/UI/AppButton';
import AppInput, {InputTypes} from '../../../components/UI/AppInput';
import colors from '../../../constants/colors';
import {FetchUserProducts} from '../../../redux/actions/user_actions';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import NetworkService from '../../../services/NetworkService';
import screenStyles from '../../../styles/screens';
import DashboardLayout from '../../DashboardLayout';
import TransactionsList from './TransactionsList';
import ActionSheetCustom from './../../../components/actionSheet';
import AccountSelect from '../../../components/AccountSelect/AccountSelect';
import UserService, {
  IAccountBallance,
  ICurrency,
  IExportStatementsAsPdfMobileRequest,
  IFund,
  IGetUserAccountsStatementResponse,
  IGetUserBlockedBlockedFundslistRequest,
  IStatements,
  IUserAccountsStatementRequest,
} from '../../../services/UserService';
import DatePicker from 'react-native-date-picker';
import {
  CurrencyConverter,
  CurrencySimbolConverter,
  getNumber,
  getString,
} from '../../../utils/Converter';
import {GEL} from '../../../constants/currencies';
import {
  dateDiff,
  debounce,
  minusMonthFromDate,
} from '../../../utils/utils';
import CardService, {
  IGetUnicardStatementRequest,
  ITransaction,
} from '../../../services/CardService';
import {TYPE_UNICARD} from '../../../constants/accountTypes';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import PaginationDots from '../../../components/PaginationDots';
import CurrencySelect from '../../../components/CurrencySelect/CurrencySelect';
import Cover from '../../../components/Cover';
import RNFetchBlob from 'rn-fetch-blob';
import { EN, KA, ka_ge } from '../../../lang';

const filter_items = {
  selectedAccount: 'selectedAccount',
  selectedDate: 'selectedDate',
  selectedCurrency: 'selectedCurrency',
  amountFrom: 'amountFrom',
  amountTo: 'amountTo',
};

const Transactions: React.FC = () => {
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [stopFetching, setStopFetching] = useState(false);
  const [startBalance, setStartBalance] = useState<number | undefined>();
  const [endBalance, setEndBalance] = useState<number | undefined>();
  const [rowIndex, setRowIndex] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState<
    IAccountBallance | undefined
  >();
  const [selectedStartDate, setSelectedStartDate] = useState(
    minusMonthFromDate(),
  );
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [{startDateValue, endDateVlaue}, setDateValue] = useState({
    startDateValue: minusMonthFromDate(),
    endDateVlaue: new Date(),
  });
  const [unicardStatements, setUnicardStatements] = useState<
    ITransaction[] | undefined
  >();
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [fromVisible, setFromVisible] = useState(false);
  const [fromCurrencyVisible, setFromCurrencyVisible] = useState(false);
  const [toVisible, setToVisible] = useState(false);
  const [dateVisible, setDateVisible] = useState(false);
  const [accountVisible, setAccountVisible] = useState(false);
  const [isUnicardsLoading, setIsUnicardsLoading] = useState<boolean>(false);
  const [isFundsLoading, setIsFundsLoading] = useState<boolean>(false);
  const [useAccountStatements, setUseAccountStatements] = useState<
    IGetUserAccountsStatementResponse | undefined
  >();
  const [isStatementsLoading, setIsStatementsLoading] = useState<boolean>(true);
  const [funds, setFunds] = useState<IFund[] | undefined>();
  const scrollRef = useRef<ScrollView | null>(null);
  const [accountNumberList, setAccountNumberList] = useState<
    string | undefined
  >();
  const [amountFrom, setAmountFrom] = useState<string>();
  const [amountTo, setAmountTo] = useState<string>();
  const [offersStep, setOffersStep] = useState<number>(0);
  const [selectedFromCurrency, setSelectedFromCurrency] = useState<
    ICurrency | undefined
  >();
  const [currenciesFrom, setCurrenciesFrom] = useState<ICurrency[] | undefined>(
    undefined,
  );
  const [isAmountShown, setIsAmountShown] = useState<boolean>(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState<boolean>(false);
  const [monthCount, setMonthCount] = useState<number | undefined>(undefined);
  const dispatch = useDispatch<any>();;

  const onFromCurrencySelect = (currency: ICurrency) => {
    setSelectedFromCurrency(currency);
    setFromCurrencyVisible(!fromCurrencyVisible);
  };

  const rowCount = 20;

  const onSetStartDate = (date: Date) => {
    if (dateDiff(date, endDateVlaue) <= 0) return;
    setSelectedStartDate(date);
  };

  const onSetEndtDate = (date: Date) => {
   // if (dateDiff(startDateValue, date) <= 0) return;
    setSelectedEndDate(date);
    console.log(date)
  };

  const chooseAccounts = () => {
    setAccountVisible(true);
  };

  const setAccount = (account: IAccountBallance | undefined) => {
    setUseAccountStatements(undefined);
    setSelectedAccount(account);
    setAccountVisible(false);
  };

  const getUnicardStatement = () => {
    let data: IGetUnicardStatementRequest = {
      card: selectedAccount?.accountNumber,
    };
    if (selectedEndDate) {
      data = {...data, to: selectedEndDate.toLocaleDateString()};
    }
    if (selectedStartDate) {
      data = {...data, from: selectedStartDate.toLocaleDateString()};
    }
    setIsUnicardsLoading(true);
    CardService.GetUnicardStatement(data).subscribe({
      next: Response => {
        setUnicardStatements(Response.data.data?.transactions);
      },
      complete: () => {
        setIsUnicardsLoading(false);
        setFetchingMore(false);
      },
      error: () => {
        setIsUnicardsLoading(false);
        setFetchingMore(false);
      },
    });
  };

  const getStatements = (renew?: boolean, start?:Date) => {
  
    if (selectedAccount?.type === TYPE_UNICARD) {
      getUnicardStatement();
      return;
    }
    if (unicardStatements) setUnicardStatements(undefined);
    const starttimezone = selectedStartDate.toISOString().substring(selectedStartDate.toISOString().indexOf('T'))

    let data: IUserAccountsStatementRequest = {
      startDate: start || `${selectedStartDate.getFullYear()}-${('0' + (selectedStartDate.getMonth() + 1)).slice(-2)}-${('0' + selectedStartDate.getDate()).slice(-2)}${starttimezone}`,
      rowIndex: rowIndex,
      rowCount: rowCount,
    };
    const endtimezone = selectedEndDate.toISOString().substring(selectedEndDate.toISOString().indexOf('T'))

    if (selectedEndDate) {
      data = {...data, endDate: `${selectedEndDate.getFullYear()}-${('0' + (selectedEndDate.getMonth() + 1)).slice(-2)}-${('0' + selectedEndDate.getDate()).slice(-2)}${endtimezone}`};
    }
console.log('filter transaction request >> ', data);
    if (selectedAccount) {
      if (selectedFromCurrency) {
        data = {
          ...data,
          accountNumberList:
            selectedAccount?.accountNumber?.toString() +
            getString(selectedFromCurrency.key),
        };
      } else {
        let _accountNumberList: Array<string> = [];
        const accountNumber = selectedAccount?.accountNumber?.toString();
        selectedAccount.currencies?.forEach(c => {
          _accountNumberList.push(
            getString(accountNumber?.concat(getString(c.key))),
          );
        });

        data = {
          ...data,
          accountNumberList: _accountNumberList.join(','),
        };
      }
    } else {
      let _accountNumberList: Array<string> = [];
      if (selectedFromCurrency) {
        const currency = selectedFromCurrency?.key;
        userData.userAccounts?.forEach(a => {
          _accountNumberList.push(
            getString(a.accountNumber?.concat(getString(currency))),
          );
        });
      }
      data = {
        ...data,
        accountNumberList: _accountNumberList
          ? _accountNumberList.join(',')
          : null,
      };
    }

    if (amountFrom) {
      data = {...data, amountFrom: getNumber(amountFrom)};
    }

    if (amountTo) {
      data = {...data, amountTo: getNumber(amountTo)};

      if (!amountFrom) {
        data = {...data, amountFrom: 0};
      }
    }

    setIsStatementsLoading(true);
    UserService.GetUserAccountStatements(data).subscribe({
      next: Response => {
        if (Response.data.ok) {
          let _useAccountStatements: IGetUserAccountsStatementResponse = {};
          if (!stopFetching) {
            _useAccountStatements = {...useAccountStatements};
          }

          let _statements = [...(Response.data.data?.statements || [])];

          if (!stopFetching && !renew) {
            _statements = [
              ...(_useAccountStatements?.statements || []),
              ..._statements,
            ];
          }
          const UseAccountStatements = {
            statement_Ballances: Response.data.data?.statement_Ballances,
            statements: _statements,
          };
          if (
            getNumber(Response.data.data?.statements?.length) < rowCount ||
            getNumber(Response.data.data?.statements?.length) <= 0
          ) {
            setStopFetching(true);
          } else {
            setStopFetching(false);
          }
          setUseAccountStatements(UseAccountStatements);
        }
      },
      error: err => {
        setFetchingMore(false);
        setIsStatementsLoading(false);
      },
      complete: () => {
        setFetchingMore(false);
        setIsStatementsLoading(false);
      },
    });
  };

  const GetUserBlockedFunds = () => {
    setIsFundsLoading(true);
    let data: IGetUserBlockedBlockedFundslistRequest | undefined = {
      accountNumer: selectedAccount?.accountNumber,
    };
    if (!selectedAccount?.accountNumber) {
      data = undefined;
    }
    UserService.getUserBlockedFunds(data).subscribe({
      next: Response => {
        if (Response.data.ok) {
          setFunds(Response.data.data?.funds);
        }
      },
      complete: () => {
        setIsFundsLoading(false);
      },
      error: err => {
        setIsFundsLoading(false);
      },
    });
  };

  const removeFilter = (stateKey: string) => {
    switch (stateKey) {
      case filter_items.selectedAccount: {
        setSelectedAccount(undefined);
        break;
      }
      case filter_items.selectedDate: {
        setSelectedStartDate(minusMonthFromDate());
        setSelectedEndDate(new Date());
        setMonthCount(undefined);
        setDateValue(prev => {
          prev.startDateValue = minusMonthFromDate();
          prev.endDateVlaue = new Date();
          return prev;
        });
        getStatements(true, minusMonthFromDate());
        break;
      }
      case filter_items.selectedCurrency: {
        setSelectedFromCurrency(undefined);
        break;
      }
      case filter_items.amountFrom: {
        setAmountFrom(undefined);
        break;
      }
      case filter_items.amountTo: {
        setAmountTo(undefined);
        break;
      }
      case filter_items.selectedCurrency: {
        setSelectedFromCurrency(undefined);
        break;
      }
      default:
        break;
    }
    setUseAccountStatements(undefined);
    setStopFetching(false);
    setRowIndex(0);
  };

  const filterWithDates = () => {
    getStatements();
    closeSheet();
  };

  const getLast = (_monthCount: number) => {
    setMonthCount(_monthCount);
    setSelectedStartDate(minusMonthFromDate(_monthCount));
  };

  const FetchUserData = () => {
    NetworkService.CheckConnection(() => {
      dispatch(FetchUserProducts());
      getStatements();
      setStopFetching(false);
    });
  };

  const closeSheet = () => {
    setDateVisible(false);
    setFromVisible(false);
    setToVisible(false);
    removeFilter.bind(this, filter_items.selectedDate);
  };

  const onRefresh = () => {
    FetchUserData();
  };

  useEffect(() => {
    if (selectedAccount?.type !== TYPE_UNICARD) {
      GetUserBlockedFunds();
    }
  }, []);

  useEffect(() => {
    getStatements(true);
  }, [selectedAccount, selectedFromCurrency, amountFrom, amountTo]);

  useEffect(() => {
    getStatements();
  }, [rowIndex]);

  useEffect(() => {
    setStartBalance(useAccountStatements?.statement_Ballances?.startBallance);
    setEndBalance(useAccountStatements?.statement_Ballances?.endBallance);
  }, [useAccountStatements]);

  useEffect(() => {
    if (!currenciesFrom) {
      let lempCurrencyes: ICurrency[] | undefined = [];
      [...(userData.userAccounts || [])].map(acc => {
        lempCurrencyes = [...(lempCurrencyes || []), ...(acc.currencies || [])];
      });
      lempCurrencyes = lempCurrencyes.filter(
        (value, index, self) =>
          index ===
          self.findIndex(t => t.key === value.key && t.value === value.value),
      );
      setCurrenciesFrom(lempCurrencyes);
    }
  }, [userData.userAccounts]);

  const handleOffersScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    let overView =
      event.nativeEvent.contentOffset.x / (Dimensions.get('window').width - 30);
    setOffersStep(Math.round(overView));
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (stopFetching) return;
    const paddingToBottom = 20;
    const isChunk =
      event.nativeEvent.layoutMeasurement.height +
        event.nativeEvent.contentOffset.y >=
      event.nativeEvent.contentSize.height - paddingToBottom;

    if (isChunk && !fetchingMore) {
      setFetchingMore(true);
      setRowIndex(prev => {
        let rowIndex = prev + 1;
        return rowIndex;
      });
      scrollRef.current?.scrollTo({
        x: 0,
        y: event.nativeEvent.contentSize.height + paddingToBottom,
        animated: true,
      });
    }
  };

  const toggleAmountFilters = () => {
    setIsAmountShown(as => !as);

    if (isAmountShown) {
      setAmountFrom(undefined);
      setAmountTo(undefined);
    }
  };

  const downloadPdfFromPath = async (path: string, callback: () => void) => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ).then(() => {
      const {dirs} = RNFetchBlob.fs;
      const dirToSave =
        Platform.OS == 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const configfb = {
        addAndroidDownloads: {
          fileCache: true,
          useDownloadManager: true,
          notification: true,
          description: 'An Pdf file.',
          mediaScannable: true,
          title: 'Statements.pdf',
          path: `${dirToSave}/Statements.pdf`,
        },
      };
      const configOptions = Platform.select({
        ios: {
          fileCache: configfb.addAndroidDownloads.fileCache,
          title: configfb.addAndroidDownloads.title,
          path: configfb.addAndroidDownloads.path,
        },
        android: {...configfb},
      });
  
      RNFetchBlob.config({
        ...configOptions,
      })
        .fetch('GET', `${path}`, {
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
          responseType: 'blob',
        })
        .then(res => {
          if (Platform.OS === 'ios') {
            RNFetchBlob.fs.writeFile(
              configfb.addAndroidDownloads.path,
              res.data,
              'base64',
            );
            RNFetchBlob.ios.previewDocument(configfb.addAndroidDownloads.path);
          }
        }).finally(() => callback()).catch(() => callback());
    }).catch(() => {
      callback();
    });
  };

  const downloadTransactionDetails = () => {
    if (isPdfDownloading) return;

    const data: IExportStatementsAsPdfMobileRequest = {
      AccountNumber: selectedAccount?.accountNumber,
      StartDate: `${selectedStartDate.getFullYear()}-${
        selectedStartDate.getMonth() + 1
      }-${selectedStartDate.getDate()}`,
      EndDate: `${selectedEndDate.getFullYear()}-${
        selectedEndDate.getMonth() + 1
      }-${selectedEndDate.getDate()}`,
      Ccy: selectedFromCurrency?.key,
    };

    setIsPdfDownloading(true);
    UserService.ExportStatementsAsPdfMobile(data).subscribe({
      next: async Response => {
        if (Response.data.ok) {
          await downloadPdfFromPath(getString(Response.data.data?.path), () => setIsPdfDownloading(false));
        }
      },
      error: () => setIsPdfDownloading(false),
    });
  };

  const sheetHeight = Dimensions.get('window').height - 120;

  const isBaseDate =
    selectedStartDate.toDateString().toString() ===
      minusMonthFromDate().toDateString().toString() &&
    selectedEndDate.toDateString().toString() ===
      new Date().toDateString().toString();

  const filteredStatements: IStatements[] | undefined =
    useAccountStatements?.statements?.filter(statement =>
      statement.classCodeDescription?.includes(getString(searchValue)),
    );

  const filteredUnicardStatements: ITransaction[] | undefined =
    unicardStatements?.filter(statement =>
      statement.tranname?.includes(getString(searchValue)),
    );
console.log(isBaseDate, monthCount)
  const fromdt = useMemo(()=>{
    return <DatePicker
    date={startDateValue}
    maximumDate={new Date()}
    timeZoneOffsetInMinutes={-7 * 60}
    onDateChange={data => {
      setDateValue(prev => {
        //let startDateValue = new Date(data.toLocaleDateString());
        let endDateVlaue = prev.endDateVlaue;

        return {startDateValue: data, endDateVlaue};
      });
    }}
    style={styles.datePicker}
    locale={translate.key === ka_ge ? KA : EN}
    mode="date"
  />
  }, [startDateValue])
console.log('---', selectedEndDate)
  const todt = useMemo(() =>{
    return <DatePicker
    date={endDateVlaue}
    maximumDate={new Date()}
   // timeZoneOffsetInMinutes={-7 * 60}
    onDateChange={data => {
      console.log('***', data)
      setDateValue(prev => {
        let startDateValue = prev.startDateValue;
     //   let endDateVlaue = new Date(data.toLocaleDateString());

        return {startDateValue, endDateVlaue: data};
      });
    }}
    style={styles.datePicker}
    locale={translate.key === ka_ge ? KA : EN}
    mode="date"
  />
  }, [endDateVlaue])
console.log(filteredStatements)
  const BottomLoading = () =>
    fetchingMore ? (
      <View style={styles.bottomLoading}>
        <ActivityIndicator size="small" color={colors.black} />
      </View>
    ) : null;

  return (
    <DashboardLayout>
    <>
    <ScrollView
        style={screenStyles.screenContainer}
        onScroll={handleScroll}
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            progressBackgroundColor={colors.white}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }>
        <View style={[screenStyles.wraper, styles.titleContainer]}>
          <Text style={styles.title}>
            {translate.t('tabNavigation.transactions')}
          </Text>
        </View>

        <View style={[screenStyles.wraper, styles.searchInputBox]}>
          <AppInput
            customKey="search"
            context=""
            placeholder={translate.t('common.search')}
            type={InputTypes.search}
            value={searchValue}
            onChange={setSearchValue}
          />
        </View>
        <PaginationDots
          step={offersStep}
          length={2}
          style={styles.pagination}
        />
        <ScrollView
          onScroll={handleOffersScroll}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterActionsContent}>
          <View
            style={[
              {width: Dimensions.get('window').width - 30},
              styles.filterButtons,
            ]}>
            <AppButton
              title={translate.t('transfer.account')}
              onPress={chooseAccounts}
              backgroundColor={
                selectedAccount ? colors.primary : colors.inputBackGround
              }
              color={selectedAccount ? colors.white : colors.labelColor}
            />
            <View style={styles.currencyBox}>
              <AppButton
                title={translate.t('transfer.currency')}
                onPress={() => setFromCurrencyVisible(true)}
                backgroundColor={
                  selectedFromCurrency ? colors.primary : colors.inputBackGround
                }
                color={selectedFromCurrency ? colors.white : colors.labelColor}
              />

              <CurrencySelect
                currencies={currenciesFrom}
                selectedCurrency={selectedFromCurrency}
                currencyVisible={fromCurrencyVisible}
                onSelect={currency => onFromCurrencySelect(currency)}
                onToggle={() => setFromCurrencyVisible(!fromCurrencyVisible)}
              />
            </View>
            <AppButton
              title={translate.t('common.date')}
              onPress={() => setDateVisible(true)}
              backgroundColor={
                !isBaseDate ? colors.primary : colors.inputBackGround
              }
              color={!isBaseDate ? colors.white : colors.labelColor}
            />
          </View>
          <View
            style={[
              {width: Dimensions.get('window').width - 30},
              styles.filterButtons,
              styles.filterButtonsSecTwo,
            ]}>
            <AppButton
              title={translate.t('common.amount')}
              onPress={toggleAmountFilters}
              backgroundColor={
                isAmountShown ? colors.primary : colors.inputBackGround
              }
              color={isAmountShown ? colors.white : colors.labelColor}
            />
          </View>
        </ScrollView>

        {isAmountShown && (
          <View style={styles.amounts}>
            <AppInput
              onChange={setAmountFrom}
              value={amountFrom}
              customKey="from"
              context=""
              placeholder={translate.t('common.from')}
              style={[styles.amountInput, styles.amountFrom]}
            />
            <AppInput
              onChange={setAmountTo}
              value={amountTo}
              customKey="from"
              context=""
              placeholder={translate.t('common.to')}
              style={styles.amountInput}
            />
          </View>
        )}

        <AccountSelect
          accounts={userData.userAccounts}
          selectedAccount={selectedAccount}
          accountVisible={accountVisible}
          onSelect={account => setAccount(account)}
          onToggle={() => setAccountVisible(!accountVisible)}
        />

        <View style={[styles.filterValues, screenStyles.wraper]}>
          <View style={styles.activeFilterBox}>
            <Text style={styles.filterItem}>
              {translate.t('common.date')}:{' '}
              {('0' + (selectedStartDate.getMonth() + 1)).slice(-2)+'/'+('0' + selectedStartDate.getDate()).slice(-2)+'/'+selectedStartDate.getFullYear()}
 -{' '}
 {('0' + (selectedEndDate.getMonth() + 1)).slice(-2)+'/'+('0' + selectedEndDate.getDate()).slice(-2)+'/'+selectedEndDate.getFullYear()}

            </Text>
            {(!isBaseDate || monthCount) && (
              <TouchableOpacity
                style={styles.activeFilterRemove}
                onPress={removeFilter.bind(this, filter_items.selectedDate)}>
                <Image
                  source={require('./../../../assets/images/x-10x10-red.png')}
                />
              </TouchableOpacity>
            )}
          </View>
          {selectedAccount && (
            <View style={styles.activeFilterBox}>
              <Text style={styles.filterItem}>
                {translate.t('transfer.account')}:{' '}
                {selectedAccount?.accountNumber}
              </Text>
              <TouchableOpacity
                style={styles.activeFilterRemove}
                onPress={removeFilter.bind(this, filter_items.selectedAccount)}>
                <Image
                  source={require('./../../../assets/images/x-10x10-red.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {selectedFromCurrency && (
            <View style={styles.activeFilterBox}>
              <Text style={styles.filterItem}>
                {translate.t('transfer.currency')}: {selectedFromCurrency.key}
              </Text>
              <TouchableOpacity
                style={styles.activeFilterRemove}
                onPress={removeFilter.bind(
                  this,
                  filter_items.selectedCurrency,
                )}>
                <Image
                  source={require('./../../../assets/images/x-10x10-red.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {amountFrom !== undefined && (
            <View style={styles.activeFilterBox}>
              <Text style={styles.filterItem}>
                {' '}
                {translate.t('common.from')}: {amountFrom}
              </Text>
              <TouchableOpacity
                style={styles.activeFilterRemove}
                onPress={removeFilter.bind(this, filter_items.amountFrom)}>
                <Image
                  source={require('./../../../assets/images/x-10x10-red.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {amountTo !== undefined && (
            <View style={styles.activeFilterBox}>
              <Text style={styles.filterItem}>
                {translate.t('common.to')}: {amountTo}
              </Text>
              <TouchableOpacity
                style={styles.activeFilterRemove}
                onPress={removeFilter.bind(this, filter_items.amountTo)}>
                <Image
                  source={require('./../../../assets/images/x-10x10-red.png')}
                />
              </TouchableOpacity>
            </View>
          )}
          {!unicardStatements && (
            <>
              <Text style={styles.filterItem}>
                {translate.t('transfer.startBalance')}:{' '}
                {CurrencyConverter(startBalance)} {CurrencySimbolConverter(GEL, translate.key)}
              </Text>
              <Text style={styles.filterItem}>
                {translate.t('transfer.endBalance')}:{' '}
                {CurrencyConverter(endBalance)} {CurrencySimbolConverter(GEL, translate.key)}
              </Text>
            </>
          )}
        </View>
        <View style={styles.download}>
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={downloadTransactionDetails}>
            <Cover
              style={styles.downloadBg}
              imgStyle={styles.downIcon}
              localImage={require('./../../../assets/images/icon-download-primary.png')}
              isLoading={isPdfDownloading}
            />
          </TouchableOpacity>
        </View>

        <View style={screenStyles.wraper}>
          <TransactionsList
            statements={filteredStatements}
            unicards={filteredUnicardStatements}
            funds={funds}
            hideSeeMoreButton={true}
            isLoading={
              (isStatementsLoading && !fetchingMore) ||
              isUnicardsLoading ||
              isFundsLoading
            }
            containerStyle={[
              styles.transactionContainer,
              fetchingMore && {marginBottom: 10},
            ]}
          />
          {BottomLoading()}
        </View>
      </ScrollView>

      <ActionSheetCustom
        scrollable={true}
        hasDraggableIcon={true}
        visible={dateVisible}
        hasScroll={true}
        height={sheetHeight}
        onPress={closeSheet}>
        <View style={styles.topContainer}>
          <View>
            <Text style={styles.actionSheetTitle}>
              {translate.t('common.date')}
            </Text>

            <View style={styles.chooseDates}>
              <TouchableOpacity
                onPress={() => {
                  setFromVisible(true);
                  setToVisible(false);
                }}>
                <Text style={styles.dateTitle}>
                  {translate.t('transaction.startDate')}
                </Text>
                <Text style={styles.dateValue}>
                  {('0' + (selectedStartDate.getMonth() + 1)).slice(-2)+'/'+('0' + selectedStartDate.getDate()).slice(-2)+'/'+selectedStartDate.getFullYear()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setFromVisible(false);
                  setToVisible(true);
                }}>
                <Text style={styles.dateTitle}>
                  {translate.t('transaction.endDate')}
                </Text>
                <Text style={styles.dateValue}>
                  {('0' + (selectedEndDate.getMonth() + 1)).slice(-2)+'/'+('0' + selectedEndDate.getDate()).slice(-2)+'/'+selectedEndDate.getFullYear()}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <View style={styles.lastDatesContainer}>
                <TouchableOpacity
                  style={[styles.lastDate, monthCount === 1 && styles.activeLastDate]}
                  onPress={getLast.bind(this, 1)}>
                  <Text style={[styles.lastDateText, monthCount === 1 && styles.activeLastDateText]}>
                    {translate.t('transaction.lastMonth')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.lastDate, monthCount === 3 && styles.activeLastDate]}
                  onPress={getLast.bind(this, 3)}>
                  <Text style={[styles.lastDateText, monthCount === 3 && styles.activeLastDateText]}>
                    {translate.t('transaction.lastThreeMonths')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.lastDatesContainer}>
                <TouchableOpacity
                  style={[styles.lastDate, monthCount === 6 && styles.activeLastDate]}
                  onPress={getLast.bind(this, 6)}>
                  <Text style={[styles.lastDateText, monthCount === 6 && styles.activeLastDateText]}>
                    {translate.t('transaction.lastSixMonths')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.lastDate, monthCount === 12 && styles.activeLastDate]}
                  onPress={getLast.bind(this, 12)}>
                  <Text style={[styles.lastDateText, monthCount === 12 && styles.activeLastDateText]}>
                    {translate.t('transaction.lastYear')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {fromVisible && (
            <View style={[screenStyles.wraper, styles.datePickerContainer]}>
              <TouchableOpacity
                onPress={() => {
                  onSetStartDate(startDateValue);
                  setFromVisible(false);
                }}
                style={styles.datePickerAction}>
                <Text style={styles.startDatePickerActionTitle}>
                  {translate.t('common.choose')}
                </Text>
              </TouchableOpacity>

              {fromdt}
            </View>
          )}

          {toVisible && (
            <View style={[screenStyles.wraper, styles.datePickerContainer]}>
              <TouchableOpacity
                onPress={() => {
                  onSetEndtDate(endDateVlaue);
                  setToVisible(false);
                }}
                style={styles.datePickerAction}>
                <Text style={styles.endDatePickerActionTitle}>
                  {translate.t('common.choose')}
                </Text>
              </TouchableOpacity>

              {todt}
            </View>
          )}

          <View style={[screenStyles.wraper, styles.buttonContainer]}>
            <AppButton
              title={translate.t('common.showMe')}
              onPress={filterWithDates}
              style={styles.button}
              disabled={isBaseDate && !monthCount}
            />
          </View>
        </View>
      </ActionSheetCustom>
    </>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    marginTop: 30,
  },
  topContainer: {
    justifyContent: 'space-between',
    flex: 1,
  },
  transactionContainer: {
    marginBottom: 41,
    marginTop: 38,
  },
  title: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 16,
    lineHeight: 20,
    color: colors.black,
  },
  filterValues: {
    marginTop: 40,
    marginBottom: 20,
  },
  filterItem: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
    marginTop: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  filterButtonsSecTwo: {
    justifyContent: 'flex-start',
  },
  searchInputBox: {
    marginTop: 15,
  },
  actionSheetTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 18,
    lineHeight: 22,
    color: colors.black,
    alignSelf: 'center',
  },
  dateTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 10,
    lineHeight: 12,
    color: colors.labelColor,
    marginBottom: 5,
  },
  dateValue: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.primary,
  },
  chooseDates: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 52,
    marginBottom: 20,
  },
  datePicker: {
    alignSelf: 'center',
    marginTop: 30,
  },
  datePickerContainer: {
    marginTop: 35,
    backgroundColor: colors.white,
  },
  datePickerAction: {
    marginBottom: 10,
  },
  startDatePickerActionTitle: {
    alignSelf: 'flex-start',
    fontFamily: 'FiraGO-Medium',
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary,
  },
  endDatePickerActionTitle: {
    alignSelf: 'flex-end',
    fontFamily: 'FiraGO-Medium',
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary,
  },
  buttonContainer: {
    backgroundColor: colors.white,
    marginBottom: Platform.OS === 'ios' ? 40 : 0,
  },
  button: {
    marginVertical: 30,
    marginBottom: Platform.OS === 'ios' ? 30 : 0,
  },
  activeFilterBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeFilterRemove: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.baseBackgroundColor,
    height: 50,
  },
  lastDate: {
    backgroundColor: colors.inputBackGround,
    padding: 13,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 170,
  },
  activeLastDate: {
    backgroundColor: colors.primary,
  },
  lastDateText: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.labelColor,
  },
  activeLastDateText: {
    color: colors.white
  },
  lastDatesContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginTop: 30,
  },
  filterActionsContent: {
    paddingLeft: 10,
  },
  pagination: {
    alignSelf: 'flex-end',
    paddingRight: 20,
    marginTop: 30,
  },
  activeButton: {
    backgroundColor: colors.primary,
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
  amountInput: {
    width: 120,
  },
  amounts: {
    paddingLeft: 25,
    flexDirection: 'row',
    marginTop: 20,
  },
  amountFrom: {
    marginRight: 20,
  },
  download: {
    paddingLeft: 15,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  downloadBg: {
    backgroundColor: colors.inputBackGround,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  downIcon: {
    width: 14,
    height: 17,
  },
});

export default Transactions;

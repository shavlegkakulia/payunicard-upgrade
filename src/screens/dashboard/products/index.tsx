import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  View,
  Text,
  Image,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import NetworkService from '../../../services/NetworkService';
import screenStyles from '../../../styles/screens';
import DashboardLayout from '../../DashboardLayout';
import CurrentMoney from '../home/CurrentMoney';
import UserService, {
  IAccountBallance,
  ICancelPackageWEBRequest,
  ICurrency,
  IGetCardListWEBResponse,
  IGetUserBankCardsResponse,
} from '../../../services/UserService';
import {getNumber, getString} from '../../../utils/Converter';
import {CURRENCY_DETAILS} from '../../../constants/currencies';
import {TYPE_UNICARD} from '../../../constants/accountTypes';
import {FetchUserAccounts} from '../../../redux/actions/user_actions';
import NavigationService from '../../../services/NavigationService';
import {tabHeight} from '../../../navigation/TabNav';
import PaginationDots from '../../../components/PaginationDots';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import OrderedCard from './OrderedCard';
import AccountCard from './AccountCard';

export const PACKET_TYPE_IDS = {
  wallet: 1,
  upera: 2,
  uniPlus: 3,
  uniUltra: 4,
  unicard: TYPE_UNICARD,
};

const Products: React.FC = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const [refreshing, setRefreshing] = useState(false);
  const [orderedsLoading, setOrderedsLoading] = useState(false);
  const [addedCardsLoading, setAddedCardsLoading] = useState(true);
  const [orderedsStep, setOrderedsStep] = useState<number>(0);
  const [orderedCards, setOrderedCards] = useState<
    IGetCardListWEBResponse | undefined
  >();
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;
  const [activeAccounts, setActiveAccounts] = useState<
    IAccountBallance[] | undefined
  >();
  const [userBankCards, setUserBankCards] = useState<
    IGetUserBankCardsResponse | undefined
  >();
  const [BankCardScrollWIdth, setBankCardScrollWIdth] = useState<
    number | string | undefined
  >();
  const dispatch = useDispatch<any>();;
  const screenSize = Dimensions.get('window');

  const fetchAccounts = () => {
    NetworkService.CheckConnection(() => {
      dispatch(FetchUserAccounts());
    });
  };

  const AddBankCard = () => {
    NavigationService.navigate(Routes.addBankCard);
  };

  const handleOrderedsScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    let overView = event.nativeEvent.contentOffset.x / (screenSize.width - 25);
    setOrderedsStep(Math.round(overView));
  };

  const onScrollLayout = (event: any) => {
    const {width} = event.nativeEvent.layout;

    setBankCardScrollWIdth(width);
    setAddedCardsLoading(false);
  };

  const CancelPackageWEB = (GroupId: number, OrderingCardId: number) => {
    const data: ICancelPackageWEBRequest = {
      groupId: GroupId,
      orderingCardId: OrderingCardId,
    };
    setOrderedsLoading(true);
    UserService.CancelPackageWEB(data).subscribe({
      next: Response => {
        if (Response.data.ok) {
          GetOrderedCards();
        }
      },
      error: () => {
        setOrderedsLoading(false);
      },
    });
  };

  const GetOrderedCards = () => {
    setOrderedsLoading(true);
    UserService.getCardListWEB(
      getNumber(userData.userDetails?.customerID),
    ).subscribe({
      next: Response => {
        if (Response.data.ok) {
          let _orderedCards: IGetCardListWEBResponse = {
            cardStatuses: [...(Response.data.data?.cardStatuses || [])],
          };
          let tempOrder: any = [];
          _orderedCards?.cardStatuses?.forEach(card => {
            if (card.paketTypeId == 0) {
              card.paketTypeId = card.coPaketTypeId;
            }
            if (!card?.packagecode) {
              let filteredAcc = userData?.userAccounts?.filter(
                acc => acc.customerPaketId === card.paketTypeId,
              );
              if (filteredAcc?.length) {
                card.packagecode = filteredAcc[0].accountTypeName;
                card.accountNumber = filteredAcc[0].accountNumber;
              }
            }
            let element = tempOrder.find(
              (order: {groupId: number | undefined}) =>
                order.groupId === card.groupId,
            );
            if (!element) {
              tempOrder.push(card);
            }
          });
          _orderedCards.cardStatuses = tempOrder;
          setOrderedCards(_orderedCards);
        }
      },
      complete: () => setOrderedsLoading(false),
      error: () => setOrderedsLoading(false),
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    NetworkService.CheckConnection(
      () => {
        fetchAccounts();
      },
      () => {
        setRefreshing(false);
      },
    );
  };

  useEffect(() => {
    if (!userData.isAccountsLoading) {
      setRefreshing(false);
    }
  }, [userData.isAccountsLoading]);

  useEffect(() => {
    let userAccounts = [...(userData?.userAccounts || [])];
    // let activeCards = userAccounts.filter(account => {
    //   let Account = {...account};
    //   let cards = Account.cards?.filter(card => card.status === 1);
    //   account.cards = cards;
    //   return account;
    // });
     setActiveAccounts(userAccounts);

    let DetailCurrencies: ICurrency[] = [];
    userAccounts
      .filter(uc => uc.type != TYPE_UNICARD)
      .forEach(account => {
        account.currencies?.forEach(currency => {
          let isContaine =
            DetailCurrencies.filter(dc => dc.value === currency.value).length >
            0;
          if (!isContaine) {
            currency.title = getString(
              CURRENCY_DETAILS['ka'].filter(l => l.value == currency.key)[0]
                ?.title,
            );

            DetailCurrencies.push(currency);
          }
        });
      });
  }, [userData.userAccounts]);

  useEffect(() => {
    UserService.GetUserBankCards().subscribe({
      next: Response => {
        setUserBankCards(Response.data.data);
      },
      error: () => {},
    });
  }, []);

  useEffect(() => {
    if (userData.userDetails) {
      GetOrderedCards();
    }
  }, [userData.userDetails]);

  const addedCardWidth = getNumber(BankCardScrollWIdth) / 3;

  return (
    <DashboardLayout>
      <ScrollView
        style={screenStyles.screenContainer}
        contentContainerStyle={styles.avoid}
        refreshControl={
          <RefreshControl
            progressBackgroundColor={colors.white}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }>
        <View style={screenStyles.wraper}>
          <CurrentMoney />
        </View>
        <View style={screenStyles.wraperWithShadow}>
          <View
            style={[
              styles.productsViewContainer,
              screenStyles.shadowedCardbr15,
            ]}>
            <View style={styles.productsViewHeader}>
              <Text style={styles.productsViewTitle}>
                {translate.t('products.activeAccountCards')}
              </Text>
            </View>
            {userData.isAccountsLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={styles.loadingBox}
              />
            ) : (
              <>
                {activeAccounts?.map(account =>
                  getNumber(account.cards?.length) > 1 ? (
                    <View
                      style={styles.accountGroup}
                      key={account.accountNumber}>
                      <AccountCard account={account} inGroup />
                      <AccountCard
                        account={account}
                        goLayerUp
                        onDetailView={() =>
                          NavigationService.navigate(Routes.ProductDetail, {
                            account: account,
                          })
                        }
                      />
                    </View>
                  ) : (
                    <AccountCard
                      key={account.accountNumber}
                      account={account}
                      onDetailView={() =>
                        NavigationService.navigate(Routes.ProductDetail, {
                          account: account,
                        })
                      }
                    />
                  ),
                )}
              </>
            )}
          </View>
        </View>

        <View style={screenStyles.wraperWithShadow}>
          <View
            style={[styles.addedCardsContainer, screenStyles.shadowedCardbr15]}>
            <View style={styles.productsViewHeader}>
              <Text style={styles.productsViewTitle}>
                {translate.t('products.linkedCards')}
              </Text>
            </View>
            <ScrollView
              style={styles.addedCadsContainer}
              onLayout={event => onScrollLayout(event)}
              showsHorizontalScrollIndicator={false}
              horizontal={true}>
              {!addedCardsLoading && (
                <>
                  <View style={[styles.addedCardBox, {width: addedCardWidth}]}>
                    <View style={[styles.addedCard, styles.addedCard3]}>
                      <TouchableOpacity
                        style={styles.addCardPressable}
                        onPress={AddBankCard.bind(this)}>
                        <Image
                          source={require('./../../../assets/images/plus_noBG.png')}
                          resizeMode="contain"
                          style={styles.addedCardIcon}
                        />
                        <Text style={styles.addedCardText}>
                          {translate.t('plusSign.addCard')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {userBankCards?.bankCards?.map(bankCard => (
                    <View
                      key={bankCard.cardId}
                      style={[styles.addedCardBox, {width: addedCardWidth}]}>
                      <View
                        style={[styles.addedCard, styles.addedCard1]}
                        key={bankCard.cardId}>
                        <TouchableOpacity style={styles.addCardPressable}>
                          <Image
                            source={
                              bankCard.cardType === PACKET_TYPE_IDS.uniUltra
                                ? require('./../../../assets/images/visa_big.png')
                                : require('./../../../assets/images/mastercard_big.png')
                            }
                            resizeMode="contain"
                            style={styles.addedCardIcon}
                          />
                          <Text style={styles.addedCardText}>
                            {bankCard.cardNumber}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>

        {getNumber(orderedCards?.cardStatuses?.length) > 0 && !orderedsLoading && (
          <View style={styles.orderedContainer}>
            <View style={styles.orderedContainerHeader}>
              <Text style={styles.offersContainerTitle}>
                {translate.t('products.orderedCards')}
              </Text>
              {getNumber(orderedCards?.cardStatuses?.length) > 1 && (
                <PaginationDots
                  step={orderedsStep}
                  length={orderedCards?.cardStatuses?.length}
                />
              )}
            </View>

            <ScrollView
              onScroll={handleOrderedsScroll}
              contentContainerStyle={[
                styles.orderedContainerScrollable,
                orderedCards?.cardStatuses?.length === 1 && {width: '100%'},
              ]}
              showsHorizontalScrollIndicator={false}
              horizontal={true}>
              {orderedsLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.loadingBox}
                />
              ) : (
                orderedCards?.cardStatuses?.map((card, index) => (
                  <OrderedCard
                    key={index}
                    card={card}
                    onCancelPackageWEB={CancelPackageWEB}
                    width={
                      orderedCards?.cardStatuses?.length === 1
                        ? '100%'
                        : BankCardScrollWIdth
                    }
                  />
                ))
              )}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  avoid: {
    paddingBottom: tabHeight,
  },
  productsViewContainer: {
    marginTop: 36,
    padding: 17,
    backgroundColor: colors.white,
  },
  addedCardsContainer: {
    marginTop: 20,
    paddingVertical: 17,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  productsViewHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsViewTitle: {
    fontFamily: 'FiraGO-Bold',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    marginLeft: 5,
  },
  accountGroup: {
    position: 'relative',
  },
  addedCadsContainer: {
    flexDirection: 'row',
  },
  addedCardBox: {
    width: '33.3333333333%',
    paddingHorizontal: 5,
  },
  addedCard: {
    borderColor: colors.cardBorderColor,
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    minHeight: 80,
  },
  addedCard1: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  addedCard3: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardPressable: {
    alignItems: 'center',
  },
  addedCardIcon: {
    height: 20,
  },
  addedCardText: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 12,
    lineHeight: 14,
    marginTop: 4,
    color: colors.labelColor,
  },
  loadingBox: {
    alignSelf: 'center',
    flex: 1,
    marginTop: 10,
  },
  orderedContainer: {
    flex: 1,
    marginTop: 20,
    marginBottom: tabHeight,
  },
  orderedContainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 18,
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  orderedContainerScrollable: {
    paddingRight: 30,
  },
  offersContainerTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
});

export default Products;

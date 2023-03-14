import React, { createRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView as ReactScroll,
  TouchableOpacity,
  Image,
  Text,
  NativeScrollEvent,
  ImageSourcePropType,
  Dimensions,
  ActivityIndicator,
  Platform,
  Switch,
  Keyboard,
  Button,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../../../constants/colors';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import screenStyles from '../../../styles/screens';
import DashboardLayout from '../../DashboardLayout';
import TransactionsList from '../transactions/TransactionsList';
import {
  RouteProp,
  useNavigationState,
  useRoute,
} from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import UserService, {
  IAccountBallance,
  IChangeConditionRisklevelUFCRequest,
  IFund,
  IGetUserAccountsStatementResponse,
  IGetUserBlockedBlockedFundslistRequest,
  IUserAccountsStatementRequest,
} from '../../../services/UserService';
import PaginationDots from '../../../components/PaginationDots';
import { getNumber, getString } from '../../../utils/Converter';
import { TYPE_UNICARD } from '../../../constants/accountTypes';
import NetworkService from '../../../services/NetworkService';
import {
  FetchUserAccounts,
  FetchUserAccountStatements,
} from '../../../redux/actions/user_actions';
import envs from '../../../../config/env';
import ActionSheetCustom from './../../../components/actionSheet';
import AppButton from '../../../components/UI/AppButton';
import AccountService from '../../../services/AccountService';
import FullScreenLoader from '../../../components/FullScreenLoading';
import FloatingLabelInput from '../../../containers/otp/Otp';
import OTPService, {
  GeneratePhoneOtpByUserRequest,
} from '../../../services/OTPService';
import { NAVIGATION_ACTIONS } from '../../../redux/action_types/navigation_action_types';
import Routes from '../../../navigation/routes';
import { TRANSFERS_ACTION_TYPES } from '../../../redux/action_types/transfers_action_types';
import {
  IGlobalPaymentState,
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../../../redux/action_types/payments_action_type';
import {
  ICategory,
  IMerchantServicesForTemplateRequest,
  IService,
} from '../../../services/PresentationServive';
import {
  getPayCategoriesServices,
  GetPaymentDetails,
} from '../../../redux/actions/payments_actions';
import PresentationService from './../../../services/PresentationServive';
import CardService, { IGetBarcodeRequest, IGetUnicardStatementRequest, ITransaction, IGetCardDetailsResponse } from '../../../services/CardService';
import NavigationService from '../../../services/NavigationService';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import AccountCard from './AccountCard';
import userStatuses from '../../../constants/userStatuses';
import { tabHeight } from '../../../navigation/TabNav';
import SmsRetriever from 'react-native-sms-retriever';
import { EUR, USD } from '../../../constants/currencies';
import OtpModal from '../../../components/OtpModal';
import AuthService from '../../../services/AuthService';
import {
  AddCardToWallet,
  parseWalletResponse,

} from '../../../navigation/AppleWallet/AppleWallet';
import { SvgXml } from 'react-native-svg';
import { icon_apple_pay, icon_visa_card } from '../../../constants/svgXmls';
import { IAuthState, IGlobalState as IAuthGlobalState } from '../../../redux/action_types/auth_action_types';
import WebView from 'react-native-webview';
import {IErrorAction, PUSH_ERROR} from '../../../redux/action_types/error_action_types';
import {otp_not_valid} from '../../../constants/errorCodes';
import Store from '../../../redux/store';


type RouteParamList = {
  Account: {
    account: IAccountBallance;
  };
};

enum blockTypes {
  active = 1,
  blocked = 2,
  blockedByBank = 3,
}

const PACKET_TYPE_IDS = {
  wallet: 1,
  upera: 2,
  uniPlus: 3,
  uniUltra: 4,
  unicard: TYPE_UNICARD,
};

const CARD_ACTIONS = {
  card_block: 1,
  change_pin: 2,
  account_totpup: 3,
};

const ACTION_SHEET_STATUSES = {
  start: 0,
  error: 1,
  succes: 2,
  otp: 3,
};

interface IActionSheetTypes {
  actionSheetTitle?: string;
  actionSheetStatus?: number | undefined;
  actionSheetType?: number | undefined;
}

const ProductDetail: React.FC = props => {
  const translate = useSelector<ITranslateGlobalState>(state => state.TranslateReduser) as ITranslateState;
  const userData = useSelector<IUserGlobalState>(state => state.UserReducer) as IUserState;
  const PaymentStore = useSelector<IGlobalPaymentState>(state => state.PaymentsReducer) as IPaymentState;
  const routes = useNavigationState(state => state.routes);
  const dispatch = useDispatch<any>();;
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [transferSectionStep, setTransferSectionStep] = useState<number>(0);
  const [paymentSectionStep, setPaymentSectionStep] = useState<number>(0);
  const [cardSectionStep, setCardSectionStep] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>();
  const [maskedPhoneNumber, setMaskedNumber] = useState<string>();
  const [categories, setCategories] = useState<ICategory[]>();
  const [{ actionSheetTitle, actionSheetStatus, actionSheetType }, setActionSheetStep] = useState<IActionSheetTypes>({
    actionSheetTitle: '',
    actionSheetStatus: ACTION_SHEET_STATUSES.start,
    actionSheetType: undefined,
  });
  const [barcode, setBarcode] = useState<string>();
  const [isBarCodeLoading, setIsBarCodeLoading] = useState<boolean>(true);
  const route = useRoute<RouteProp<RouteParamList, 'Account'>>();
  const carouselRef = createRef<ScrollView>();
  const [isFundsLoading, setIsFundsLoading] = useState<boolean>(false);
  const [funds, setFunds] = useState<IFund[] | undefined>();
  const [selectedFromAccount, setSelectedFromAccount] = useState<IAccountBallance | undefined>(undefined);
  const [hrmRiskLevels, setHrmRiskLevels] = useState<{
    a1: boolean;
    a2: boolean;
  }>({ a1: false, a2: false });
  const [isHrmProcessing, setIsHrmProcessing] = useState<boolean>(false);
  const [isDigitalCardProcessing, setIsDigitalCardProcessing] = useState<boolean>(false);
  const [showCardDetailsModal, setShowCardDetailsModal] = useState<boolean>(false);
  const [dcData, setDcData] = useState<IGetCardDetailsResponse["data"]>({ encryptedCard: '', uuId: '' })
  const { documentVerificationStatusCode, customerVerificationStatusCode } = userData.userDetails || {};
  const authData = useSelector<IAuthGlobalState>(state => state.AuthReducer) as IAuthState;
  const [hasAccountUsdOrEur, setHasAccountUsdOrEur] = useState<boolean>(false);
  const isUserVerified = documentVerificationStatusCode === userStatuses.Enum_Verified && customerVerificationStatusCode === userStatuses.Enum_Verified;
  const [userAccount, setUserAccount] = useState<IAccountBallance>(route.params.account);
  const [unicardStatements, setUnicardStatements] = useState<ITransaction[] | undefined>();
  const [useAccountStatements, setUseAccountStatements] = useState<IGetUserAccountsStatementResponse | undefined>();
  const [isCurrentStatementsLoading, setIsCurrentStatementsLoading] = useState(true);
  const [openOtpModal, setOpenOtpModal] = useState<boolean>(false);
  const [otpLoader, setOtpLoader] = useState<boolean>(true);

  const [_envs, setEnvs] = useState<{
    API_URL?: string;
    CONNECT_URL?: string;
    TOKEN_TTL?: number;
    CDN_PATH?: string;
    client_id?: string;
    client_secret?: string;
    googleSiteDomain?: string;
    googleSiteKey?: string;
}>({});

  useEffect(() => {
    envs().then(res => {
      setEnvs(res);
    })
  }, []);

  const onSetOtp = (value: string) => {
    setOtp(value);
    if (otp?.length === 4) {
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    if (selectedFromAccount) {
      let uac = selectedFromAccount?.currencies?.filter(
        s => s.key === USD || s.key === EUR,
      );
      if (uac?.length) {
        setHasAccountUsdOrEur(true);
      }
    }
  }, [selectedFromAccount]);

  useEffect(() => {
    if (route.params?.account) {
      setUserAccount(route.params?.account);
    }
  }, [route.params.account]);

  const GenerateBarcode = (accountNumber: string) => {
    const data: IGetBarcodeRequest = {
      input: accountNumber,
    };
    CardService.GenerateBarcode(data).subscribe({
      next: Response => {
        setBarcode(getString(Response.data.data?.barcode));
      },
      complete: () => setIsBarCodeLoading(false),
      error: () => {
        setIsBarCodeLoading(false);
      },
    });
  };

  const fetchAccounts = () => {
    NetworkService.CheckConnection(() => {
      dispatch(FetchUserAccounts());
    });
  };

  const fetchAccountStatements = () => {
    NetworkService.CheckConnection(() => {
      dispatch(FetchUserAccountStatements({ accountID: userAccount?.accountId }));
    });
  };

  const onFetchData = () => {
    fetchAccounts();
  };

  const transferBetweenAccounts = () => {
    if (!isUserVerified) return;
    const currentRoute = routes[routes.length - 1].name;
    dispatch({
      type: NAVIGATION_ACTIONS.SET_PARENT_ROUTE,
      parentRoute: currentRoute,
    });
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_ACCOUNT,
      selectedFromAccount: selectedFromAccount,
    });
    NavigationService?.navigate(
      Routes.TransferBetweenAcctounts_CHOOSE_ACCOUNTS,
      {
        transferStep: Routes.TransferBetweenAcctounts_CHOOSE_ACCOUNTS,
      },
    );
  };

  const transferToBank = () => {
    if (!isUserVerified) return;
    const currentRoute = routes[routes.length - 1].name;
    dispatch({
      type: NAVIGATION_ACTIONS.SET_PARENT_ROUTE,
      parentRoute: currentRoute,
    });
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_ACCOUNT,
      selectedFromAccount: selectedFromAccount,
    });
    NavigationService?.navigate(Routes.TransferToBank_CHOOSE_ACCOUNTS, {
      transferStep: Routes.TransferToBank_CHOOSE_ACCOUNTS,
    });
  };

  const transferToUni = () => {
    if (!isUserVerified) return;
    const currentRoute = routes[routes.length - 1].name;
    dispatch({
      type: NAVIGATION_ACTIONS.SET_PARENT_ROUTE,
      parentRoute: currentRoute,
    });
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_ACCOUNT,
      selectedFromAccount: selectedFromAccount,
    });
    NavigationService?.navigate(Routes.TransferToUni_CHOOSE_ACCOUNTS, {
      transferStep: Routes.TransferToUni_CHOOSE_ACCOUNTS,
    });
  };

  const transferConvertation = () => {
    if (!isUserVerified) return;
    const currentRoute = routes[routes.length - 1].name;
    dispatch({
      type: NAVIGATION_ACTIONS.SET_PARENT_ROUTE,
      parentRoute: currentRoute,
    });
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_ACCOUNT,
      selectedFromAccount: selectedFromAccount,
    });
    NavigationService?.navigate(Routes.TransferConvertation_CHOOSE_ACCOUNTS, {
      transferStep: Routes.TransferConvertation_CHOOSE_ACCOUNTS,
    });
  };

  const internationalTransfer = () => {
    if (!isUserVerified || !hasAccountUsdOrEur) return;
    const currentRoute = routes[routes.length - 1].name;
    dispatch({
      type: NAVIGATION_ACTIONS.SET_PARENT_ROUTE,
      parentRoute: currentRoute,
    });
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_ACCOUNT,
      selectedFromAccount: selectedFromAccount,
    });
    NavigationService?.navigate(Routes.Internatinal_choose_account, {
      transferStep: Routes.Internatinal_choose_account,
    });
  };

  const breackWords = (text: string | undefined) => {
    const words = text ? text.split(' ') : [];
    return (
      <View>
        {words.map((word, index) => (
          <Text
            key={index}
            style={styles.sectionContainerItemDetailsTitle}
            numberOfLines={2}>
            {word}
          </Text>
        ))}
      </View>
    );
  };

  const onChangeCardIndex = (nativeEvent: NativeScrollEvent) => {
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
      );
      if (slide != currentCardIndex) {
        //if(slide === 3) return;
        setCurrentCardIndex(slide);
      }
    }
  };

  const onChangeTransferSectionStep = (nativeEvent: NativeScrollEvent) => {
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
      );
      if (slide != transferSectionStep) {
        //if(slide === 3) return;
        setTransferSectionStep(slide);
      }
    }
  };

  const onChangePaymentSectionStep = (nativeEvent: NativeScrollEvent) => {
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
      );
      if (slide != paymentSectionStep) {
        //if(slide === 3) return;
        setPaymentSectionStep(slide);
      }
    }
  };

  const onChangeCardActionSectionStep = (nativeEvent: NativeScrollEvent) => {
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
      );
      if (slide != cardSectionStep) {
        //if(slide === 3) return;
        setCardSectionStep(slide);
      }
    }
  };


  const getCardLogo = (type: number): ImageSourcePropType => {
    let ccyLogo = require('./../../../assets/images/accountCardsTypeIcon.png');
    if (type == 1) {
      ccyLogo = require('./../../../assets/images/visa_big.png');
    } else if (type == 2) {
      ccyLogo = require('./../../../assets/images/mastercard_24x15.png');
    } else if (type == TYPE_UNICARD) {
      ccyLogo = require('./../../../assets/images/uniLogo.png');
    }
    return ccyLogo;
  };

  const GetUserBlockedFunds = () => {
    setIsFundsLoading(true);
    let data: IGetUserBlockedBlockedFundslistRequest | undefined = {
      accountNumer: userAccount?.accountNumber,
    };
    if (!userAccount?.accountNumber) {
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

  const cardBlock = () => {
    NetworkService.CheckConnection(() => {
      if (userAccount?.cards?.length) {
        setActionLoading(true);
        let cardId: number = getNumber(
          userAccount?.cards?.[currentCardIndex]?.cardID,
        );
        const req =
          userAccount?.cards?.[currentCardIndex].status === blockTypes.active
            ? AccountService.Block
            : AccountService.UnBlock;
        req({ cardId: cardId }).subscribe({
          next: Response => {
            if (Response.data.ok) {
              setActionSheetStep({
                actionSheetType,
                actionSheetStatus: ACTION_SHEET_STATUSES.succes,
                actionSheetTitle: translate.t(
                  `products.${userAccount?.cards?.[currentCardIndex].status ===
                    blockTypes.active
                    ? 'cardBlocked'
                    : 'cardUnBlocked'
                  }`,
                ),
              });
              dispatch(FetchUserAccounts());
              const ucc = [...(userAccount?.cards || [])];
              if (ucc?.length) {
                ucc[currentCardIndex].status =
                  ucc?.[currentCardIndex]?.status === blockTypes.active
                    ? blockTypes.blocked
                    : blockTypes.active;
                setUserAccount({ ...userAccount, cards: ucc });
              }
            }
          },
          complete: () => {
            setActionLoading(false);
          },
          error: err => {
            setActionLoading(false);
            setActionSheetStep({
              actionSheetStatus: ACTION_SHEET_STATUSES.error,
              actionSheetType,
              actionSheetTitle: translate.t('generalErrors.errorOccurred'),
            });
          },
        });
      }
    });
  };

  const startPinChange = () => {
    setActionSheetStep({
      actionSheetTitle: translate.t('products.confirmPinCodeChange'),
      actionSheetStatus: ACTION_SHEET_STATUSES.start,
      actionSheetType: CARD_ACTIONS.change_pin,
    });
  };

  const startAccountTopup = () => {
    NavigationService.navigate(Routes.Topup, {
      currentAccount: userAccount,
    });
  };

  const startCardBlock = () => {
    setActionSheetStep({
      actionSheetTitle: translate.t(
        `products.${userAccount?.cards?.[currentCardIndex]?.status === blockTypes.active
          ? 'reallyNeedBlockCard'
          : 'reallyNeedUnBlockCard'
        }`,
      ),
      actionSheetStatus: ACTION_SHEET_STATUSES.start,
      actionSheetType: CARD_ACTIONS.card_block,
    });
  };

  const pinChangeActions = () => {
    if (actionSheetStatus === ACTION_SHEET_STATUSES.start) {
      setActionSheetStep({
        actionSheetTitle: '',
        actionSheetStatus: ACTION_SHEET_STATUSES.otp,
        actionSheetType,
      });
    } else if (actionSheetStatus === ACTION_SHEET_STATUSES.otp) {
      ChangePin();
    } else if (
      actionSheetStatus === ACTION_SHEET_STATUSES.succes ||
      actionSheetStatus === ACTION_SHEET_STATUSES.error
    ) {
      closeActionSheet();
    }
  };

  const SendPhoneOTP = () => {
    NetworkService.CheckConnection(() => {
      setActionLoading(true);

      let OTP: GeneratePhoneOtpByUserRequest = {
        userName: userData.userDetails?.username,
      };
      OTPService.GeneratePhoneOtpByUser({ OTP }).subscribe({
        next: Response => {
          if (Response.data.ok) {
            setOtpLoader(false)
            setMaskedNumber(Response.data.data?.phoneMask);
          }
        },
        error: () => {
          setOtpLoader(false)
          setActionLoading(false);
          handleSetCurrentHrmRiskLevels();
        },
        complete: () => {
          setOtpLoader(false)
          setActionLoading(false);
        },
      });
    });
  };

  const ChangePin = () => {
    if (userAccount?.cards?.length) {
      setActionLoading(true);
      AccountService.pin({
        cardid: userAccount?.cards?.[currentCardIndex]?.cardID,
        otp: otp,
      }).subscribe({
        next: Response => {
          if (Response.data.ok) {
            setOtp(undefined);
            setActionSheetStep({
              actionSheetType,
              actionSheetStatus: ACTION_SHEET_STATUSES.succes,
              actionSheetTitle: translate.t('products.pinCodeChanged'),
            });
          }
        },
        complete: () => {
          setActionLoading(false);
        },
        error: err => {
          setActionLoading(false);
          setOtp(undefined);
          setActionSheetStep({
            actionSheetStatus: ACTION_SHEET_STATUSES.error,
            actionSheetType,
            actionSheetTitle: translate.t('generalErrors.errorOccurred'),
          });
        },
      });
    }
  };

  const gotoPaymentStep = (
    url?: string,
    paymentStep?: number,
    icat?: ICategory[],
  ) => {
    dispatch({
      type: NAVIGATION_ACTIONS.SET_PARENT_ROUTE,
      parentRoute: Routes.Products,
    });
    NavigationService?.navigate(url || Routes.Payments_STEP1, {
      paymentStep:
        getNumber(paymentStep) >= 0
          ? paymentStep
          : url || Routes.Payments_STEP1,
      step: 1,
      category: [...(icat || [])],
    });
  };

  const GetMerchantServices = (
    data: IMerchantServicesForTemplateRequest,
    onComplate: Function,
    onError: Function,
  ) => {
    NetworkService.CheckConnection(() => {
      PresentationService.GetMerchantServices(data).subscribe({
        next: Response => {
          const merchant = [...Response.data.data?.merchants]?.map(cat => {
            cat.isService = true;
            cat.hasServices = true;
            return cat;
          });
          onComplate(merchant);
        },
        error: () => {
          onError();
        },
      });
    });
  };

  const getCategories = (
    parentID: number = 0,
    isService: boolean = false,
    hasService: boolean = false,
    hasChildren: boolean = false,
    navigate: boolean = false,
    categoryTitle: string = '',
    accept: boolean = false,
  ) => {
    if (!accept) return;
    if (PaymentStore.isCategoriesLoading) return;
    // dispatch({
    //   type: PAYMENTS_ACTIONS.PAYMENT_SET_SELECTED_ACCOUNT,
    //   selectedAccount: props.selectdeAccount,
    // });

    dispatch({
      type: PAYMENTS_ACTIONS.SET_PAYEMNT_ACTIVE_CATEGORY_TITLE,
      title: categoryTitle,
    });

    dispatch({
      type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_CATEGORIES_LOADING,
      isCategoriesLoading: true,
    });

    const onComplate = (cats: ICategory[] | undefined, url?: string) => {
      dispatch({
        type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_CATEGORIES_LOADING,
        isCategoriesLoading: false,
      });

      if (navigate) {
        gotoPaymentStep(url, undefined, cats);
      }
    };

    const onError = () => {
      dispatch({
        type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_CATEGORIES_LOADING,
        isCategoriesLoading: false,
      });
    };

    if (isService && hasService && !hasChildren) {
      let currentService: ICategory[] | IService[],
        merchantCode,
        merchantServiceCode;

      currentService = [...(categories || [])].filter(
        c => c.name === categoryTitle,
      );

      if (!currentService.length) {
        //from the search
        currentService = PaymentStore.services.filter(
          service => service.categoryID === parentID,
        );

        merchantCode = PaymentStore.services[0]?.merchantCode;
        merchantServiceCode = PaymentStore.services[0]?.merchantServiceCode;
      } else {
        merchantCode = currentService[0].merchantCode;
        merchantServiceCode = currentService[0].merchantServiceCode;
      }

      dispatch({
        type: PAYMENTS_ACTIONS.SET_CURRENT_PAYMENT_SERVICE,
        currentService: currentService[0],
      });

      dispatch({
        type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_SERVICE,
        isService: true,
      });

      dispatch(
        GetPaymentDetails(
          {
            ForMerchantCode: merchantCode,
            ForMerchantServiceCode: merchantServiceCode,
            ForOpClassCode: 'B2B.F',
          },
          () => onComplate(undefined, Routes.Payments_INSERT_ABONENT_CODE),
          onError,
        ),
      );

      return;
    }

    /* categories contains merchant and also service */
    if (!isService && hasService && !hasChildren) {
      GetMerchantServices({ CategoryID: parentID }, onComplate, onError);
    } /* categories contains merchants */ else if (
      !isService &&
      hasService &&
      hasChildren
    ) {
      dispatch(getPayCategoriesServices(parentID, onComplate, onError));
    } /* categories contains only services */ else if (
      !isService &&
      !hasService
    ) {
      dispatch(
        getPayCategoriesServices(
          parentID,
          (cats: ICategory[]) => {
            if (!categories) {
              setCategories(cats);
            }
            onComplate(cats);
          },
          onError,
        ),
      );
    }
  };

  const closeActionSheet = () => {
    setActionSheetStep({});
  };

  const handleSetCurrentHrmRiskLevels = () => {
    if (userAccount?.cards) {
      const curCardHrm = userAccount?.cards?.[currentCardIndex]?.hrm;
      if (curCardHrm === 1) {
        setHrmRiskLevels({ a1: true, a2: true });
      } else if (curCardHrm === 0) {
        setHrmRiskLevels({ a1: false, a2: false });
      } else if (curCardHrm === 2) {
        setHrmRiskLevels({ a1: true, a2: false });
      } else if (curCardHrm === 3) {
        setHrmRiskLevels({ a1: false, a2: true });
      }
    }
  };

  const toggleHrmRiskLevels = (data: { a1?: boolean; a2?: boolean }) => {
    if (otpLoader) return;
    setHrmRiskLevels(prevState => {
      return {
        ...prevState,
        ...data,
      };
    });
    setIsHrmProcessing(true);
  };

  const changeConditionRiskLevelUFC = () => {
    if (otpLoader) return;
    let cardHrm = 0;
    if (hrmRiskLevels.a1 === true && hrmRiskLevels.a2 === true) {
      cardHrm = 1;
    } else if (hrmRiskLevels.a1 === false && hrmRiskLevels.a2 === false) {
      cardHrm = 0;
    } else if (hrmRiskLevels.a1 === true && hrmRiskLevels.a2 === false) {
      cardHrm = 2;
    } else if (hrmRiskLevels.a1 === false && hrmRiskLevels.a2 === true) {
      cardHrm = 3;
    }

    let cardId = 0;

    if (userAccount?.cards) {
      cardId = getNumber(userAccount?.cards?.[currentCardIndex]?.cardID);
    }

    const data: IChangeConditionRisklevelUFCRequest = {
      status: cardHrm,
      cardID: cardId,
      otp: getString(otp),
    };

 
    setOtpLoader(true)

    UserService.changeConditionRisklevelUFC(data).subscribe({
      next: Response => {
        if (Response.data.ok) {
          dispatch(FetchUserAccounts()); //vkitxo rato staitments da ara accounts
        }
      },
      complete: () => {
        setOtpLoader(false)
        setOtp(undefined);
        setIsHrmProcessing(false);
        setOpenOtpModal(false);
      },
      error: err => {
        handleSetCurrentHrmRiskLevels();
        setOtpLoader(false)
        setOtp(undefined);
        setIsHrmProcessing(false);
        setOpenOtpModal(false);
      },
    });
  };

  const handlePrepareDigitalCard = () => {
    let data = {
      cardId: userAccount?.cards?.[currentCardIndex].cardID!,
      otp: otp!
    }
    setOtpLoader(true);
    CardService.PrepareForDigitalCard(data).then(res => {
      setOtpLoader(false);
      setOtp("");
      if(!res.data.ok) {
        Store.dispatch<IErrorAction>({ type: PUSH_ERROR, error: res.data.errors.displayText });
      } else {
        setDcData(res.data.data)
        setShowCardDetailsModal(true);
        setIsDigitalCardProcessing(false);
        setOpenOtpModal(false)
      }
    }).catch(e =>{ 
      console.log('aqane errr')
      setOtpLoader(false);
      console.log(JSON.parse(JSON.stringify(e.response)))
    })
  };

  const handleOnOtpComplete = () => {
    if (isHrmProcessing) {
      changeConditionRiskLevelUFC();
    } else if (isDigitalCardProcessing) {
      handlePrepareDigitalCard()
    }
  };

  useEffect(() => {
    if (isHrmProcessing ==true || isDigitalCardProcessing == true) {
      setOpenOtpModal(true);
    } 
  }, [hrmRiskLevels.a1, hrmRiskLevels.a2, isDigitalCardProcessing]);
  
  useEffect(() => {
    if(openOtpModal) SendPhoneOTP();
  }, [openOtpModal]);

  useEffect(() => {
    if (userAccount?.type !== TYPE_UNICARD) {
      GetUserBlockedFunds();
    }
  }, []);

  useEffect(() => {
    if (actionSheetStatus == ACTION_SHEET_STATUSES.otp) {
      SendPhoneOTP();
    }
  }, [actionSheetStatus]);

  useEffect(() => {
    onFetchData();
  }, []);

  useEffect(() => {
    fetchAccountStatements();
    handleSetCurrentHrmRiskLevels();
  }, [userAccount]);

  useEffect(() => {
    setSelectedFromAccount(userAccount);
    if (userAccount?.type === PACKET_TYPE_IDS.unicard) {
      GenerateBarcode(getString(userAccount?.accountNumber));
      getUnicardStatement();
    } else {
      getStatements()
    }
  }, [userAccount]);

  const getUnicardStatement = () => {

    let data: IGetUnicardStatementRequest = {
      card: userAccount?.accountNumber,
    };
    setIsCurrentStatementsLoading(true);
    CardService.GetUnicardStatement(data).subscribe({
      next: Response => {
        setUnicardStatements(Response.data.data?.transactions);
      },
      complete: () => { setIsCurrentStatementsLoading(false) },
      error: () => { setIsCurrentStatementsLoading(false) },
    });
  };

  const getStatements = () => {
    if (unicardStatements) setUnicardStatements(undefined);
    let data: IUserAccountsStatementRequest = {};

    if (userAccount) {

      let _accountNumberList: Array<string> = [];
      const accountNumber = userAccount?.accountNumber?.toString();
      userAccount.currencies?.forEach(c => {
        _accountNumberList.push(
          getString(accountNumber?.concat(getString(c.key))),
        );
      });

      data = {
        ...data,
        accountNumberList: _accountNumberList.join(','),
      };

    }

    setIsCurrentStatementsLoading(true);
    UserService.GetUserAccountStatements(data).subscribe({
      next: Response => {
        if (Response.data.ok) {
          let _statements = [...(Response.data.data?.statements || [])];

          const UseAccountStatements = {
            statement_Ballances: Response.data.data?.statement_Ballances,
            statements: _statements,
          };

          setUseAccountStatements(UseAccountStatements);
        }
      },
      error: err => {
        setIsCurrentStatementsLoading(false);
      },
      complete: () => {
        setIsCurrentStatementsLoading(false);
      },
    });
  };

  


  const dimension = Dimensions.get('window');

  const cardWidth = dimension.width - 40;

  const actionSheetHeight = 410;

  const isDisabled = isUserVerified ? {} : { opacity: 0.5 };

  const handleWallet = () => {
    const logData = (data: string) => {
      console.log('###wallet log###', parseWalletResponse(data).text);
    };
    const cardId = userAccount?.cards?.[currentCardIndex].cardID;
    const cardMask = getString(userAccount?.cards?.[currentCardIndex].maskedCardNumber);
    const mask = cardMask.substring(cardMask.length - 4);
    const token = authData.accesToken;
    //Alert.alert((cardId || ',') + ' ' + (mask || '.'));
    //console.log(userAccount?.cards?.[currentCardIndex])
    if (token && cardId && mask) {
      AddCardToWallet(
        cardId,
        `Bearer ${token}`,
        mask,
        ' ',
        logData,
      );
    }

  };

  if(openOtpModal) {
    return (
      <OtpModal
      modalVisible={openOtpModal}
      otp={otp}
      onSetOtp={setOtp}
      onSendOTP={SendPhoneOTP}
      onComplate={handleOnOtpComplete}
      isLoading={otpLoader}
      resendTitle={translate.t('otp.resend')}
      label={translate.t('otp.smsCode')}
      buttonText={translate.t('common.next')}
      onClose={() => {
       setOpenOtpModal(false);
       setIsHrmProcessing(false);
       setIsDigitalCardProcessing(false);
        setOtp("");
      }}
    />
    )
  }


  return (
    <DashboardLayout>
     <>
     {actionLoading && (
        <FullScreenLoader background={colors.none} hideLoader />
      )}

      <ReactScroll style={[screenStyles.screenContainer, styles.container]}>
        <View style={styles.transfersSectionContainer}>
          {userAccount?.type !== PACKET_TYPE_IDS.wallet &&
            userAccount?.type !== PACKET_TYPE_IDS.unicard &&
            getNumber(userAccount?.cards?.length) > 1 && (
              <PaginationDots
                step={currentCardIndex}
                length={userAccount?.cards?.length}
              />
            )}
          {userAccount?.type !== PACKET_TYPE_IDS.wallet &&
            userAccount?.type !== PACKET_TYPE_IDS.unicard ? (
            <ScrollView
              style={styles.cards}
              ref={carouselRef}
              onScroll={({ nativeEvent }) => onChangeCardIndex(nativeEvent)}
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
              horizontal>
              {getNumber(userAccount?.cards?.length) > 0 ? (
                userAccount?.cards?.map((card, index) => (
                  <View
                    style={[screenStyles.wraper, styles.container]}
                    key={getNumber(card.cardID) + index}>
                    <AccountCard
                      account={userAccount}
                      cardMask={card.maskedCardNumber}
                      cardContainerStyle={{ width: cardWidth }}
                      logo={getCardLogo(getNumber(card.cardTypeID))}
                    />
                  </View>
                ))
              ) : (
                <View style={[screenStyles.wraper, styles.container]}>
                  <AccountCard
                    account={userAccount}
                    cardContainerStyle={{ width: cardWidth }}
                  />
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={[screenStyles.wraper, styles.container]}>
              <AccountCard
                account={userAccount}
                cardContainerStyle={{ width: cardWidth }}
              />
              {userAccount?.type === PACKET_TYPE_IDS.unicard &&
                (isBarCodeLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={styles.loadingBox}
                  />
                ) : (
                  <Image
                    source={{
                      uri: `data:image/png;base64,${barcode}`,
                    }}
                    style={styles.barCode}
                  />
                ))}
            </View>
          )}

          {Platform.OS == 'ios' && userAccount?.cards?.[currentCardIndex]?.cardTypeID === 1 && userData.userDetails?.claims?.[1]?.claimValue == "1" &&
            userAccount?.cards?.[currentCardIndex]?.canAddToAppleWallet !== false &&
            <View
              style={styles.appleWallet}>
              <View style={styles.appleWalletLeft}>
                <SvgXml xml={icon_apple_pay} height="42" />
                <Text style={styles.appleWalletVisa}>
                  {translate.t('products.addAppleWallet')}
                </Text>
              </View>
              <TouchableOpacity onPress={handleWallet}>
                <SvgXml xml={icon_visa_card} height="42" />
              </TouchableOpacity>
            </View>
          }

          <View style={styles.transfersSectionContainerHeader}>
            <Text style={styles.transfersSectionContainerTitle}>
              {translate.t('tabNavigation.payments')}
            </Text>
            {userAccount?.type !== PACKET_TYPE_IDS.unicard && (
              <PaginationDots step={paymentSectionStep} length={2} />
            )}
          </View>

          <ScrollView
            ref={carouselRef}
            onScroll={({ nativeEvent }) =>
              onChangePaymentSectionStep(nativeEvent)
            }
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            scrollEnabled={userAccount?.type !== PACKET_TYPE_IDS.unicard}
            horizontal>
            <View style={[screenStyles.wraper, styles.toolItemsWraper]}>
              <View style={[styles.sectionContainerColumn, { width: cardWidth }]}>
                <TouchableOpacity
                  style={styles.sectionContainerItem}
                  onPress={() => {
                    getCategories(
                      1,
                      false,
                      false,
                      true,
                      true,
                      translate.t('services.utility'),
                      true,
                    );
                  }}>
                  <View style={styles.sectionContainerItemImageContainer}>
                    <Image
                      source={{ uri: `${_envs.CDN_PATH}utility/home.png` }}
                      style={styles.toolsIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.sectionContainerItemDetails}>
                    {breackWords(translate.t('services.utility'))}
                  </View>
                </TouchableOpacity>

                {userAccount?.type !== PACKET_TYPE_IDS.unicard && (
                  <>
                    <TouchableOpacity
                      style={styles.sectionContainerItem}
                      onPress={() => {
                        getCategories(
                          9,
                          false,
                          false,
                          true,
                          true,
                          translate.t('services.tvInternet'),
                          false,
                        );
                      }}>
                      <View style={styles.sectionContainerItemImageContainer}>
                        <Image
                          source={{ uri: `${_envs.CDN_PATH}utility/internet.png` }}
                          style={[styles.toolsIcon, isDisabled]}
                          resizeMode="contain"
                        />
                      </View>
                      <View
                        style={[
                          styles.sectionContainerItemDetails,
                          isDisabled,
                        ]}>
                        {breackWords(translate.t('services.tvInternet'))}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sectionContainerItem}
                      onPress={() => {
                        getCategories(
                          10,
                          false,
                          false,
                          true,
                          true,
                          translate.t('services.telephone'),
                          false,
                        );
                      }}>
                      <View style={styles.sectionContainerItemImageContainer}>
                        <Image
                          source={{ uri: `${_envs.CDN_PATH}utility/phone.png` }}
                          style={[styles.toolsIcon, isDisabled]}
                          resizeMode="contain"
                        />
                      </View>
                      <View
                        style={[
                          styles.sectionContainerItemDetails,
                          isDisabled,
                        ]}>
                        {breackWords(translate.t('services.telephone'))}
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              

              <View style={[styles.sectionContainerColumn, { width: cardWidth }]}>
                {userAccount?.type !== PACKET_TYPE_IDS.unicard && (
                  <>
                    <TouchableOpacity
                      style={styles.sectionContainerItem}
                      onPress={() => {
                        getCategories(
                          7,
                          false,
                          false,
                          true,
                          true,
                          translate.t('services.mobile'),
                          true,
                        );
                      }}>
                      <View style={styles.sectionContainerItemImageContainer}>
                        <Image
                          source={{ uri: `${_envs.CDN_PATH}utility/mobile.png` }}
                          style={styles.toolsIcon}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={styles.sectionContainerItemDetails}>
                        {breackWords(translate.t('services.mobile'))}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sectionContainerItem}
                      onPress={() => {
                        getCategories(
                          14,
                          false,
                          false,
                          true,
                          true,
                          translate.t('services.parking'),
                          false,
                        );
                      }}>
                      <View style={styles.sectionContainerItemImageContainer}>
                        <Image
                          source={{ uri: `${_envs.CDN_PATH}utility/parking.png` }}
                          style={[styles.toolsIcon, isDisabled]}
                          resizeMode="contain"
                        />
                      </View>
                      <View
                        style={[
                          styles.sectionContainerItemDetails,
                          isDisabled,
                        ]}>
                        {breackWords(translate.t('services.parking'))}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sectionContainerItem}
                      onPress={() => {
                        getCategories(
                          8,
                          false,
                          false,
                          true,
                          true,
                          translate.t('services.gambling'),
                          false,
                        );
                      }}>
                      <View style={styles.sectionContainerItemImageContainer}>
                        <Image
                          source={{ uri: `${_envs.CDN_PATH}utility/game.png` }}
                          style={[styles.toolsIcon, isDisabled]}
                          resizeMode="contain"
                        />
                      </View>
                      <View
                        style={[
                          styles.sectionContainerItemDetails,
                          isDisabled,
                        ]}>
                        {breackWords(translate.t('services.gambling'))}
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          {userAccount?.type !== PACKET_TYPE_IDS.unicard && (
            <>
              <View style={styles.line}></View>
              <View style={styles.transfersSectionContainerHeader}>
                <Text style={styles.transfersSectionContainerTitle}>
                  {translate.t('tabNavigation.transfers')}
                </Text>
                <PaginationDots step={transferSectionStep} length={2} />
              </View>
            </>
          )}

          {userAccount?.type !== PACKET_TYPE_IDS.unicard && (
            <ScrollView
              ref={carouselRef}
              onScroll={({ nativeEvent }) =>
                onChangeTransferSectionStep(nativeEvent)
              }
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
              horizontal>
              <View style={[styles.transferItemsWraper, screenStyles.wraper]}>
                <View
                  style={[
                    styles.transfersSectionContainerColumn,
                    { width: cardWidth },
                  ]}>
                  <TouchableOpacity
                    style={styles.transfersSectionContainerItemScroller}
                    onPress={transferBetweenAccounts}>
                    <View
                      style={
                        styles.transfersSectionContainerItemImageContainer
                      }>
                      <Image
                        source={require('./../../../assets/images/between_accounts.png')}
                        style={[
                          styles.transfersSectionContainerItemImage,
                          isDisabled,
                        ]}
                      />
                    </View>
                    <View
                      style={[
                        styles.transfersSectionContainerItemDetails,
                        isDisabled,
                      ]}>
                      {breackWords(translate.t('transfer.betweeenOwnAccounts'))}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.transfersSectionContainerItemScroller}
                    onPress={transferToUni}>
                    <View
                      style={
                        styles.transfersSectionContainerItemImageContainer
                      }>
                      <Image
                        source={require('./../../../assets/images/to_wallet.png')}
                        style={[
                          styles.transfersSectionContainerItemImage,
                          isDisabled,
                        ]}
                      />
                    </View>
                    <View
                      style={[
                        styles.transfersSectionContainerItemDetails,
                        isDisabled,
                      ]}>
                      {breackWords(translate.t('transfer.toUniWallet'))}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.transfersSectionContainerItemScroller}
                    onPress={transferConvertation}>
                    <View
                      style={
                        styles.transfersSectionContainerItemImageContainer
                      }>
                      <Image
                        source={require('./../../../assets/images/convertation.png')}
                        style={[
                          styles.transfersSectionContainerItemImage,
                          isDisabled,
                        ]}
                      />
                    </View>
                    <View
                      style={[
                        styles.transfersSectionContainerItemDetails,
                        isDisabled,
                      ]}>
                      {breackWords(translate.t('transfer.currencyExchange'))}
                    </View>
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.transfersSectionContainerColumn,
                    { width: cardWidth },
                  ]}>
                  <TouchableOpacity
                    style={styles.transfersSectionContainerItemScroller}
                    onPress={transferToBank}>
                    <View
                      style={
                        styles.transfersSectionContainerItemImageContainer
                      }>
                      <Image
                        source={require('./../../../assets/images/to_bank.png')}
                        style={[
                          styles.transfersSectionContainerItemImage,
                          isDisabled,
                        ]}
                      />
                    </View>
                    <View
                      style={[
                        styles.transfersSectionContainerItemDetails,
                        isDisabled,
                      ]}>
                      {breackWords(translate.t('transfer.toBank'))}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.transfersSectionContainerItemScroller}
                    onPress={internationalTransfer}>
                    <View
                      style={
                        styles.transfersSectionContainerItemImageContainer
                      }>
                      <Image
                        source={require('./../../../assets/images/icon-international.png')}
                        style={[
                          styles.transfersSectionContainerItemImage,
                          isDisabled,
                          !hasAccountUsdOrEur && { opacity: 0.5 },
                        ]}
                      />
                    </View>
                    <View
                      style={[
                        styles.transfersSectionContainerItemDetails,
                        isDisabled,
                        !hasAccountUsdOrEur && { opacity: 0.5 },
                      ]}>
                      {breackWords(
                        translate.t('transfer.internationalTransfer'),
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.transfersSectionContainerItemScroller}
                    activeOpacity={1}></TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}


          {userAccount?.type !== PACKET_TYPE_IDS.unicard && (
            <>
              <View style={styles.line}></View>
              <View style={styles.transfersSectionContainerHeader}>
                <Text style={styles.transfersSectionContainerTitle}>
                  {translate.t('products.manageCard')}
                </Text>
                {userAccount?.type !== PACKET_TYPE_IDS.wallet && <PaginationDots step={cardSectionStep} length={2} />}
              </View>
            </>
          )}
          {userAccount?.type !== PACKET_TYPE_IDS.unicard && (
            <ScrollView
              ref={carouselRef}
              onScroll={({ nativeEvent }) =>
                onChangeCardActionSectionStep(nativeEvent)
              }
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
              horizontal>
              <View style={[screenStyles.wraper, styles.toolItemsWraper]}>
                <View style={[styles.sectionContainerColumn, { width: cardWidth }]}>
                  {userAccount?.type !== PACKET_TYPE_IDS.wallet && userAccount?.type !== PACKET_TYPE_IDS.unicard && (
                    <TouchableOpacity
                      style={styles.sectionContainerItem}
                      onPress={() => setIsDigitalCardProcessing(true)}>
                      <View style={styles.sectionContainerItemImageContainer}>
                        <Image
                          source={require('./../../../assets/images/Show.png')}
                          style={styles.toolsIcon}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={styles.sectionContainerItemDetails}>
                        {breackWords(translate.t('common.seeCard'))}
                      </View>
                    </TouchableOpacity>
                  )}
                  {userAccount?.type !== PACKET_TYPE_IDS.wallet && (
                    <TouchableOpacity
                      style={styles.sectionContainerItem}
                      onPress={startCardBlock}>
                      <View style={styles.sectionContainerItemImageContainer}>
                        <Image
                          source={
                            userAccount?.cards?.[currentCardIndex]?.status ===
                              blockTypes.active
                              ? require('./../../../assets/images/block-icon.png')
                              : require('./../../../assets/images/unbloked.png')
                          }
                          style={styles.toolsIcon}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={styles.sectionContainerItemDetails}>
                        {breackWords(
                          translate.t(
                            `products.${userAccount?.cards?.[currentCardIndex]?.status ===
                              blockTypes.active
                              ? 'blockCard'
                              : 'unblockCard'
                            }`,
                          ),
                        )}
                      </View>
                    </TouchableOpacity>
                  )}

                  {userAccount?.type !== PACKET_TYPE_IDS.wallet && (
                    <TouchableOpacity
                      style={styles.sectionContainerItem}
                      onPress={startPinChange}>
                      <View style={styles.sectionContainerItemImageContainer}>
                        <Image
                          source={require('./../../../assets/images/pin-icon.png')}
                          style={styles.toolsIcon}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={styles.sectionContainerItemDetails}>
                        {breackWords(translate.t('products.changeCardPin'))}
                      </View>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.sectionContainerItem}
                    onPress={startAccountTopup}>
                    <View style={styles.sectionContainerItemImageContainer}>
                      <Image
                        source={require('./../../../assets/images/plus_noBG.png')}
                        style={styles.toolsIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.sectionContainerItemDetails}>
                      {breackWords(translate.t('plusSign.topUp').replace(' ', ''))}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>

        {userAccount?.type !== PACKET_TYPE_IDS.wallet &&
          userAccount?.type !== PACKET_TYPE_IDS.unicard && (
            <>
              <View style={styles.line}></View>
              <View style={[screenStyles.wraper, styles.swiths]}>
                <Text style={styles.checkTitle}>
                  {translate.t('orderCard.highRiskMerchantTitle')}
                </Text>

                <View style={styles.toggleBox}>
                  <Switch
                    style={styles.check}
                    trackColor={{
                      false: colors.inputBackGround,
                      true: colors.primary,
                    }}
                    thumbColor={hrmRiskLevels.a2 ? colors.white : colors.white}
                    ios_backgroundColor={colors.inputBackGround}
                    onValueChange={() =>
                      toggleHrmRiskLevels({ a2: !hrmRiskLevels.a2 })
                    }
                    value={hrmRiskLevels.a2}
                  />
                  <Text style={styles.checkLabel}>
                    {translate.t('orderCard.riskLevel_a2')}
                  </Text>
                </View>

                <View style={styles.toggleBox}>
                  <Switch
                    style={styles.check}
                    trackColor={{
                      false: colors.inputBackGround,
                      true: colors.primary,
                    }}
                    thumbColor={hrmRiskLevels.a1 ? colors.white : colors.white}
                    ios_backgroundColor={colors.inputBackGround}
                    onValueChange={() =>
                      toggleHrmRiskLevels({ a1: !hrmRiskLevels.a1 })
                    }
                    value={hrmRiskLevels.a1}
                  />
                  <Text style={styles.checkLabel}>
                    {translate.t('orderCard.riskLevel_a1')}
                  </Text>
                </View>
              </View>
            </>
          )}
        <View style={styles.line}></View>
        <View style={[screenStyles.wraper, styles.transactions]}>
          <TransactionsList
            statements={[...(useAccountStatements?.statements || [])]}
            unicards={unicardStatements}
            isLoading={isCurrentStatementsLoading}
          />
        </View>
      </ReactScroll>
      {/*UFC Digital Card Details*/}

      <ActionSheetCustom
        scrollable={true}
        hasDraggableIcon={true}
        visible={showCardDetailsModal}
        hasScroll={false}
        height={actionSheetHeight}
        onPress={()=>setShowCardDetailsModal(false)}>
        <View style={styles.blockContainer}>
          <WebView
            style={styles.content}
            containerStyle={styles.content}
            javaScriptEnabled={true}
            source={{
              html: `
              <!DOCTYPE html>
                  <html lang="en">
                  <head>
                  <meta charset="UTF-8">
                  <title>Card Details</title>
                      <script>
                        function onLoad(e) {
                          document.getElementById('TheForm').submit();
                        }
                      </script>
                  </head>
                  <body onload="onLoad()">
                      <form id="TheForm" 
                        method="post"  
                        action="https://ufcdigitalcard.ufc.ge/DigitalCardUI/digital/card" 
                        enctype="application/x-www-form-urlencoded">
                          <input type="hidden" name="cardId" value=${dcData.encryptedCard}/>
                          <input type="hidden" name="requestId" value=${dcData.uuId} />
                      </form>
                  </body>
              </html>`,
            }}
          />
        </View>
      </ActionSheetCustom>
      {/*UFC Digital Card Details*/}
      <ActionSheetCustom
        scrollable={true}
        hasDraggableIcon={true}
        visible={actionSheetType == CARD_ACTIONS.card_block}
        hasScroll={false}
        height={actionSheetHeight}
        onPress={closeActionSheet}>
        <View style={styles.blockContainer}>
          <Text style={styles.actionSheetTitle}>{actionSheetTitle}</Text>

          <Image
            source={
              actionSheetStatus === ACTION_SHEET_STATUSES.start
                ? require('./../../../assets/images/info_orange.png')
                : actionSheetStatus === ACTION_SHEET_STATUSES.succes
                  ? require('./../../../assets/images/info_green.png')
                  : require('./../../../assets/images/info_red.png')
            }
            style={styles.actionLogo}
          />

          <View style={styles.actionButtons}>
            {actionSheetStatus === ACTION_SHEET_STATUSES.start && (
              <AppButton
                title={translate.t(
                  `common.${userAccount?.cards?.[currentCardIndex]?.status ===
                    blockTypes.active
                    ? 'block'
                    : 'unblock'
                  }`,
                )}
                onPress={cardBlock}
                backgroundColor={colors.danger}
                style={styles.actionButton}
                isLoading={actionLoading}
              />
            )}
            <AppButton
              title={`${actionSheetStatus === ACTION_SHEET_STATUSES.start
                ? translate.t('common.no')
                : translate.t('common.close')
                }`}
              onPress={closeActionSheet}
              style={styles.actionButton}
              isLoading={actionLoading}
            />
          </View>
        </View>
      </ActionSheetCustom>

      <Modal visible={actionSheetType == CARD_ACTIONS.change_pin} transparent onRequestClose={closeActionSheet}>
        <TouchableOpacity style={styles.actionModalContainer} activeOpacity={1} onPress={() => closeActionSheet()}>
        <View style={styles.actionModalContent}>
          {actionSheetStatus === ACTION_SHEET_STATUSES.otp ? (
            <View style={styles.otpHeader}>
              <Text style={styles.otpTitle}>
                {translate.t('otp.otpSent')}:{' '}
              </Text>
              <Text style={styles.otpVewPhone}>{maskedPhoneNumber}</Text>
            </View>
          ) : (
            <Text style={styles.actionSheetTitle}>{actionSheetTitle}</Text>
          )}
          {actionSheetStatus === ACTION_SHEET_STATUSES.start && (
            <>
              <View style={styles.descContainer}>
                <Text style={styles.description}>
                  {translate.t('products.wilResavePinCode')}
                </Text>
              </View>
              <Text style={styles.blockCardMask}>
                {userAccount?.accountTypeName}{' '}
                {userAccount?.cards &&
                  userAccount?.cards?.[currentCardIndex]?.maskedCardNumber}
              </Text>
            </>
          )}
          {actionSheetStatus === ACTION_SHEET_STATUSES.otp && (
            <View>
              <FloatingLabelInput
                Style={styles.otpBox}
                label={translate.t('otp.smsCode')}
                title=""
                value={otp}
                onChangeText={onSetOtp}
                onRetry={SendPhoneOTP}
              />
            </View>
          )}
          {actionSheetStatus === ACTION_SHEET_STATUSES.succes && (
            <Image
              source={require('./../../../assets/images/info_green.png')}
              style={styles.actionLogo}
            />
          )}
          {actionSheetStatus === ACTION_SHEET_STATUSES.error && (
            <Image
              source={require('./../../../assets/images/info_red.png')}
              style={styles.actionLogo}
            />
          )}
          <View style={styles.actionButtons}>
            <AppButton
              title={`${actionSheetStatus === ACTION_SHEET_STATUSES.start
                ? translate.t('common.confirm')
                : actionSheetStatus === ACTION_SHEET_STATUSES.otp
                  ? translate.t('common.next')
                  : translate.t('common.close')
                }`}
              isLoading={actionLoading}
              onPress={pinChangeActions}
              style={styles.actionButton}
            />
          </View>
        </View>       
        </TouchableOpacity>
      </Modal>
     </>
     
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    overflow: 'hidden',
    flex: 1,
  },
  container: { backgroundColor: colors.white },
  cards: {
    marginTop: 32,
  },
  transactionContainer: {
    marginBottom: 41,
  },
  transferItemsWraper: {
    flexDirection: 'row',
  },
  transfersSectionContainer: {
    flex: 1,
    marginTop: 33,
    backgroundColor: colors.white,
  },
  transfersSectionContainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 18,
    paddingHorizontal: 22,
    marginBottom: 14,
    marginTop: 20,
    backgroundColor: colors.white,
  },
  transfersSectionContainerTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  transfersSectionContainerColumn: {
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  transfersSectionContainerItem: {
    overflow: 'hidden',
    alignItems: 'center',
    width: '33.3333333333%',
  },
  transfersSectionContainerItemImageContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    elevation: 2,
    shadowColor: '#00000060',
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowRadius: Platform.OS === 'ios' ? 5 : 25,
    borderRadius: 25,
    backgroundColor: colors.white,
  },
  transfersSectionContainerItemImage: {
    width: 40,
    height: 40,
  },
  transfersSectionContainerItemDetails: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  sectionContainerItemDetailsTitle: {
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 15,
    color: colors.black,
    textAlign: 'center',
  },
  toolsIcon: {
    width: 20,
    height: 20,
  },
  toolItemsWraper: {
    flexDirection: 'row',
    paddingTop: 10,
    backgroundColor: colors.white,
  },
  sectionContainerColumn: {
    flexDirection: 'row',
  },
  sectionContainerItem: {
    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
    alignItems: 'center',
    width: '33.3333333333%',
  },
  sectionContainerItemImageContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    elevation: 2,
    shadowColor: '#00000060',
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowRadius: Platform.OS === 'ios' ? 5 : 25,
    borderRadius: 25,
    backgroundColor: colors.white,
  },
  sectionContainerItemDetails: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  transactions: {
    marginTop: 0,
    backgroundColor: colors.white,
  },
  blockContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionModalContainer: {
    backgroundColor: '#00000050',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionModalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    maxWidth: '95%'
  },
  actionSheetTitle: {
    color: colors.black,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'FiraGO-Bold',
    textAlign: 'center',
    marginTop: 30,
  },
  actionLogo: {
    alignSelf: 'center',
    marginTop: 50,
  },
  actionButtons: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  actionButton: {
    width: 140,
  },
  description: {
    color: colors.labelColor,
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'FiraGO-Regular',
    textAlign: 'center',
    marginTop: 35,
  },
  descContainer: {
    maxWidth: 299,
    alignSelf: 'center',
  },
  blockCardMask: {
    color: colors.black,
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'FiraGO-Bold',
    textAlign: 'center',
    marginTop: 30,
  },
  otpHeader: {
    marginTop: 30,
  },
  otpTitle: {
    color: colors.black,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'FiraGO-Bold',
    textAlign: 'center',
  },
  otpVewPhone: {
    color: colors.labelColor,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'FiraGO-Bold',
    textAlign: 'center',
    marginTop: 5,
  },
  otpBox: {},
  transfersSectionContainerItemScroller: {
    overflow: 'hidden',
    alignItems: 'center',
    width: '33.3333333333%',
  },
  barCode: {
    height: 65,
    width: '100%',
  },
  loadingBox: {
    alignSelf: 'center',
    flex: 1,
    marginTop: 10,
  },
  line: {
    backgroundColor: colors.inputBackGround,
    height: 1,
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  checkTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
    marginTop: 35,
  },
  toggleBox: {
    flexShrink: 1,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  check: {
    alignSelf: 'flex-start',
  },
  checkLabel: {
    fontFamily: 'FiraGO-Book',
    fontSize: 10,
    lineHeight: 12,
    color: colors.black,
    marginLeft: 18,
    flex: 1,
    flexWrap: 'wrap',
  },
  swiths: {
    backgroundColor: colors.white,
    marginBottom: 30,
  },
  otpContent: {
    justifyContent: 'space-between',
    flex: 1,
    paddingHorizontal: 30,
  },
  otpButton: {
    marginBottom: tabHeight + 40,
  },
  otpBox2: {
    top: Dimensions.get('window').height / 4,
  },
  appleWallet: {
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appleWalletLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  appleWalletVisa: {
    fontSize: 10,
    lineHeight: 12
  }
});

export default ProductDetail;

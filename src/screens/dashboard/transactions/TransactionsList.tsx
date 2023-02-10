import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import colors from '../../../constants/colors';
import Routes from '../../../navigation/routes';
import {FetchUserAccountStatements} from '../../../redux/actions/user_actions';
import {
  ITranslateState,
  IGlobalState as ITranslateGlobalState,
} from '../../../redux/action_types/translate_action_types';
import {
  IUserState,
  IGloablState as IUserGlobalState,
} from '../../../redux/action_types/user_action_types';
import {ITransaction} from '../../../services/CardService';
import NetworkService from '../../../services/NetworkService';
import UserService, {
  GetTransactionDetailsRequest,
  IFund,
  IGetTransactionDetailsResponse,
  IStatements,
} from '../../../services/UserService';
import ActionSheetCustom from './../../../components/actionSheet';
import TransactionDetailView from './TransactionDetailView';
import TransactionItem from './TransactionItem';

interface IProps {
  statements?: IStatements[];
  funds?: IFund[] | undefined;
  unicards?: ITransaction[];
  isLoading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  hideSeeMoreButton?: boolean;
}

const TransactionsList: React.FC<IProps> = props => {
  const translate = useSelector<ITranslateGlobalState>(
    state => state.TranslateReduser,
  ) as ITranslateState;
  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;
  const [isFundsLoading, setIsFundsLoading] = useState<boolean>(false);
  const dispatch = useDispatch<any>();;
  const [transactionDetail, setTransactionDetail] = useState<
    IGetTransactionDetailsResponse | undefined
  >();
  const [fundDetail, setFundDetail] = useState<IFund | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [asheetHeader, setAsheetHeader] = useState<JSX.Element | null>(null);
  const [funds, setFunds] = useState<IFund[] | undefined>();
  const nav = useNavigation<any>();

  const GetUserBlockedFunds = () => {
    setIsFundsLoading(true);
    UserService.getUserBlockedFunds().subscribe({
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

  const GetTransactionDetails = (tranId?: number) => {
    if (isLoading || fundDetail) return;

    NetworkService.CheckConnection(() => {
      setIsLoading(true);
      const data: GetTransactionDetailsRequest = {
        tranid: tranId,
      };
      UserService.GetTransactionDetails(data).subscribe({
        next: Response => {
          if (Response.data.ok) {
            setTransactionDetail(Response.data.data);
          }
        },
        complete: () => setIsLoading(false),
        error: () => setIsLoading(false),
      });
    });
  };

  const ViewFundDetails = (fund: IFund) => {
    if (isLoading || transactionDetail) return;
    setFundDetail(fund);
  };

  useEffect(() => {
    if (!props.statements || !props.statements.length) {
      dispatch(FetchUserAccountStatements({}));
    }

    if(!props.funds || !props.funds.length) {
      GetUserBlockedFunds();
    }
  }, []);

  const containerStyle = [
    styles.transactionsView,
    styles.transactionContainer,
    props.containerStyle,
  ];

  let statements: IStatements[] = [];
  let _funds: IFund[] = [];

  // if (props.statements && props.statements.length) {
  //   statements = [...(props.statements || [])];
  // } else {
  //   statements = [...(userData.useAccountStatements?.statements || [])];
  // }

  statements = [...(props.statements || [])];

  if (props.funds && props.funds.length) {
    _funds = [...(props.funds || [])];
  } else {
    _funds = [...(funds || [])];
  }

  

  const getHeader = (str: JSX.Element | null) => {
    setAsheetHeader(str);
  };

  const sheetHeight = Dimensions.get('window').height - 120;

  return (
    <View style={containerStyle}>
      <View style={styles.transactionsViewHeader}>
        <Text style={styles.transactionsViewTitle}>
          {translate.t('transaction.lastTransaction')}
        </Text>
        {!props.hideSeeMoreButton && (
          <TouchableOpacity onPress={() => nav.navigate(Routes.Transactions)}>
            <Text style={styles.transactionsViewSeeall}>
              {translate.t('common.all')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {isFundsLoading || userData.isStatementsLoading || props.isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loadingBox}
        />
      ) : (
        <TransactionItem
          onViewFundDetails={ViewFundDetails}
          onGetTransactionDetails={GetTransactionDetails}
          unicards={props.unicards}
          funds={_funds}
          statements={statements}
        />
      )}

      <ActionSheetCustom
        header={asheetHeader}
        scrollable={true}
        hasDraggableIcon={false}
        visible={transactionDetail != undefined || fundDetail != undefined}
        hasScroll={true}
        height={sheetHeight}
        onPress={() => {
          setTransactionDetail(undefined);
          setFundDetail(undefined);
        }}>
        <TransactionDetailView
          statement={transactionDetail}
          fundStatement={fundDetail}
          sendHeader={getHeader}
          onClose={() => {
            setTransactionDetail(undefined);
            setFundDetail(undefined);
          }}
        />
      </ActionSheetCustom>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionsView: {
    flex: 1,
  },
  transactionsViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 17,
    marginBottom: 24,
  },
  transactionsViewTitle: {
    fontFamily: 'FiraGO-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: colors.black,
  },
  transactionsViewSeeall: {
    fontFamily: 'FiraGO-Book',
    fontSize: 12,
    lineHeight: 14,
    color: colors.labelColor,
  },
  transactionsViewItemImage: {
    marginRight: 13,
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  loadingBox: {
    flex: 1,
  },

  transactionContainer: {
    marginBottom: 41,
    marginTop: 38,
  },
});

export default TransactionsList;

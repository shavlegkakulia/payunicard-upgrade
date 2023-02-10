import React, {useEffect, useState, FC, useCallback} from 'react';
import {View, ScrollView, RefreshControl, StyleSheet} from 'react-native';
import FullScreenLoader from '../../../components/FullScreenLoading';
import colors from '../../../constants/colors';
import PresentationService, {
  ICategory,
  IGetPaymentDetailsRequest,
  IMerchantServicesForTemplateRequest,
  IService,
} from '../../../services/PresentationServive';
import DashboardLayout from '../../DashboardLayout';
import screenStyles from '../../../styles/screens';
import {ITemplates} from '../../../services/TemplatesService';
import CategoriesContainer from './CategoriesContainer';
import TemplatesContainer from './TemplatesContainer';
import NetworkService from '../../../services/NetworkService';
import {
  FetchUserAccounts,
} from './../../../redux/actions/user_actions';
import {useDispatch, useSelector} from 'react-redux';
import {
  IAccountBallance,
} from '../../../services/UserService';
import {
  getPayCategoriesServices,
  GetPaymentDetails,
  getPayTemplates,
} from '../../../redux/actions/payments_actions';
import {
  IPaymentState,
  IGlobalPaymentState,
  PAYMENTS_ACTIONS,
} from '../../../redux/action_types/payments_action_type';
import Routes from '../../../navigation/routes';
import {getNumber} from '../../../utils/Converter';
import NavigationService from '../../../services/NavigationService';
import { IUserState, IGloablState as IUserGlobalState } from '../../../redux/action_types/user_action_types';
import userStatuses from '../../../constants/userStatuses';

export interface IGetPaymentDetailParams {
  data: IGetPaymentDetailsRequest;
  onComplate?: Function;
  onError?: Function;
}

interface IProps {
  exclude?: boolean;
  selectdeAccount?: IAccountBallance | undefined;
}

const Payments: FC<IProps> = props => {
  const dispatch = useDispatch<any>();
  const [categories, setCategories] = useState<ICategory[]>();
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const PaymentStore = useSelector<IGlobalPaymentState>(
    state => state.PaymentsReducer,
  ) as IPaymentState;

  const userData = useSelector<IUserGlobalState>(
    state => state.UserReducer,
  ) as IUserState;

  const {documentVerificationStatusCode, customerVerificationStatusCode} =
  userData.userDetails || {};
  
  const isUserVerified =     documentVerificationStatusCode === userStatuses.Enum_Verified &&
  customerVerificationStatusCode === userStatuses.Enum_Verified

  const startPayFromTemplate = (template: ITemplates) => {
    if (isActionLoading) return;

    dispatch({
      type: PAYMENTS_ACTIONS.SET_PAYEMNT_ACTIVE_CATEGORY_TITLE,
      title: template.templName,
    });

    setIsActionLoading(true);

    const onComplate = () => {
      setIsActionLoading(false);
      gotoPaymentStep(Routes.Payments_INSERT_ACCOUNT_AND_AMOUNT);
    };

    dispatch({
      type: PAYMENTS_ACTIONS.SET_CURRENT_PAY_TEMPLATE,
      currentPayTemplate: template,
    });

    dispatch({
      type: PAYMENTS_ACTIONS.SET_CURRENT_PAYMENT_SERVICE,
      currentService: template,
    });

    dispatch({
      type: PAYMENTS_ACTIONS.SET_PAYMENT_DETAILS,
      paymentDetails: {...template},
    });

    dispatch({type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_SERVICE, isService: true});
    dispatch({
      type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_TEMPLATE,
      isTemplate: true,
    });

    onComplate();
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
      payTemplates[templateIndex].checkForPay =
        !payTemplates[templateIndex].checkForPay;
      dispatch({
        type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_TEMPLATE,
        PayTemplates: payTemplates,
      });
    }
  };

  const openPayTemplateEditAction = (template: ITemplates | undefined) => {
    dispatch({
      type: PAYMENTS_ACTIONS.SET_CURRENT_PAY_TEMPLATE,
      currentPayTemplate: template,
    });

    dispatch({
      type: PAYMENTS_ACTIONS.SET_PAYMENT_TEMPLATE_NAME,
      templName: template?.templName,
    });

    gotoPaymentStep(Routes.Payments_EditTemplate);
  };

  const gotoPayAll = () => {
    gotoPaymentStep(Routes.Payments_PAY_ALL, 0);
  };

  const getCategories = (
    parentID: number = 0,
    isService: boolean = false,
    hasService: boolean = false,
    hasChildren: boolean = false,
    navigate: boolean = false,
    categoryTitle: string = '',
  ) => {
    if (PaymentStore.isCategoriesLoading && !(!categories || !categories.length)) return;

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
      GetMerchantServices({CategoryID: parentID}, onComplate, onError);
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
           if (!categories) 

            {
              if(!isUserVerified) {
                const filtered = cats.map(c => {
                  if(c.categoryID !== 1 && c.categoryID != 7 && c.categoryID !== 13) {
                    c.cannotPay = true;
                  }
                  return c;
                });
                setCategories(filtered);
              } else {
                setCategories(cats);
              }
            }
            onComplate(cats);
          },
          onError,
        ),
      );
    }
  };

  const gotoPaymentStep = (
    url?: string,
    paymentStep?: number,
    icat?: ICategory[],
  ) => {
    NavigationService.navigate(url || Routes.Payments_STEP1, {
      paymentStep:
        getNumber(paymentStep) >= 0
          ? paymentStep
          : url || Routes.Payments_STEP1,
      step: 1,
      category: [...(icat || [])],
    });
  };

  const searchInPayCategories = (value: string) => {
    if (!value.length) {
      dispatch({type: PAYMENTS_ACTIONS.SET_PAYMENT_SERVICES, services: []});
      return;
    }

    NetworkService.CheckConnection(() => {
      PresentationService.SearchMerchants(value).subscribe({
        next: Response => {
          dispatch({
            type: PAYMENTS_ACTIONS.SET_PAYMENT_SERVICES,
            services: Response.data.data?.services || [],
          });
        },
      });
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

  const fetchAccounts = () => {
    NetworkService.CheckConnection(() => {
      dispatch(FetchUserAccounts());
    });
  };

  const fetchData = () => {
    dispatch(getPayTemplates());
    getCategories();
    fetchAccounts();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    NetworkService.CheckConnection(
      () => {
        fetchData();
      },
      () => {
        setRefreshing(false);
      },
    );
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if(!PaymentStore.isActionLoading && !PaymentStore.isCategoriesLoading && !PaymentStore.isTemplatesFetching) {
      setRefreshing(false);
    }
  }, [PaymentStore.isActionLoading, PaymentStore.isCategoriesLoading,PaymentStore.isTemplatesFetching])

  return (
    <DashboardLayout>
     <>
     {isActionLoading && (
        <FullScreenLoader background={colors.none} hideLoader />
      )}

      <ScrollView
        style={screenStyles.screenContainer}
        refreshControl={
          <RefreshControl
            progressBackgroundColor={colors.white}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }>
        <View style={screenStyles.wraper}>
       
            <CategoriesContainer
              categories={categories}
              Services={PaymentStore.services}
              isLoading={PaymentStore.isCategoriesLoading}
              isCategoriesFetching={
                PaymentStore.isCategoriesLoading && (!categories || !categories.length)
              }
              onSearch={searchInPayCategories}
              onViewCategory={(
                categoryID: number,
                isService: boolean,
                hasService: boolean,
                hasChildren: boolean,
                viewInAction: boolean,
                title: string,
              ) => {
                if (PaymentStore.services) {
                  dispatch({
                    type: PAYMENTS_ACTIONS.SET_PAYMENT_SERVICES,
                    services: [],
                  });
                }

                getCategories(
                  categoryID,
                  isService,
                  hasService,
                  hasChildren,
                  viewInAction,
                  title,
                );
              }}
            />
         
        </View>
        <View style={[screenStyles.wraper, styles.endof]}>
          <TemplatesContainer
            templates={PaymentStore.PayTemplates}
            isActionLoading={PaymentStore.isActionLoading}
            isTemplatesFetching={
              PaymentStore.isTemplatesFetching &&
              !PaymentStore.PayTemplates.length
            }
            onEditPayTemplate={openPayTemplateEditAction}
            onCheckForPayToggleHandle={checkForPayTemplateToggleHandle}
            onPay={startPayFromTemplate}
            payAll={gotoPayAll}
          />
        </View>
      </ScrollView>
     </>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  endof: {
    marginBottom: 30,
  },
});

export default Payments;

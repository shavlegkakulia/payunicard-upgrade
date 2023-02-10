import React, {FC} from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import colors from '../../../../constants/colors';
import NetworkService from '../../../../services/NetworkService';
import {
  ICategory,
  IMerchantServicesForTemplateRequest,
  IService,
} from '../../../../services/PresentationServive';
import {IAccountBallance} from '../../../../services/UserService';
import CategoryList from './CategoryList/CategoryList';
import {
  getPayCategoriesServices,
  GetPaymentDetails,
} from '../../../../redux/actions/payments_actions';
import {
  IGlobalPaymentState,
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../../../../redux/action_types/payments_action_type';
import {INavigationProps} from '../../transfers';
import {RouteProp, useRoute} from '@react-navigation/core';
import Routes from '../../../../navigation/routes';
import PresentationService from './../../../../services/PresentationServive';
import {subscriptionService} from '../../../../services/subscriptionService';
import {RESET_TRANSFER_STEPS_LOADING} from './CategoryList/CategoryItem';
import NavigationService from '../../../../services/NavigationService';

type RouteParamList = {
  params: {
    step: number;
    currentAccount: IAccountBallance | undefined;
    category: ICategory[],
    withTemplate: boolean
  };
};

const PaymentSteps: FC<INavigationProps> = props => {
  const dispatch = useDispatch<any>();;
  const PaymentStore = useSelector<IGlobalPaymentState>(
    state => state.PaymentsReducer,
  ) as IPaymentState;

  const route = useRoute<RouteProp<RouteParamList, 'params'>>();
  
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

  let categories: ICategory[] = [...route.params.category];
  
  if (categories?.some(a => a.hasChildren !== undefined)) {
    categories = [...categories]?.splice(route.params.step);
  }
  
  const getCategories = (
    parentID: number = 0,
    isService: boolean = false,
    hasService: boolean = false,
    hasChildren: boolean = false,
    navigate: boolean = false,
    categoryTitle: string = '',
  ) => {
    if (PaymentStore.isCategoriesLoading) return;

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

      currentService = [...(route.params.category || [])].filter(
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

      dispatch(
        GetPaymentDetails(
          {
            ForMerchantCode: merchantCode,
            ForMerchantServiceCode: merchantServiceCode,
            ForOpClassCode: 'B2B.F',
          },
          () => {
            dispatch({
              type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_SERVICE,
              isService: true,
            });
            let url = Routes.Payments_INSERT_ABONENT_CODE;
            onComplate(undefined, url);
          },
          onError,
        ),
      );
     
      return;
    }

    /* categories contains merchant and also service */
    if (!isService && hasService && !hasChildren) {
 
      GetMerchantServices(
        {CategoryID: parentID},
        (cat: ICategory[]) => {
          const index = parseInt(route.params.step.toString()) + 1;
          let url = Routes.Payments_STEP + index;
          onComplate(cat, url);
        },
        onError,
      );
    } /* categories contains merchants */ else if (
      !isService &&
      hasService &&
      hasChildren
    ) {
    
      dispatch(
        getPayCategoriesServices(
          parentID,
          (cat: ICategory[]) => {
            const index = parseInt(route.params.step.toString()) + 1;
            let url = Routes.Payments_STEP + index;
            onComplate(cat, url);
          },
          onError,
        ),
      );
    } /* categories contains only services */ else if (
      !isService &&
      !hasService
    ) {
    
      dispatch(
        getPayCategoriesServices(
          parentID,
          (cat: ICategory[]) => {
            const index = parseInt(route.params.step.toString()) + 1;
            let url = Routes.Payments_STEP + index;
            onComplate(cat, url);
          },
          onError,
        ),
      );
    }
  };

  const gotoPaymentStep = (url?: string, paymentStep?: number, icat?: ICategory[]) => {
    subscriptionService.sendData(RESET_TRANSFER_STEPS_LOADING, undefined);

    const index = parseInt(route.params.step.toString()) + 1;
    NavigationService.navigate(url, {
      paymentStep: url,
      step: index,
      category: [...(icat || [])],
      withTemplate: route.params.withTemplate
    });
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <View style={styles.catgegoryContainer}>
            {categories && (
              <CategoryList data={categories} onOpen={getCategories} />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  catgegoryContainer: {
    //paddingVertical: 40,
  },
  handleButton: {
    //marginVertical: 30,
  },
});

export default PaymentSteps;

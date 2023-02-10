import NetworkService from '../../services/NetworkService';
import {IGetPaymentDetailsRequest} from '../../services/PresentationServive';
import TemplatesService, {
  IPayTemplateAddRequest,
} from '../../services/TemplatesService';
import PresentationService from './../../services/PresentationServive';
import {
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../action_types/payments_action_type';
import TransactionService, {
  IGetDeptRequest,
  IRegisterPayTransactionRequest,
} from '../../services/TransactionService';
import { stringToObject } from '../../utils/utils';

export const mobileNetworkMerchantCategoryIds: Array<number | undefined> = [
  7, 33, 17, 8,
];

export const getPayTemplates = () => (dispatch: any) => {
  NetworkService.CheckConnection(() => {
    dispatch({
      type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_TEMPLATES_FETCHING,
      isTemplatesFetching: true,
    });
    TemplatesService.getTemplates().subscribe({
      next: Response => {
        let payTemplates = Response.data?.data?.templates || [];
        payTemplates.map(template => {
          template.checkForPay = true;
          if (template.merchantCode === 'SkyTel') {
            template.localDebt = template.debt;
            template.debt = template.debt && template.debt * -1;
          }

          return template;
        });

        dispatch({
          type: PAYMENTS_ACTIONS.SET_PAY_TEMPLATES,
          PayTemplates: payTemplates,
        });
      },
      complete: () => {
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_TEMPLATES_FETCHING,
          isTemplatesFetching: false,
        });
      },
      error: () => {
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_TEMPLATES_FETCHING,
          isTemplatesFetching: false,
        });
      },
    });
  });
};

export const deletePayTemplate = (payTempID: number) => (dispatch: any) => {
  NetworkService.CheckConnection(() => {
    dispatch({
      type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
      isActionLoading: true,
    });
    TemplatesService.deleteTemplate(payTempID).subscribe({
      next: Response => {
        if (Response.data.ok) {
          dispatch({
            type: PAYMENTS_ACTIONS.UPDATE_PAY_TEMPLATES_IN_DELETE,
            payTempID: payTempID,
          });
        }
      },
      complete: () =>
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
          isActionLoading: false,
        }),
      error: () =>
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
          isActionLoading: false,
        }),
    });
  });
};

export const addPayTemplate =
  (data: IPayTemplateAddRequest, callback: (status: boolean) => void) =>
  (dispatch: any) => {
    NetworkService.CheckConnection(
      () => {
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
          isActionLoading: true,
        });
        TemplatesService.addTemplate(data).subscribe({
          next: Response => {
            if (Response.data.ok) {
              // dispatch({
              //   type: PAYMENTS_ACTIONS.ADD_IN_PAY_TEMPLATE,
              //   currentPayTemplate: data,
              // });
              dispatch({
                type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
                isActionLoading: false,
              });
              callback(true);
            }
          },
          error: () => {
            dispatch({
              type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
              isActionLoading: false,
            });
            callback(false);
          },
        });
      },
      () =>
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
          isActionLoading: false,
        }),
    );
  };

export const editPayTemplate =
  (data: IPayTemplateAddRequest, callback: (status: boolean) => void) =>
  (dispatch: any) => {
    NetworkService.CheckConnection(
      () => {
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
          isActionLoading: true,
        });
        TemplatesService.editTemplate(data).subscribe({
          next: Response => {
            if (Response.data.ok) {
              dispatch({
                type: PAYMENTS_ACTIONS.UPDATE_PAY_TEMPLATE_NAME,
                templName: data.templName,
                payTempID: data.payTempID,
              });
            }
          },
          complete: () => {
            dispatch({
              type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
              isActionLoading: false,
            });
            callback(true);
          },
          error: () => {
            dispatch({
              type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
              isActionLoading: false,
            });
            callback(false);
          },
        });
      },
      () =>
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
          isActionLoading: false,
        }),
    );
  };

export const GetPaymentDetails =
  (
    data: IGetPaymentDetailsRequest,
    onComplate?: Function,
    onError?: Function,
  ) =>
  (dispatch: any) => {
    NetworkService.CheckConnection(() => {
      PresentationService.GetPaymentDetails(data).subscribe({
        next: Response => {
          dispatch({
            type: PAYMENTS_ACTIONS.SET_PAYMENT_DETAILS,
            paymentDetails: Response.data?.data,
          });
        },
        complete: () => onComplate && onComplate(),
        error: () => onError && onError(),
      });
    });
  };

export const getPayCategoriesServices =
  (parentID: number = 0, onComplate?: Function, onError?: Function) =>
  (dispatch: any) => {
    NetworkService.CheckConnection(() => {
      dispatch({type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_CATEGORIES_LOADING, isCategoriesLoading: true});
      PresentationService.GetCategories(parentID).subscribe({
        next: Response => {
          onComplate && onComplate(Response.data.data.categories);
        },
        error: () => {
          onError && onError();
          dispatch({type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_CATEGORIES_LOADING, isCategoriesLoading: false});
        },
        complete: () => {
          dispatch({type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_CATEGORIES_LOADING, isCategoriesLoading: false});
        }
      });
    });
  };

export const startPaymentTransaction =
  (data: IRegisterPayTransactionRequest, callback: (status: boolean) => void) =>
  (dispatch: any) => {
    dispatch({
      type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
      isActionLoading: true,
    });
    TransactionService.startPaymentTransaction(data).subscribe({
      next: Response => {
        dispatch({
          type: PAYMENTS_ACTIONS.SET_PAYMENT_TRANSACTION_DATA,
          paymentTransactionData: Response.data?.data,
        });
      },
      complete: () => {
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
          isActionLoading: false,
        });
        callback(true);
      },
      error: () => {
        dispatch({
          type: PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING,
          isActionLoading: false,
        });
        callback(false);
      },
    });
  };

export const onCheckDebt =
  (PaymentStore: IPaymentState, callback: Function) => (dispatch: any) => {
    //for mobile merchants not allowed checkdebt
    if (
      mobileNetworkMerchantCategoryIds.includes(
        PaymentStore.currentService?.categoryID,
      )
    ) {
      callback();
      return;
    }

    let abonentCode = PaymentStore.abonentCode;
    if((PaymentStore.paymentDetails?.forMerchantCode || PaymentStore.paymentDetails?.merchantCode) === 'PATRJAR') {
      abonentCode = PaymentStore.abonentCode + '/' + PaymentStore.carPlate;
    }
 
    const data: IGetDeptRequest = {
      forPaySPCode: PaymentStore.paymentDetails?.forPaySPCode || PaymentStore.paymentDetails?.forPaySpCode,
      forMerchantCode: PaymentStore.paymentDetails?.forMerchantCode || PaymentStore.paymentDetails?.merchantCode,
      forMerchantServiceCode:
        PaymentStore.paymentDetails?.forMerchantServiceCode || PaymentStore.paymentDetails?.merchantServiceCode,
      serviceId: PaymentStore.paymentDetails?.debtCode,
      abonentCode: abonentCode,
    };
  
    TransactionService.checkCostumerDebt(data).subscribe({
      next: Response => {
        if (Response.data.Ok) {
          dispatch({
            type: PAYMENTS_ACTIONS.PAYMENT_DEBTDATA,
            debtData: Response.data.Data?.Structures,
          });
        }
      },
      complete: () => {
        callback();
      },
      error: () => { 
        callback();
      },
    });
  };

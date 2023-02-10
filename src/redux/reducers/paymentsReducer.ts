import {
  IPaymentsActions,
  IPaymentState,
  PAYMENTS_ACTIONS,
} from '../action_types/payments_action_type';

const initialState: IPaymentState = {
  services: [],
  currentService: undefined,
  paymentDetails: undefined,
  paymentTransactionData: undefined,
  PayTemplates: [],
  currentPayTemplate: undefined,
  isActionLoading: false,
  isCategoriesLoading: true,
  isTemplatesFetching: false,
  isTemplate: false,
  isService: false,
  activeCategoryTitle: [],
  templName: undefined,
  merchants: [],
  title: undefined,
  selectedAccount: undefined,
  abonentCode: undefined,
  amount: undefined,
  carPlate: undefined,
  debtData: undefined,
  SearchServiceName: undefined,
};

export default function PaymentsReducer(
  state = initialState,
  actions: IPaymentsActions,
) {
  switch (actions.type) {
    case PAYMENTS_ACTIONS.RESET_PAYEMENT_DATA: {
      return {
        ...state,
        currentService: undefined,
        paymentDetails: undefined,
        paymentTransactionData: undefined,
        currentPayTemplate: undefined,
        isActionLoading: false,
        isCategoriesLoading: false,
        isTemplatesFetching: false,
        isTemplate: false,
        isService: false,
        activeCategoryTitle: [],
        templName: undefined,
        merchants: [],
        title: undefined,
        selectedAccount: undefined,
        abonentCode: undefined,
        amount: undefined,
        carPlate: undefined,
        debtData: undefined,
      };
    }

    case PAYMENTS_ACTIONS.SET_PAYMENT_SERVICES:
      return {
        ...state,
        services: actions.services,
      };

    case PAYMENTS_ACTIONS.SET_PAYMENT_SERACH_SERVICENAME:
      return {...state, SearchServiceName: actions.SearchServiceName};

    case PAYMENTS_ACTIONS.PAYMENT_SET_SELECTED_ACCOUNT: {
      return {
        ...state,
        selectedAccount: actions.selectedAccount,
      };
    }

    case PAYMENTS_ACTIONS.PAYMENT_SET_ABONENT_CODE:
      return {
        ...state,
        abonentCode: actions.abonentCode,
      };

    case PAYMENTS_ACTIONS.PAYMENT_SET_AMOUNT:
      return {
        ...state,
        amount: actions.amount,
      };

    case PAYMENTS_ACTIONS.PAYMENT_SET_CARPLATE:
      return {
        ...state,
        carPlate: actions.carPlate,
      };

    case PAYMENTS_ACTIONS.PAYMENT_DEBTDATA:
      return {
        ...state,
        debtData: actions.debtData,
      };

    case PAYMENTS_ACTIONS.SET_CURRENT_PAYMENT_SERVICE:
      return {
        ...state,
        currentService: actions.currentService,
      };

    case PAYMENTS_ACTIONS.SET_PAYMENT_DETAILS:
      return {
        ...state,
        paymentDetails: actions.paymentDetails,
      };

    case PAYMENTS_ACTIONS.SET_PAYMENT_TRANSACTION_DATA:
      return {
        ...state,
        paymentTransactionData: actions.paymentTransactionData,
      };

    case PAYMENTS_ACTIONS.SET_PAY_TEMPLATES:
      return {
        ...state,
        PayTemplates: actions.PayTemplates,
      };

    case PAYMENTS_ACTIONS.SET_CURRENT_PAY_TEMPLATE:
      return {
        ...state,
        currentPayTemplate: actions.currentPayTemplate,
      };

    case PAYMENTS_ACTIONS.SET_IS_PAYMENT_ACTION_LOADING:
      return {
        ...state,
        isActionLoading: actions.isActionLoading,
      };

    case PAYMENTS_ACTIONS.SET_IS_PAYMENT_CATEGORIES_LOADING:
      return {
        ...state,
        isCategoriesLoading: actions.isCategoriesLoading,
      };

    case PAYMENTS_ACTIONS.SET_IS_PAYMENT_TEMPLATES_FETCHING:
      return {
        ...state,
        isTemplatesFetching: actions.isTemplatesFetching,
      };

    case PAYMENTS_ACTIONS.SET_IS_PAYMENT_TEMPLATE:
      return {
        ...state,
        isTemplate: actions.isTemplate,
      };

    case PAYMENTS_ACTIONS.SET_IS_PAYMENT_SERVICE:
      return {
        ...state,
        isService: actions.isService,
      };

    case PAYMENTS_ACTIONS.SET_PAYEMNT_ACTIVE_CATEGORY_TITLE:
      return {
        ...state,
        activeCategoryTitle: state.activeCategoryTitle[0]
          ? [...state.activeCategoryTitle, actions.title]
          : [actions.title],
      };

    case PAYMENTS_ACTIONS.SET_PAYMENT_TEMPLATE_NAME:
      return {
        ...state,
        templName: actions.templName,
      };

    case PAYMENTS_ACTIONS.UPDATE_PAY_TEMPLATES_IN_DELETE:
      return {
        ...state,
        PayTemplates: state.PayTemplates.filter(
          t => t.payTempID !== actions.payTempID,
        ),
      };

    case PAYMENTS_ACTIONS.ADD_IN_PAY_TEMPLATE:
      return {
        ...state,
        PayTemplates: [...state.PayTemplates, actions.currentPayTemplate],
      };

    case PAYMENTS_ACTIONS.UPDATE_PAY_TEMPLATE_NAME: {
      const payTemplates = [...state.PayTemplates];
      const templateIndex = payTemplates.findIndex(
        template => template.payTempID === actions.payTempID,
      );
      if (templateIndex >= 0) {
        payTemplates[templateIndex].templName = actions.templName;
        return {
          ...state,
          PayTemplates: [...payTemplates],
        };
      }
    }

    default:
      return {...state};
  }
}

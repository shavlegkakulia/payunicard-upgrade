import {
  ITransfersActions,
  ITransfersState,
  TRANSFERS_ACTION_TYPES,
} from '../action_types/transfers_action_types';

const initialState: ITransfersState = {
  isTemplatesLoading: false,
  transferTemplates: [],
  benificarAccount: undefined,
  benificarName: undefined,
  amount: undefined,
  transactionResponse: undefined,
  isTemplate: false,
  nomination: undefined,
  transferType: undefined,
  templateName: undefined,
  isLoading: false,
  fullScreenLoading: false,
  selectedFromAccount: undefined,
  selectedToAccount: undefined,
  selectedFromCurrency: undefined,
  selectedToCurrency: undefined,
  reciverSwift: undefined,
  reciverAddress: undefined,
  reciverCity: undefined,
  reciverCountry: undefined,
};

export default function TransfersReducer(
  state: ITransfersState = initialState,
  action: ITransfersActions,
) {
  switch (action.type) {
    case TRANSFERS_ACTION_TYPES.SET_ISTEMPLATES_LOADING:
      return {...state, isTemplatesLoading: action.isTemplatesLoading};

    case TRANSFERS_ACTION_TYPES.SET_TRANSFER_TEMPLATES:
      return {...state, transferTemplates: action.transferTemplates};

    case TRANSFERS_ACTION_TYPES.SET_BENIFICARY_ACCOUNT:
      return {...state, benificarAccount: action.benificarAccount};

    case TRANSFERS_ACTION_TYPES.SET_BENIFICARY_NAME:
      return {...state, benificarName: action.benificarName};

    case TRANSFERS_ACTION_TYPES.SET_AMOUNT:
      return {...state, amount: action.amount};

    case TRANSFERS_ACTION_TYPES.SET_TRANSACTION_RESPONSE:
      return {...state, transactionResponse: action.transactionResponse};

    case TRANSFERS_ACTION_TYPES.SET_IS_TEMPLATE:
      return {...state, isTemplate: action.isTemplate};

    case TRANSFERS_ACTION_TYPES.SET_NOMINATION:
      return {...state, nomination: action.nomination};

    case TRANSFERS_ACTION_TYPES.SET_TRASNSFER_TYPE:
      return {...state, transferType: action.transferType};

    case TRANSFERS_ACTION_TYPES.SET_TEMPLATE_NAME:
      return {...state, templateName: action.templateName};

    case TRANSFERS_ACTION_TYPES.SET_ISLOADING:
      return {...state, isLoading: action.isLoading};

    case TRANSFERS_ACTION_TYPES.SET_FULLSCREEN_LODING:
      return {...state, fullScreenLoading: action.fullScreenLoading};

    case TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_ACCOUNT:
      return {...state, selectedFromAccount: action.selectedFromAccount};

    case TRANSFERS_ACTION_TYPES.SET_SELECTED_TO_ACCOUNT:
      return {...state, selectedToAccount: action.selectedToAccount};

    case TRANSFERS_ACTION_TYPES.SET_SELECTED_FROM_CURRENCY:
      return {...state, selectedFromCurrency: action.selectedFromCurrency};

    case TRANSFERS_ACTION_TYPES.SET_SELECTED_TO_CURRENCY:
      return {...state, selectedToCurrency: action.selectedToCurrency};

    case TRANSFERS_ACTION_TYPES.SET_RECIVER_SWIFT:
      return {...state, reciverSwift: action.reciverSwift};

    case TRANSFERS_ACTION_TYPES.SET_RECIVER_ADDRESS:
      return {...state, reciverAddress: action.reciverAddress};

    case TRANSFERS_ACTION_TYPES.SET_RECIVER_CITY:
      return {...state, reciverCity: action.reciverCity};

    case TRANSFERS_ACTION_TYPES.SET_RECIVER_COUNTRYCODE:
      return {...state, reciverCountry: action.reciverCountry};

    case TRANSFERS_ACTION_TYPES.RESET_TRANSFER_STATES: {
      let restart = {
        benificarAccount: undefined,
        benificarName: undefined,
        amount: undefined,
        transactionResponse: undefined,
        isTemplate: false,
        nomination: undefined,
        transferType: undefined,
        templateName: undefined,
        isLoading: false,
        fullScreenLoading: false,
        selectedFromAccount: undefined,
        selectedToAccount: undefined,
        selectedFromCurrency: undefined,
        selectedToCurrency: undefined,
        reciverSwift: undefined,
        reciverAddress: undefined,
        reciverCity: undefined,
        reciverCountry: undefined,
      };

      if (state.transferTemplates.length > 0) {
        restart = Object.assign(restart, {isTemplatesLoading: false});
      }
      return {...state, ...restart};
    }

    default:
      return {...state};
  }
}

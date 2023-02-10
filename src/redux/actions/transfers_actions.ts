import TemplatesService, {
  IAddTransferTemplateRequest,
} from '../../services/TemplatesService';
import TransactionService, {
  IP2PTransactionRequest,
} from '../../services/TransactionService';
import {TRANSFERS_ACTION_TYPES} from './../action_types/transfers_action_types';

export const addTransactionTemplate =
  (data: IAddTransferTemplateRequest, callBack?: () => void) =>
  (dispatch: any) => {
    dispatch({type: TRANSFERS_ACTION_TYPES.SET_ISLOADING, isLoading: true});
    TemplatesService.addTransactionTemplate(data).subscribe({
      next: Response => {
        if (Response.data.ok) {
          callBack && callBack();
        }
      },
      complete: () => {
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_ISLOADING,
          isLoading: false,
        });
      },
      error: () => {
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_ISLOADING,
          isLoading: false,
        });
      },
    });
  };

export const getTransferTemplates =
  (callBack?: () => void) => (dispatch: any) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_ISTEMPLATES_LOADING,
      isTemplatesLoading: true,
    });
    TemplatesService.getTransferTemplates().subscribe({
      next: Response => {
        const templates = [...(Response.data?.data?.templates || [])];
        templates.sort((a, b) => {
          return a.isFavourite === b.isFavourite ? 0 : a.isFavourite ? -1 : 1;
        });
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_TRANSFER_TEMPLATES,
          transferTemplates: templates,
        });
      },
      complete: () => {
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_ISTEMPLATES_LOADING,
          isTemplatesLoading: false,
        });
        callBack && callBack();
      },
      error: () => {
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_ISTEMPLATES_LOADING,
          isTemplatesLoading: false,
        });
      },
    });
  };

  export const MakeP2PForeignTransaction = (data: IP2PTransactionRequest) => (dispatch: any) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_ISLOADING,
      isLoading: true,
    });
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_FULLSCREEN_LODING,
      fullScreenLoading: true,
    });
    TransactionService.makeP2PForeignTransaction(data).subscribe({
      next: Response => {
      dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_TRANSACTION_RESPONSE,
          transactionResponse: {...Response.data.data},
        });
      },
      complete: () => {
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_ISLOADING,
          isLoading: false,
        });
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_FULLSCREEN_LODING,
          fullScreenLoading: false,
        });
      },
      error: _ => {
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_ISLOADING,
          isLoading: false,
        });
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_FULLSCREEN_LODING,
          fullScreenLoading: false,
        });
      },
    });
  }

export const MakeTransaction =
  (toBank: boolean = false, data: IP2PTransactionRequest = {
    beneficiaryBankName: undefined,
    beneficiaryBankCode: undefined,
    recipientAddress: undefined,
    recipientCity: undefined,
    beneficiaryRegistrationCountryCode: undefined
  }) =>
  (dispatch: any) => {
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_ISLOADING,
      isLoading: true,
    });
    dispatch({
      type: TRANSFERS_ACTION_TYPES.SET_FULLSCREEN_LODING,
      fullScreenLoading: true,
    });
    TransactionService.makeTransaction(toBank, data).subscribe({
      next: Response => {
      dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_TRANSACTION_RESPONSE,
          transactionResponse: {...Response.data.data},
        });
      },
      complete: () => {
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_ISLOADING,
          isLoading: false,
        });
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_FULLSCREEN_LODING,
          fullScreenLoading: false,
        });
      },
      error: _ => {
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_ISLOADING,
          isLoading: false,
        });
        dispatch({
          type: TRANSFERS_ACTION_TYPES.SET_FULLSCREEN_LODING,
          fullScreenLoading: false,
        });
      },
    });
  };

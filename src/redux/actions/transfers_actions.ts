import { getString } from './../../utils/Converter';
import TemplatesService, {
  IAddTransferTemplateRequest,
} from '../../services/TemplatesService';
import TransactionService, {
  IP2PTransactionRequest,
} from '../../services/TransactionService';
import {TRANSFERS_ACTION_TYPES} from './../action_types/transfers_action_types';
import { PUSH } from './error_action';

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

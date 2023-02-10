import axios from 'axios';
import {from} from 'rxjs';
import TemplatesService, {
  IAddTransferTemplateRequest, IError,
} from './TemplatesService';
import envs from '../../config/env';

export interface IGetSwiftResponseDataItem { 
  bankName?: string,
  swiftCode?: string,
  bankAddress?: string
}

export interface IGetSwiftResponseData { 
  categories?: IGetSwiftResponseDataItem[]
}

export interface IGetSwiftResponse {
  ok?: boolean;
  errors?: IError[] | undefined;
  data?: IGetSwiftResponseData
}

export const _addTransactionTemplate = (
  data: IAddTransferTemplateRequest,
  startProcessing: (value: boolean) => void,
  endingProcessing: (value: boolean) => void,
  callBack: (value: boolean) => void,
) => {
  startProcessing(true);

  TemplatesService.addTransactionTemplate(data).subscribe({
    next: Response => {
      if (Response.data.ok) {
        callBack(true);
      }
    },
    complete: () => {
      endingProcessing(false);
    },
    error: () => {
      endingProcessing(false);
    },
  });
};

export const GetSwiftCategories = (bankName: string, swiftCode: string) => {
  let q = '';
  if (
    (swiftCode === undefined || swiftCode === '') &&
    (bankName === undefined || bankName === '')
  ) {
    q = 'bankName=biv';
  }
  if (bankName === undefined || bankName === '') {
    q = 'bankName=biv';
  }
  if (bankName !== undefined && bankName !== '') {
    q = 'bankName=' + bankName;
  }

  if (swiftCode !== undefined && swiftCode !== '') {
    q = '&swiftCode=' + swiftCode;
  }

  const promise = axios.get<IGetSwiftResponse>(
    `${envs.API_URL}GetSwiftCategories?${q}`,
    {objectResponse: true},
  );
  return from(promise);
};

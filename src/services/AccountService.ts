import axios from 'axios';
import {from} from 'rxjs';
import envs from '../../config/env';
import { IEnv } from './AuthService';
import {IError} from './TemplatesService';

export interface IBlockCardRequest {
  cardId?: number;
  description?: string | undefined;
}

export interface IBlockCardResponse {
  ufcCardId?: number;
}

export interface IBlockCardResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IBlockCardResponse | undefined;
}

export interface IGetPinRequest {
  cardid?: number;
  otp?: string | undefined;
}

export interface IGetPinResponse {}

export interface IGetPinResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetPinResponse | undefined;
}

export interface IUnBlockCardRequest {
  cardId?: number;
}

export interface IUnBlockCardResponse {
  ufcCardId?: number;
}

export interface IUnBlockCardResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IUnBlockCardResponse | undefined;
}

class AccountServise {
  _envs: IEnv | any;
  constructor() {
    envs().then(res => this._envs = res);
  }
   Block(data: IBlockCardRequest) {
    let form: IBlockCardRequest = {
      cardId: data.cardId,
    };
    
    if (data.description) {
      form = {...form, description: data.description};
    }
    const promise = axios.post<IBlockCardResponseData>(
      `${this._envs.API_URL}Card/Block`,
      form,
      {objectResponse: true}
    );
    return from(promise);
  }

   UnBlock(data: IUnBlockCardRequest) {
    let form: IUnBlockCardRequest = {
      cardId: data.cardId,
    };
    
    const promise = axios.post<IUnBlockCardResponseData>(
      `${this._envs.API_URL}Card/UnBlock`,
      form,
      {objectResponse: true}
    );
    return from(promise);
  }

   pin(data: IGetPinRequest) {
    const form: IGetPinRequest = {
        cardid: data.cardid,
        otp: data.otp
    }
    
    const promise = axios.post<IGetPinResponseData>(
      `${this._envs.API_URL}Card/pin`,
      form,
      {objectResponse: true}
    );
    return from(promise);
  }

   ExportWalletAccountDetails (ccy: string, isGel: boolean) {
    
    let queryStr = `${this._envs.API_URL}api/v2/User/ExportWalletAccountDetailsMobile?ccy=${ccy}`;
    if (isGel) {
      queryStr += `&isGel=${true}`
    } console.log(queryStr)
    const promise = axios.get<{ path?: string }>(
      queryStr, {objectResponse: true}
    );
    return from(promise);
  }
}

export default new AccountServise();

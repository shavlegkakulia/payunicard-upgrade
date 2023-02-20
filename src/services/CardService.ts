import axios from 'axios';
import { from } from 'rxjs';
import envs from '../../config/env';
import { IEnv } from './AuthService';
import { IError } from './TemplatesService';

export interface IGetCardOrderingTariffAmountRequest {
  T1Q: string | undefined;
  T2Q: string | undefined;
  cityId?: number | undefined | null;
  paketTypeId?: number | undefined | null;
  accountNumberCH?: string | undefined | null;
}

export interface IGetCardOrderingTariffAmountResponse {
  tariffAmount?: number;
  ccy?: string | undefined;
  deliveryAmount?: number;
  deliveriCCY?: string | undefined;
}

export interface IGetCardOrderingTariffAmountResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetCardOrderingTariffAmountResponse | undefined;
}

export interface IGetBarcodeRequest {
  input: string;
}

export interface IGenerateBarcodeResponse {
  barcode: string | undefined;
}

export interface IGenerateBarcodeResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGenerateBarcodeResponse | undefined;
}

export interface IAddBankCardResponse {
  redirectUrl?: string | undefined;
}

export interface IAddBankCardResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IAddBankCardResponse | undefined;
}

export interface ITransaction {
  card?: string | undefined;
  tranname?: string | undefined;
  bonusamount?: number;
  datetime?: Date;
  terminalid?: string | undefined;
  merchantid?: string | undefined;
  tranztype?: number;
}

export interface IGetUnicardStatementResponse {
  transactions?: ITransaction[] | undefined;
}

export interface IGetUnicardStatementResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetUnicardStatementResponse | undefined;
}

export interface IGetUnicardStatementRequest {
  card?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

export interface IGetCardDetailsRequest {
  cardId: number,
  otp: string,
}

export interface IGetCardDetailsResponse {
  data: {
    encryptedCard: string;
    uuId: string;
  };
  errors?: null | any
  ok:boolean
}

class CardService {
  _envs: IEnv | any;
  constructor() {
    envs().then(res => this._envs = res);
  }
   getCardOrderingTariffAmount(data: IGetCardOrderingTariffAmountRequest) {
    
    let qString = `CardTypeCount=T1_Q${data.T1Q}%3BT2_Q${data.T2Q}%3B`;
    if (data.cityId) {
      qString += `&CityId=${data.cityId}`;
    }
    if (data.accountNumberCH) {
      qString += `&AccountNumberCH=${data.accountNumberCH}`;
    }
    const promise = axios.get<IGetCardOrderingTariffAmountResponseData>(
      `${this._envs.API_URL}Card/GetCardOrderingTariffAmount?${qString}`,
    );
    return from(promise);
  }

   GenerateBarcode(data: IGetBarcodeRequest) {
    
    const promise = axios.post<IGenerateBarcodeResponseData>(
      `${this._envs.API_URL}Files/GenerateBarcode`,
      data,
    );
    return from(promise);
  }

   AddUserBankCard() {
    
    const promise = axios.get<IAddBankCardResponseData>(
      `${this._envs.API_URL}Card/addUserBankCard`,
    );
    return from(promise);
  }

   GetUnicardStatement(
    data: IGetUnicardStatementRequest
  ) {
    
    let qString = `?`;
    if (data.card) {
      qString += `card=${data.card}`;
    }
    if (data.from) {
      qString += `&from=${data.from}`;
    }
    if (data.to) {
      qString += `&to=${data.to}`;
    }

    const promise = axios.get<IGetUnicardStatementResponseData>(
      `${this._envs.API_URL}Card/GetUnicardStatement${qString}`,
    );
    return from(promise);
  }

   PrepareForDigitalCard(data: IGetCardDetailsRequest) {
    
    return axios.post<IGetCardDetailsResponse>( `${this._envs.API_URL}Card/PrepareDigitalCard`, data)
  }
}

export default new CardService();

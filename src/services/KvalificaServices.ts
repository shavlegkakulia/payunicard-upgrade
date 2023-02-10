import axios from 'axios';
import {from} from 'rxjs';
import envs from '../../config/env';
import {IError} from './TemplatesService';

export const getKycFullYear = (year: string) => {
  if(year){
      let x = year.split('-');
      let date = new Date();
      date.setFullYear(parseInt(x[x.length -1]));
      return isNaN(date.getFullYear()) ?  '' : date.getFullYear().toString();
  } else {
      return ''
  }
}

export interface ICheckKycResponse {
  skipKycSession?: boolean;
}

export interface ICheckKycResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: ICheckKycResponse | undefined;
}

export interface IKCData {
  firstName?: string | undefined;
  lastName?: string | undefined;
  birthDate?: string | undefined;
  issueDate?: string;
  validTo?: string;
  expirationDate?: string | undefined;
  sex?: string | undefined;
  nationality?: string | undefined;
  documentNumber?: string | undefined;
  personalNumber?: string | undefined;
  documentFrontSide?: string | undefined;
  documentBackSide?: string | undefined;
  documetType?: string | undefined;
  selfImages?: string[] | undefined;
  verified?: boolean;
  status?: string | undefined;
  countryID?: number;
  countryName?: string | undefined;
  customerSelfContent?: string | undefined;
  customerSelfName?: string | undefined;
  customerSelf?: string | undefined;
  documentBackSideContent?: string | undefined;
  documentBackSideName?: string | undefined;
  documentFrontSideContent?: string | undefined;
  documentFrontSideName?: string | undefined;
  birthCityId?: number | undefined;
  birthCountryID?: string;
}

export interface IGetUserKycDataResponse {
  data?: IKCData[] | undefined;
}

export interface IGetUserKycDataResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetUserKycDataResponse | undefined;
}

export interface ICloseSessionForSdkResponse extends IKCData {}

export interface ICloseSessionForSdkResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: ICloseSessionForSdkResponse | undefined;
}

class KvalificaService {
  CheckKycSession() {
    const promise = axios.get<ICheckKycResponseData>(
      `${envs.API_URL}Kyc/CheckKyc`,
      {objectResponse: true},
    );
    return from(promise);
  }

  CheckKycForReprocess() {
    const promise = axios.get<ICheckKycResponseData>(
      `${envs.API_URL}Kyc/CheckKycForReprocess`,
      {objectResponse: true},
    );
    return from(promise);
  }

  GetKycSessionData() {
    const promise = axios.get<IGetUserKycDataResponseData>(
      `${envs.API_URL}Kyc/GetSessionData?GetList=false`,
      {objectResponse: true},
    );
    return from(promise);
  }

  CloseKycSession(id: string) {
    const promise = axios.get<ICloseSessionForSdkResponseData>(
      `${envs.API_URL}Kyc/CloseSessionForSdk?SessionId=${id}`,
      {objectResponse: true},
    );
    return from(promise);
  }
}

export default new KvalificaService();

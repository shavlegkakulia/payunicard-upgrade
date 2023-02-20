import axios from 'axios';
import { from } from 'rxjs';
import envs from './../../config/env';
import { IEnv } from './AuthService';

export class IError {
    errorMessage?: string | undefined;
    code?: number;
    displayText?: string | undefined;
}

export interface ITemplates {
    payTempID?: number;
    forOpClassCode?: string | undefined;
    abonentCode?: string | undefined;
    userID?: number;
    forFromAccount?: number;
    forToAccount?: number;
    amount?: number;
    unicard?: string | undefined;
    merchantServiceID?: number;
    merchantCode?: string | undefined;
    merchantServiceCode?: string | undefined;
    categoryID?: number;
    merchServiceName?: string | undefined;
    debt?: number | undefined;
    debtCode?:string | undefined;
    templName?: string | undefined;
    imageUrl?: string | undefined;
    abonentName?: string | undefined;
    abonentAddress?: string | undefined;
    isFavourite?: boolean;
    canPayWithUnipoints?: number | undefined;
    /*additional*/
    checkForPay?: boolean;
    forPaySpCode?: string;
    //property fro skytel reverse value
    localDebt?: number | undefined;
}

export interface IPayTemplateGetResponse {
    templates?: ITemplates[] | undefined;
}

export interface IPayTemplates {
    data?: IPayTemplateGetResponse;
    errors?: IError[], 
    ok?: boolean
}

export interface ITemplateDeleteResponse {
    data?: any, 
    errors?: IError[], 
    ok?: boolean
}

export interface ITransferTemplate {
    templateId?: number;
    longopId?: number | undefined;
    templName?: string | undefined;
    opClassCode?: string | undefined;
    forFromAccountId?: number;
    forToAccountId?: number;
    forFromExternalAccountId?: number;
    forToExternalAccountId?: number;
    amount?: string | undefined;
    ccyFrom?: string | undefined;
    ccyTo?: string | undefined;
    description?: string | undefined;
    senderAccountNumber?: string | undefined;
    beneficiaryAccountNumber?: string | undefined;
    payerInn?: string | undefined;
    payerName?: string | undefined;
    beneficiaryInn?: string | undefined;
    beneficiaryName?: string | undefined;
    toCustomerName?: string | undefined;
    isBetweenOwnAccounts?: boolean;
    accountNumber?: string | undefined;
    fromAccountNumber?: string | undefined;
    toAccountNumber?: string | undefined;
    imageUrl?: string | undefined;
    isFavourite?: boolean;
}

export interface ITemplateListByUserResponse {
    templates?: ITransferTemplate[] | undefined;
}

export interface IGetTemplateListByUserResponse {
    ok: boolean;
    errors?: IError[] | undefined;
    data?: ITemplateListByUserResponse | undefined;
}

export interface IPayTemplateAddRequest {
    longOpID?: number | undefined;
    templName?: string | undefined;
    forOpClassCode?: string | undefined;
    abonentCode?: string | undefined;
    forFromAccount?: number | undefined;
    amount?: number;
    payTempID?:number | undefined;
    unicard?: string | undefined;
    merchantServiceID?: number | undefined;
    externalAccountId?: number | undefined;
    isFavourite?: boolean;
}

export interface IPayTemplateAddResponse {
}

export interface IMPayTemplateAddResponseData {
    ok: boolean;
    errors?: IError[] | undefined;
    data?: IPayTemplateAddResponse | undefined;
}

export interface IAddTransferTemplateRequest {
    longopId?: number | undefined;
    templName?: string | undefined;
    opClassCode?: string | undefined;
    forFromAccountId?: number;
    forToAccountId?: number;
    forFromExternalAccountId?: number;
    forToExternalAccount?: string | undefined;
    amount?: string | undefined;
    ccyFrom?: string | undefined;
    ccyTo?: string | undefined;
    description?: string | undefined;
    senderAccountNumber?: string | undefined;
    beneficiaryAccountNumber?: string | undefined;
    payerInn?: string | undefined;
    payerName?: string | undefined;
    beneficiaryInn?: string | undefined;
    beneficiaryName?: string | undefined;
    imageUrl?: string | undefined;
    isFavourite?: boolean;
    isBetweenOwnAccounts?:boolean;
}

export interface IAddTransferTemplateResponse {}

export interface IAddTransferTemplateResponseData {
    ok?: boolean;
    errors?: IError[] | undefined;
    data?: IAddTransferTemplateResponse | undefined;
}

export interface IDeactivateUserTemplateResponse {
}

export interface IDeactivateUserTemplateRequest {
    templId?: number;
}

export interface IIResponseOfDeactivateUserTemplateResponse {
    ok: boolean;
    errors?: IError[] | undefined;
    data?: IDeactivateUserTemplateResponse | undefined;
}

export interface IPayTemplateEditRequest {
    templId?: number;
    templName?: string | undefined;
    imageUrl?: string | undefined;
    isFavourite?: boolean;
    forToExternalAccount?: string | undefined;
    forFromExternalAccount?: string | undefined;
    forFromExternalAccountId?: number | undefined;
    ccyTo?: string | undefined;
    opClassCode?: string | undefined;
    amount?: number | undefined;
    ccyFrom?: string | undefined;
    description?: string | undefined;
    beneficiaryAccountNumber?: string | undefined;
    beneficiaryInn?: string | undefined;
    beneficiaryName?: string | undefined;
    toCustomerName?: string | undefined;
}

export interface IPreRegistrationResponse {
    response?: string | undefined;
}

export interface IPayTemplateEditResponseData {
    ok: boolean;
    errors?: IError[] | undefined;
    data?: IPreRegistrationResponse | undefined;
}

class TemplatesService {
    _envs: IEnv | any;
  constructor() {
    envs().then(res => this._envs = res);
  }
     getTemplates() {
        
        const promise = axios.get<IPayTemplates>(`${this._envs.API_URL}Template/PayTemplateGet?IncludeDebt=true`);
        return from(promise);
    }

     deleteTemplate(payTempID: number) {
        
        const promise = axios.post<ITemplateDeleteResponse>(`${this._envs.API_URL}Template/PayTemplateDeActivate`, { payTempID });
        return from(promise);
    }

     addTemplate(data: IPayTemplateAddRequest) {
        
        const promise = axios.post<IMPayTemplateAddResponseData>(`${this._envs.API_URL}Template/PayTemplateAdd`, data, {objectResponse:true});
        return from(promise);
    }

     editTemplate(data: IPayTemplateAddRequest) {
        
        const promise = axios.post<IMPayTemplateAddResponseData>(`${this._envs.API_URL}Template/EditPayTemplate`, data, {objectResponse:true});
        return from(promise);
    }

     getTransferTemplates() {
        
        const promise = axios.get<IGetTemplateListByUserResponse>(`${this._envs.API_URL}Template/GetTransactionTemplates`);
        return from(promise);
    }

     addTransactionTemplate(data: IAddTransferTemplateRequest) {
        
        const promise = axios.post<IAddTransferTemplateResponseData>(`${this._envs.API_URL}Template/AddTransactionTemplate`, data, {objectResponse:true});
        return from(promise);
    }

     deactivateUserTemplate(data: IDeactivateUserTemplateRequest) {
        
        const promise = axios.post<IIResponseOfDeactivateUserTemplateResponse>(`${this._envs.API_URL}Template/DeactivateUserTemplate`, data, {objectResponse:true});
        return from(promise);
    }

     transactionTemplateEdit(data: IPayTemplateEditRequest) {
        
        const promise = axios.post<IPayTemplateEditResponseData>(`${this._envs.API_URL}Template/transactionTemplateEdit`, data, {objectResponse:true});
        return from(promise);
    }
}

export default new TemplatesService();
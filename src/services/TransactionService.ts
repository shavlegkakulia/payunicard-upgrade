import axios from 'axios';
import {from} from 'rxjs';
import envs from '../../config/env';
import {IError} from './TemplatesService';

export interface IGetDeptRequest {
  abonentCode?: string | undefined;
  forPaySPCode?: string | undefined;
  serviceId?: string | undefined;
  forMerchantCode?: string | undefined;
  forMerchantServiceCode?: string | undefined;
}

export interface IGetDeptResponseData {
  Ok?: boolean;
  errors?: IError[] | undefined;
  Data?: IGetDeptResponse | undefined;
}

export interface IGetDeptResponse {
  Structures?: IStructure[] | undefined;
  isMany?: boolean;
}

export interface IStructure {
  FieldCode?: string | undefined;
  FieldName?: string | undefined;
  CCY?: string | undefined;
  Value?: string | undefined;
  FieldType?: string | undefined;
}

export interface IRegisterPayTransactionRequest {
  forOpClassCode?: string | undefined;
  forFundsSPCode?: string | undefined;
  forMerchantCode?: string | undefined;
  forMerchantServiceCode?: string | undefined;
  AccountId?: string | undefined;
  amount?: string | undefined;
  serviceId?: string | undefined;
  abonentCode?: string | undefined;
  forPaySPCode?: string | undefined;
}

export interface IRegisterPayTransactionResponse {
  redirectUrl?: string | undefined;
  op_id?: number;
  op_guid?: string | undefined;
  status?: string | undefined;
  socketurl?: string | undefined;
  isecommerce?: boolean;
  isRecurring?: boolean | undefined;
  recurringTransactionId?: string | undefined;
}

export interface IRegisterPayTransactionResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data: IRegisterPayTransactionResponse;
}

export interface ISendUnicardOtpResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: ISendUnicardOtpResponse | undefined;
}

export interface ISendUnicardOtpResponse {
  otpGuid?: string | undefined;
}

export interface ISendUnicardOtpRequest {
  card?: string | undefined;
}

export interface IRegisterBatchPayTransactionRequest {
  transactions?: IRegisterPayBatchTransactionRequest[] | undefined;
}

export interface IRegisterPayBatchTransactionRequest {
  forMerchantCode?: string | undefined;
  forMerchantServiceCode?: string | undefined;
  amount?: number;
  abonentCode?: string | undefined;
  forPaySPCode?: string | undefined;
  bankId?: number | undefined | null;
  accountId?: number | undefined | null;
  forFundsSPCode?: string | undefined;
  serviceId?: string | undefined;
  userId?: number | undefined;
  bankCardId?: number | undefined;
  isRecurring?: boolean | undefined;
  unicardOtpGuid?: string | undefined;
  unicard?: string | undefined;
  unicardOtp?: string | undefined;
  forOpClassCode?: string | undefined;
  AccountId?: number | undefined;
}

export interface IRegisterPayBatchTransactionResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IRegisterPayBatchTransactionResponse | undefined;
}

export interface IRegisterPayBatchTransactionResponse {
  redirectUrl?: string | undefined;
  op_id?: number;
  op_guid?: string | undefined;
  status?: string | undefined;
  socketurl?: string | undefined;
  isecommerce?: boolean;
  isRecurring?: boolean | undefined;
  recurringTransactionId?: string | undefined;
}

export interface IP2BTransactionRequest {
  beneficiaryName?: string | undefined;
  nomination?: string | undefined;
}

export interface IP2PTransactionRequest extends IP2BTransactionRequest {
  toAccountNumber?: string | undefined;
  fromAccountNumber?: string | undefined;
  amount?: number;
  otp?: string | undefined | null;
  otpSource?: string | undefined;
  opClassCode?: string
  beneficiaryName?: string;
  nomination?: string;
  Nomination?: string;
  description?: string;
  culture?: string;
  intermediaryBankCode?: string;
  intermediaryBankName?: string;
  additionalInformation?: string;
  ccy?: string | undefined;
  ccyto?: string | undefined;
  beneficiaryBankName?: string | undefined;
  beneficiaryBankCode?: string | undefined;
  recipientAddress?: string | undefined;
  recipientCity?: string | undefined;
  beneficiaryRegistrationCountryCode?: string | undefined;
}

export interface IP2PTransactionResponse {
  longOpId?: number;
}

export interface IP2PTransactionResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IP2PTransactionResponse | undefined;
}

export interface IGetUserDataByAccountNumberResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetUserDataByAccountNumberResponse | undefined;
}

export interface IGetUserDataByAccountNumberResponse {
  fullName?: string | undefined;
}

export interface IGetUserDataByAccountNumberRequest {
  accountNumber?: string | undefined;
}

export interface ITopUpTransactionRequest {
  accountID?: number;
  amounth?: number;
  isRecurring?: boolean | undefined;
  bankCardId?: number | undefined;
}

export interface ITopUpTransactionResponse {
  redirectUrl?: string | undefined;
  op_id?: number;
  op_guid?: string | undefined;
  isecommerce?: boolean;
}

export interface ITopUpTransactionResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: ITopUpTransactionResponse | undefined;
}

export interface IGetPayBillsResponse {
  merchantName?: string | undefined;
  abonentCode?: string | undefined;
  totalAount?: number;
  Status?: number;
  forOpClassCode?: string | undefined;
}

export interface IGetPayBillsResponseData {
  Ok?: boolean;
  errors?: IError[] | undefined;
  Data?: IGetPayBillsResponse | undefined;
}

class TransactionService {
  checkCostumerDebt(data: IGetDeptRequest) {
    const promise = axios.post<IGetDeptResponseData>(
      `${envs.API_URL}Transaction/checkdept`,
      data,
      {objectResponse: true},
    );
    return from(promise);
  }

  startPaymentTransaction(data: IRegisterPayTransactionRequest) {
    const promise = axios.post<IRegisterPayTransactionResponseData>(
      `${envs.API_URL}Transaction/registerpaytransaction`,
      data,
      {objectResponse: true},
    );
    return from(promise);
  }

  UnicardOtp(data: ISendUnicardOtpRequest) {
    const promise = axios.post<ISendUnicardOtpResponseData>(
      `${envs.API_URL}Transaction/SendUnicardOtp`,
      data,
      {objectResponse: true},
    );
    return from(promise);
  }

  startPayBatchTransaction(data: IRegisterBatchPayTransactionRequest) {
    const promise = axios.post<IRegisterPayBatchTransactionResponseData>(
      `${envs.API_URL}Transaction/RegisterBatchPayTransaction`,
      data,
      {objectResponse: true},
    );
    return from(promise);
  }

  makeTransaction(toBank: boolean = false, data: IP2PTransactionRequest) {
    const promise = axios.post<IP2PTransactionResponseData>(
      `${envs.API_URL}Transaction/${
        toBank ? 'MakeP2BTransaction' : 'MakeP2PTransaction'
      }`,
      data,
      {objectResponse: true},
    );
    return from(promise);
  }

  makeP2PForeignTransaction(data: IP2PTransactionRequest) {
    const promise = axios.post<IP2PTransactionResponseData>(
      `${envs.API_URL}Transaction/MakeP2PForeignTransaction`,
      data,
      {objectResponse: true},
    );
    return from(promise);
  }

  GetUserDataByAccountNumber(data: IGetUserDataByAccountNumberRequest) {
    const promise = axios.post<IGetUserDataByAccountNumberResponseData>(
      `${envs.API_URL}Transaction/GetUserDataByAccountNumber`,
      data,
      {objectResponse: false},
    );
    return from(promise);
  }

  TopupTransaction(data: ITopUpTransactionRequest) {
    const promise = axios.post<ITopUpTransactionResponseData>(
      `${envs.API_URL}Transaction/TopupTransaction`,
      data,
      {objectResponse: false},
    );
    return from(promise);
  }

  GetPayBills(longOpID?: number, ForFundsSPExternalTranID?: string | null | undefined) {
    let uri = '?';
    if (longOpID) {
      uri += `LongOpID=${longOpID}`;
    } else if (ForFundsSPExternalTranID) {
      uri += `ForFundsSPExternalTranID=${ForFundsSPExternalTranID}`;
    }
   
    const promise = axios.get<IGetPayBillsResponseData>(
      `${envs.API_URL}Transaction/GetPayBills${uri}`,
      {objectResponse: true},
    );
    return from(promise);
  }
}

export default new TransactionService();

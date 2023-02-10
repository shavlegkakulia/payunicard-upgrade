import axios from 'axios';
import {from} from 'rxjs';
import envs from '../../config/env';
import { IError } from './TemplatesService';

export interface IOTPServiceRequest {
  otpOperationType: number;
  phone?: string;
}

export interface ISubmitPhoneOTP {
  otp?: string;
  phone?: string;
}

export interface IResponse {
  ok: boolean;
  errors: string[];
  data: any;
}

export class GeneratePhoneOtpByUserRequest {
  otpOperationType?: string | number | undefined;
  userName?: string | undefined;
}

export interface IGeneratePhoneOtpByUserResponse {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGeneratePhoneOtpByUserResponse | undefined;
}

export interface IGeneratePhoneOtpByUserResponse {
  phoneMask?: string | undefined;
}

export class ISubmitPhoneOtpByUserResponseData {
  ok!: boolean;
  errors?: IError[] | undefined;
  data?: ISubmitPhoneOtpByUserResponse | undefined;
}

export interface ISubmitPhoneOtpByUserResponse {
  otpGuid?: string | undefined;
}

export interface ISubmitPhoneOtpByUserRequest {
  otp?: string | undefined;
  userName?: string | undefined;
}

class OTPService {
  SendPhoneOTP({OTP}: {OTP: IOTPServiceRequest}) {
    const promise = axios.post<IResponse>(
      `${envs.API_URL}OTP/SendPhoneOTP`,
      OTP,
      {objectResponse: true},
    );
    return from(promise);
  }

  SendRegistraionOtpMobile({OTP, GoogleToken}: {OTP: IOTPServiceRequest, GoogleToken?: string}) {
    const promise = axios.post<IResponse>(
      `${envs.API_URL}OTP/SendRegistrationOtpMobile`,
      OTP,
      {objectResponse: true, headers: {GoogleToken: GoogleToken}},
    );
    return from(promise);
  }

  SubmitPhoneOTP({OTP}: {OTP: ISubmitPhoneOTP}) {
    
    const promise = axios.post<IResponse>(
      `${envs.API_URL}OTP/SubmitPhoneOTP`,
      OTP,
      {objectResponse: true},
    );
    return from(promise);
  }

  GeneratePhoneOtpByUser({OTP}: {OTP: GeneratePhoneOtpByUserRequest}) {
    const promise = axios.post<IGeneratePhoneOtpByUserResponse>(
      `${envs.API_URL}User/GeneratePhoneOtpByUser`,
      OTP,
      {objectResponse: true},
    );
    return from(promise);
  }

  SubmitPhoneOtpByUser({OTP}: {OTP: ISubmitPhoneOtpByUserRequest}) {
    
    const promise = axios.post<ISubmitPhoneOtpByUserResponseData>(
      `${envs.API_URL}User/SubmitPhoneOtpByUser`,
      OTP,
      {objectResponse: true},
    );
    return from(promise);
  }
}

export default new OTPService();

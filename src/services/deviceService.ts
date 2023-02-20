import axios from 'axios';
import {from} from 'rxjs';
import envs from '../../config/env';
import { IEnv } from './AuthService';
import {IError} from './TemplatesService';

export interface IGenerateDeviceIdRequest {
  Otp: string;
}

export interface IGenerateDeviceIdResponse {
  deviceId: string;
}

export interface IGenerateDeviceIdResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGenerateDeviceIdResponse | undefined;
}

export interface IDevices {
  id: number;
  userAgent: string;
  createDate: string;
  deviceDescription?: string;
  isCurrent?: boolean;
}

export interface IGetDevicesResponse {
  devices: Array<IDevices>;
}

export interface IGetDevicesResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetDevicesResponse | undefined;
}

export interface IUpdateDeviceStatusResponse {
  isActive: boolean;
}

export interface IUpdateDeviceStatusResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IUpdateDeviceStatusResponse | undefined;
}

class DeviceService {
  _envs: IEnv | any;
  constructor() {
    envs().then(res => this._envs = res);
  }
   GenerateDeviceId(data: IGenerateDeviceIdRequest) {
    
    const promise = axios.post<IGenerateDeviceIdResponseData>(
      `${this._envs.API_URL}Device/GenerateDeviceId`,
      data,
      {objectResponse: true},
    );
    return from(promise);
  }

   GetDevices() {
    
    const promise = axios.get<IGetDevicesResponseData>(
      `${this._envs.API_URL}Device/GetDevices`,
      {objectResponse: true},
    );
    return from(promise);
  }

   UpdateDeviceStatus(id: number) {
    
    const promise = axios.post<IUpdateDeviceStatusResponseData>(
      `${this._envs.API_URL}Device/UpdateDeviceStatus`,
      {Id: id},
      {objectResponse: true},
    );
    return from(promise);
  }
}

export default new DeviceService();

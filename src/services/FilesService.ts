import axios from 'axios';
import {from} from 'rxjs';
import envs from '../../config/env';
import {IError} from './TemplatesService';

export enum ImageType {
  CustomerRegistration = 'CustomerRegistration',
  LoyaltyCards = 'LoyaltyCards',
  UserProfileImage = 'UserProfileImage',
  TemplateImage = 'TemplateImage',
}

export interface IUploadFileRequest {
  fileName?: string | undefined;
  getColor?: boolean;
  type?: ImageType;
  image?: string | undefined;
}

export interface IUploadFileResponse {
  imageUrl?: string | undefined;
  color?: string | undefined;
}

export interface IIResponseOfUploadFileResponse {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IUploadFileResponse | undefined;
}

class FilesService {
  uploadImage(data: IUploadFileRequest) {
    const promise = axios.post<IIResponseOfUploadFileResponse>(
      `${envs.API_URL}Files/UploadImage`,
      data,
    );
    return from(promise);
  }
}

export default new FilesService();

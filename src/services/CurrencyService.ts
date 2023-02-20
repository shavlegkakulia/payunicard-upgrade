import axios from 'axios';
import { from } from 'rxjs';
import envs from '../../config/env';
import { IEnv } from './AuthService';
import { IError } from './TemplatesService';

export interface ICurrencyConverterAmountByDirRequest {
    ccy?: string | undefined;
    buyCcy?: string | undefined;
    amountFROM?: number;
    fromBaseAmount?: boolean;
}

export interface ICurrencyConverterAmountByDirResponse {
    amountTo?: number;
    rate?: number;
    rateDev?: number;
    rateDev2?: number;
    realrate?: number;
    ccY1?: string | undefined;
    ccY2?: string | undefined;
}

export interface ICurrencyConverterAmountByDirResponseData {
    ok: boolean;
    errors?: IError[] | undefined;
    data?: ICurrencyConverterAmountByDirResponse | undefined;
}

class CurrencyService {
    _envs: IEnv | any;
    constructor() {
      envs().then(res => this._envs = res);
    }
     CurrencyConverterCalculatror(data: ICurrencyConverterAmountByDirRequest) {
    
        const promise = axios.post<ICurrencyConverterAmountByDirResponseData>(
            `${this._envs.API_URL}Currency/CurrencyConverterCalculatror`,
            data,
            { objectResponse: true },
        );
        return from(promise);
    }
}

export default new CurrencyService();

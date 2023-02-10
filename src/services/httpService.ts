import axios, { AxiosRequestConfig } from 'axios';
import { from } from 'rxjs';

export const post = ( Url: string, Data: any, Config: AxiosRequestConfig) => {
    try{
        const promise = axios.post<any>(Url, Data, Config);
    return from(promise);
    } catch(err) {
    
    }
}
import { IDevices } from "../../services/deviceService";

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const START_LOGIN = 'START_LOGIN';
export const AUT_SET_IS_LOADING = 'AUT_SET_IS_LOADING';
export const REFRESH = 'REFRESH';
export const SET_DEVICE_ID = 'SET_DEVICE_ID';
export const SET_ACTIVE_DEVICES = 'SET_ACTIVE_DEVICES';
export const SET_AUTH = 'SET_AUTH'; 

export interface IAuthState {
    isAuthenticated: boolean,
    isLoading: boolean,
    accesToken: string,
    refreshToken: string,
    remember: boolean,
    deviceId: string | undefined,
    devices: IDevices[],
    isUserInitialized: boolean
}

export interface IAuthAction {
    isLoading?: boolean,
    accesToken?: string,
    refreshToken?: string,
    type: string,
    remember?: boolean,
    deviceId?: string | undefined,
    devices?: IDevices[],
    setAuth?: boolean
}

export interface IGlobalState {
    AuthReducer: IAuthState
}
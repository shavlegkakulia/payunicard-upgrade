export const PUSH_ERROR = 'PUSH_ERROR';
export const DELETE_ERROR = 'DELETE_ERROR';

export interface IErrorState {
    errors: string | undefined
}

export interface IErrorAction {
    error: string,
    type: string
}

export interface IGlobalState {
    ErrorReducer: IErrorState
}
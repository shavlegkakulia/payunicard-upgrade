import { PUSH_ERROR, DELETE_ERROR } from './../action_types/error_action_types';

export const PUSH = ( message: string) => (dispatch: any) => {
    dispatch({type: PUSH_ERROR, error: message});
}

export const DELETE = () => (dispatch: any) => {
    dispatch({type: DELETE_ERROR});
}
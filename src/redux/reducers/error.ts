import { IErrorState, IErrorAction, PUSH_ERROR, DELETE_ERROR } from './../action_types/error_action_types';

const initialState: IErrorState = {
    errors: undefined
}

const ErrorReducer = (state:IErrorState = initialState, action: IErrorAction) => {
    switch(action.type) {
        case PUSH_ERROR:
            return  {...state, errors: action.error };
        case DELETE_ERROR:
            return {...state, errors: undefined};
        default:
            return { ...state };
    }
}

export default ErrorReducer;
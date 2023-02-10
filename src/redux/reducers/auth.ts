import {
  LOGIN,
  LOGOUT,
  START_LOGIN,
  AUT_SET_IS_LOADING,
  IAuthState,
  IAuthAction,
  REFRESH,
  SET_DEVICE_ID,
  SET_ACTIVE_DEVICES,
  SET_AUTH
} from '../action_types/auth_action_types';

const initialState: IAuthState = {
  isAuthenticated: false,
  isLoading: false,
  accesToken: '',
  refreshToken: '',
  remember: false,
  deviceId: undefined,
  devices: [],
  isUserInitialized: false
};

function AuthReduser(state: IAuthState = initialState, action: IAuthAction) {
  switch (action.type) {
    case SET_AUTH: 
    return {...state, isAuthenticated: action.setAuth}
    case START_LOGIN:
      return {...state, isLoading: action.isLoading};
    case AUT_SET_IS_LOADING:
      return {...state, isLoading: action.isLoading};
    case LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        accesToken: action.accesToken,
        refreshToken: action.refreshToken,
        remember: action.remember,
        isUserInitialized: true,
      };
    case REFRESH:
      return {
        ...state,
        isAuthenticated: true,
        accesToken: action.accesToken,
        refreshToken: action.refreshToken,
      };
    case SET_DEVICE_ID:
      return {...state, deviceId: action.deviceId};
    case SET_ACTIVE_DEVICES:
      
        return {...state, devices: [...(action.devices || [])]};
      
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        accesToken: '',
        refreshToken: '',
      };
    default:
      return {...state};
  }
}

export default AuthReduser;

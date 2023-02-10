import { combineReducers, applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import AuthReducer from "./../redux/reducers/auth";
import UserReducer from "./reducers/user";
import TranslateReduser from "./reducers/transtale";
import ErrorReducer from "./reducers/error";
import TransfersReducer from "./reducers/transfersReducer";
import NavigationReducer from "./reducers/navigationReducer";
import PaymentsReducer from "./reducers/paymentsReducer";
import VerificationReducer from "./reducers/verificationReducer";

const reducers = combineReducers({
  AuthReducer,
  UserReducer,
  TranslateReduser,
  ErrorReducer,
  TransfersReducer,
  NavigationReducer,
  PaymentsReducer,
  VerificationReducer,
});
const store = createStore(reducers, applyMiddleware(thunk));

export default store;

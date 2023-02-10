import NetInfo from "@react-native-community/netinfo";
import { IErrorAction, PUSH_ERROR } from "../redux/action_types/error_action_types";
import store from './../redux/store';

class NetworkService {
    CheckConnection(next: Function, fail?: Function) {
        NetInfo.fetch().then(state => {
            if (!state.isConnected) {
                store.dispatch<IErrorAction>({ type: PUSH_ERROR, error: 'No internet connection' });
                if(fail) {
                    fail();
                }
                return false;
            } else {
                next();
            }
        });
    }
}

export default new NetworkService();
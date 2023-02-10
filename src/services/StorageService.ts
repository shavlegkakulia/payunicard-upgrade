import AsyncStorage from "@react-native-async-storage/async-storage";
import { CallbackWithResult } from "@react-native-async-storage/async-storage/lib/typescript/types";


export default AsyncStorage;

export const getItem = (key: string, callback?: CallbackWithResult<string> | undefined) => {
    return AsyncStorage.getItem(key, callback);
}

export const setItem = (key: string, value: string, callback?: CallbackWithResult<string> | undefined) => {
    return AsyncStorage.setItem(key, value, callback);
}

export const removeItem = (key: string, callback?: CallbackWithResult<string> | undefined) => {
    return AsyncStorage.removeItem(key, callback);
}

export const clear = (callback?: CallbackWithResult<string> | undefined) => {
    return AsyncStorage.clear(callback);
}
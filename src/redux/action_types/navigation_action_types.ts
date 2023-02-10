export interface INavigationState {
    parentRoute: string | undefined,
    currentRoute: string | undefined,
    index: number | undefined,
    parentIndex: number | undefined,
    visible: boolean,
    backAction: Function | undefined
}

export const NAVIGATION_ACTIONS = {
    SET_PARENT_ROUTE: 'SET_PARENT_ROUTE',
    SET_HIDER_VISIBLE: 'SET_HIDER_VISIBLE',
    SET_CURRENT_ROUTE: 'SET_CURRENT_ROUTE',
    SET_CURRENT_ROUTE_INDEX: 'SET_CURRENT_ROUTE_INDEX',
    SET_PARENT_ROUTE_INDEX: 'SET_PARENT_ROUTE_INDEX',
    SET_BACK_ACTION: 'SET_BACK_ACTION'
}

export interface INavigationActions extends INavigationState {
    type: string;
}

export interface IGlobalState {
    NavigationReducer: INavigationState
}
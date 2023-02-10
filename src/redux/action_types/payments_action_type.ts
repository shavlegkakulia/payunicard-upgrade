import { IGetPaymentDetailsResponseData, IMerchant, IService } from "../../services/PresentationServive";
import { ITemplates } from "../../services/TemplatesService";
import { IRegisterPayTransactionResponse, IStructure } from "../../services/TransactionService";
import { IAccountBallance } from "../../services/UserService";

export interface IPaymentState {
    services: IService[],
    currentService: IService | undefined,
    paymentDetails: IGetPaymentDetailsResponseData | undefined,
    paymentTransactionData: IRegisterPayTransactionResponse | undefined,
    PayTemplates: ITemplates[],
    currentPayTemplate: ITemplates | undefined,
    isActionLoading: boolean,
    isCategoriesLoading: boolean,
    isTemplatesFetching: boolean,
    isTemplate: boolean,
    isService: boolean,
    activeCategoryTitle: Array<string>
    templName: string | undefined,
    payTempID?: number,
    merchants: IMerchant[],
    title: string | undefined,
    selectedAccount: IAccountBallance | undefined,
    abonentCode: string | undefined,
    amount: string | undefined,
    carPlate: string | undefined,
    debtData: IStructure[] | undefined,
    SearchServiceName: string | undefined
} 

export interface IPaymentsActions extends IPaymentState {
    type: string;
    deep: boolean;
}

export interface IGlobalPaymentState {
    PaymentsReducer: IPaymentState
}

export const PAYMENTS_ACTIONS = {
    SET_PAYMENT_SERVICES: 'SET_PAYMENT_SERVICES',
    SET_CURRENT_PAYMENT_SERVICE: 'SET_CURRENT_PAYMENT_SERVICE',
    SET_PAYMENT_DETAILS: 'SET_PAYMENT_DETAILS',
    SET_PAYMENT_TRANSACTION_DATA: 'SET_PAYMENT_TRANSACTION_DATA',
    SET_PAY_TEMPLATES: 'SET_PAY_TEMPLATES',
    SET_CURRENT_PAY_TEMPLATE: 'SET_CURRENT_PAY_TEMPLATE',
    SET_IS_PAYMENT_ACTION_LOADING: 'SET_IS_PAYMENT_ACTION_LOADING',
    SET_IS_PAYMENT_TEMPLATES_FETCHING: 'SET_IS_PAYMENT_TEMPLATES_FETCHING',
    SET_IS_PAYMENT_TEMPLATE: 'SET_IS_PAYMENT_TEMPLATE',
    SET_IS_PAYMENT_SERVICE: 'SET_IS_PAYMENT_SERVICE',
    SET_PAYEMNT_ACTIVE_CATEGORY_TITLE: 'SET_PAYEMNT_ACTIVE_CATEGORY_TITLE',
    SET_PAYMENT_TEMPLATE_NAME: 'SET_PAYMENT_TEMPLATE_NAME',
    SET_IS_PAYMENT_CATEGORIES_LOADING: 'SET_IS_PAYMENT_CATEGORIES_LOADING',
    UPDATE_PAY_TEMPLATES_IN_DELETE: 'UPDATE_PAY_TEMPLATES_IN_DELETE',
    ADD_IN_PAY_TEMPLATE: 'ADD_IN_PAY_TEMPLATE',
    UPDATE_PAY_TEMPLATE_NAME: 'UPDATE_PAY_TEMPLATE_NAME',
    SET_PAYMENT_MERCHANT_SERVICES: 'SET_PAYMENT_MERCHANT_SERVICES',
    PAYMENT_SET_SELECTED_ACCOUNT: 'PAYMENT_SET_SELECTED_ACCOUNT',
    PAYMENT_SET_ABONENT_CODE: 'PAYMENT_SET_ABONENT_CODE',
    PAYMENT_SET_AMOUNT: 'PAYMENT_SET_AMOUNT',
    PAYMENT_SET_CARPLATE: 'PAYMENT_SET_CARPLATE',
    PAYMENT_DEBTDATA: 'PAYMENT_DEBTDATA',
    RESET_PAYEMENT_DATA: 'RESET_PAYEMENT_DATA',
    SET_PAYMENT_SERACH_SERVICENAME: 'SET_PAYMENT_SERACH_SERVICENAME'
}
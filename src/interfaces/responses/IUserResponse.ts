export interface IUserResponse {
    data: IData;
}

export interface IData {
    citizenshipCountryID?: number;
    customerCategoryTypeId?: number;
    customerID?: number;
    customerVerificationStatusCode?: string;
    customerVerificationStatusDesc?: string;
    defaultAccountID?: number;
    documentVerificationStatusCode?: string;
    documentVerificationStatusDesc?: string;
    emailVerificationStatusCode?: string;
    emailVerificationStatusDesc?: string;
    imageUrl?: string;
    isOtpAuthorization?: boolean;
    phone?: string;
    phoneVerificationStatusCode?: string;
    phoneVerificationStatusDesc?: string;
    sex?: number;
    userId?: number;
    username?: string;
}
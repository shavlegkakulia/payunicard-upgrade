export interface ISignInResponse {
    refresh_token: string;
    access_token: string;
    expires_in: Number;
    scope: string;
    token_type: string;
}
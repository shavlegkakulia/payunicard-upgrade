import axios from 'axios';
import {from} from 'rxjs';
import envs from '../../config/env';
import {ITemplates} from './TemplatesService';

export class IError {
  errorMessage?: string | undefined;
  code?: number;
  displayText?: string | undefined;
}

export interface ICategory {
  [x: string]: any;
  categoryID: number;
  cultureID?: string | undefined;
  hasChildren: boolean;
  ord?: number;
  parentID?: number;
  recDate?: string | undefined;
  name: string;
  isHidden?: boolean;
  isParent?: boolean;
  hasServices: boolean;
  imageUrl?: string | undefined;
  isService: boolean;
  merchantServiceID?: number | undefined;
  merchantCode?: string | undefined;
  merchantServiceCode?: string | undefined;
  categoryName?: string | undefined;
  cannotPay?:boolean;
}

interface IData {
  categories: ICategory[];
}

export interface ICategoryResponse {
  data: IData;
  ok: boolean;
  errors?: IError[] | undefined;
}

export class IService {
  merchantCode?: string | undefined;
  merchantServiceCode?: string | undefined;
  categoryID?: number;
  resourceValue?: string | undefined;
  merchantServiceURL?: string | undefined;
  isUtility?: boolean;
  imageUrl?: string;
  name?: string;
  forOpClassCode?: string | undefined;
  merchantServiceID?: number | undefined;
}

export interface ISearchMerchantServicesResponse {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: SearchMerchantServicesResponse | undefined;
}

export interface SearchMerchantServicesResponse {
  services?: IService[] | undefined;
}

export interface IGetPaymentDetailsResponseData extends ITemplates {
  merchantServiceParamValue?: string | undefined;
  debtCode?: string | undefined;
  merchantId: number | undefined;
  payCode?: string | undefined;
  cancelCode?: string | undefined;
  debtCodeVisible?: boolean;
  forOpClassCode?: string | undefined;
  forFundsSPCode?: string | undefined;
  forMerchantCode?: string | undefined;
  forMerchantServiceCode?: string | undefined;
  forPaySPCode?: string | undefined;
  feeFixedValue?: number | undefined;
  feeMinValue?: number | undefined;
  feeMaxValue?: number | undefined;
  amount?: number | undefined;
  amountFee?: number | undefined;
  feePercent?: number | undefined;
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  authRequired?: boolean;
  merchantServiceParamExample?: string | undefined;
  canPayWithUnipoints?: number | undefined;
}

export interface IGetPaymentDetailsResponse {
  ok: boolean;
  errors?: IError[] | undefined;
  data: IGetPaymentDetailsResponseData;
}

export interface IGetPaymentDetailsRequest {
  ForOpClassCode?: string | undefined;
  ForMerchantCode?: string | undefined;
  ForMerchantServiceCode?: string | undefined;
  PaySpCode?: string | undefined;
  ForFundsSPCode?: string | undefined;
  ForCustomerType?: string | undefined;
  AccountNumber?: string | undefined;
  IbanAccountNumber?: string | undefined;
  Ccy?: string | undefined;
  BankId?: number | undefined;
  InAmount?: number | undefined;
}

export interface IMerchantServicesForTemplateResponseData {
  ok?: boolean;
  errors?: IError[] | undefined;
  data: IGetMerchantServicesForTemplateResponse;
}

export interface IGetMerchantServicesForTemplateResponse {
  merchants: IMerchant[];
}

export interface IMerchant extends ICategory {
  merchantServiceURL?: string;
}

export interface IMerchantServicesForTemplateRequest {
  CategoryID?: number;
}

export interface IGetBatchPaymentDetailsRequets {
  forOpClassCode?: string | undefined;
  forMerchantCode?: string | undefined;
  forMerchantServiceCode?: string | undefined;
  forFundsSPCode?: string | undefined;
  forCustomerType?: string | undefined;
  accountNumber?: string | undefined;
  inAmount?: number | undefined;
  template?: number | undefined;
  payTempID?: number | undefined;
}

export interface IPaymentDetailResponsesItem {
  paymentDetailResponses: IPaymentDetailResponses[];
}

export interface IGetBatchPaymentDetailsRequetsData {
  ok?: boolean;
  errors?: IError[] | undefined;
  data: IPaymentDetailResponsesItem;
}

export interface IPaymentDetailResponses {
  merchantServiceParamValue: string | undefined;
  debtCode: string | undefined;
  payCode: string | undefined;
  cancelCode: string | undefined;
  debtCodeVisible: true;
  forOpClassCode: string | undefined;
  forFundsSPCode: string | undefined;
  forMerchantCode: string | undefined;
  forMerchantServiceCode: string | undefined;
  forPaySPCode: string | undefined;
  feeFixedValue: number | undefined;
  feeMinValue: number | undefined;
  feeMaxValue: number | undefined;
  amount: number | undefined;
  amountFee: number | undefined;
  feePercent: number | undefined;
  minAmount: number | undefined;
  maxAmount: number | undefined;
  authRequired: boolean | undefined;
  merchantServiceParamExample: string | undefined;
  merchantId: number | undefined;
  canPayWithUnipoints: number | undefined;
}

interface ILogErrorRequest {
  error?: string | undefined;
}

interface ILogErrorResponseData {
  ok?: boolean;
  errors?: IError | undefined;
  data?: any;
}

export interface ICitizenshipCountry {
  countryID?: number;
  countryName?: string | undefined;
  countryCode?: string | undefined;
}

export interface ICitizenshipCountriesResponse {
  countries?: ICitizenshipCountry[] | undefined;
}

export interface ICountriesResponseData {
  ok?: boolean;
  errors?: IError[] | undefined;
  data?: ICitizenshipCountriesResponse | undefined;
}

export interface IPackageCard {
  paketTypeId?: number;
  ccy?: string | undefined;
  priority?: number;
  status?: number;
  isactive?: boolean;
  createDate?: Date;
}

export interface IPackage {
  paketTypeId?: number;
  paketCode?: string | undefined;
  paketDescription?: string | undefined;
  isActive?: boolean;
  priceMonthly?: number;
  priceQuarterly?: number;
  priceAnnual?: number;
  prePayment?: number;
  createDate?: Date;
}

export interface GetPackageTypeListResponse {
  packages?: IPackage[] | undefined;
  packageCards?: IPackageCard[] | undefined;
}

export interface IResponsePackageTypeListResponseData {
  ok?: boolean;
  errors?: IError[] | undefined;
  data?: GetPackageTypeListResponse | undefined;
}

export interface ICardType {
  description?: string | undefined;
  imageURL?: string | undefined;
  isActive?: boolean;
  name?: string | undefined;
  price?: number;
  typeId?: number;
  isInstant?: boolean;
  count?: number;
  /*addidtional*/
  isChecked?: boolean;
  willCount?: number;
}

export interface IGetCardTypesResponse {
  cardTypes?: ICardType[] | undefined;
}

export interface ICity {
  cityId?: number;
  name?: string | undefined;
}

export interface IGetCardTypesResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetCardTypesResponse | undefined;
}

export interface IGetCitiesResponse {
  cities?: ICity[] | undefined;
}

export interface IIResponseOfGetCitiesResponse {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetCitiesResponse | undefined;
}

export interface IOffersResponse {
  id: number;
  imageUrl: string;
  url: string;
  title: string;
  text: string;
  merchantUrl: string;
}

export interface IOffersDetailResponse extends IOffersResponse {
  id: number;
  description: string;
}

export interface IGetOffers {
  offers: IOffersResponse[];
}

export interface IIResponseOfGeOffersResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetOffers | undefined;
}

export interface IGetOffersDetails {
  offer: IOffersDetailResponse;
}

export interface IIResponseOfGeOffersDetailsResponseData {
  ok: boolean;
  errors?: IError[] | undefined;
  data?: IGetOffersDetails | undefined;
}

export interface ICountry {
  countryName: string,
  ord: number,
  countryCode: string,
  dialCode: string,
  minDIG?: number,
  maxDIG?: number,
  nO1?: number,
  nO2?: number,
  nO3?: number,
  flaG_URL: string
}

export interface IGetCoutries {
  countries: Array<ICountry>
}

interface IGetCoutriesData {
  data: IGetCoutries
}

class PresentationService {
  GetCategories(ParentID: number = 0) {
    const promise = axios.get<ICategoryResponse>(
      `${envs.API_URL}GetCategories`,
      ParentID ? {params: {ParentID}} : {},
    );
    return from(promise);
  }

  GetPaymentDetails(data: IGetPaymentDetailsRequest) {
    const promise = axios.get<IGetPaymentDetailsResponse>(
      `${envs.API_URL}GetPaymentDetails`,
      {params: data},
    );
    return from(promise);
  }

  GetMerchantServices(data: IMerchantServicesForTemplateRequest) {
    const promise = axios.get<IMerchantServicesForTemplateResponseData>(
      `${envs.API_URL}GetMerchantServices`,
      {params: data},
    );
    return from(promise);
  }

  SearchMerchants(value: string) {
    const promise = axios.get<ISearchMerchantServicesResponse>(
      `${envs.API_URL}SearchMerchantServices?Search=${value}`,
    );
    return from(promise);
  }

  GetBatchPaymentDetails(data: IGetBatchPaymentDetailsRequets[]) {
    const promise = axios.post<IGetBatchPaymentDetailsRequetsData>(
      `${envs.API_URL}GetBatchPaymentDetails`,
      {paymentDetails: data},
      {objectResponse: true},
    );
    return from(promise);
  }

  GetCitizenshipCountries() {
    const promise = axios.get<ICountriesResponseData>(
      `${envs.API_URL}GetCitizenshipCountries`,
    );
    return from(promise);
  }

  getCities() {
    const promise = axios.get<IIResponseOfGetCitiesResponse>(
      `${envs.API_URL}getCities`,
    );
    return from(promise);
  }

  LogError(data: ILogErrorRequest) {
    const promise = axios.post<ILogErrorResponseData>(
      `${envs.API_URL}LogError`,
      data,
      {objectResponse: true},
    );
    return from(promise);
  }

  getPackageTypes() {
    const promise = axios.get<IResponsePackageTypeListResponseData>(
      `${envs.API_URL}getPackageTypes`,
    );
    return from(promise);
  }

  getCardTypes() {
    const promise = axios.get<IGetCardTypesResponseData>(
      `${envs.API_URL}getCardTypes`,
    );
    return from(promise);
  }

  get_GetOffers() {
    const promise = axios.get<IIResponseOfGeOffersResponseData>(`${envs.API_URL}GetOffers`);
    return from(promise);
  }

  get_GetOfferDetail(OfferId: number, culture?:string) {
    let q = '';
    if(culture) {
      q = `&Culture=${culture}`;
    }
    const promise = axios.get<IIResponseOfGeOffersDetailsResponseData>(`${envs.API_URL}GetOffer?OfferId=${OfferId}${q}`);
    return from(promise);
  }

  GetCountries() {
    const promise = axios.get<IGetCoutriesData>(
      `${envs.API_URL}GetCountries`
    );
    return from(promise);
  }
}

export default new PresentationService();

import { DEV_API, PROD_API, TEST_CONNECT_API, TEST_API, PROD_CONNECT_API, _DEV_CONNECT_API, TOKEN_TTL, CDN_PATH, client_id, client_secret, client_id_dev, client_secret_dev, googleSiteDomain, googleSiteKey } from '@env';
const devEnvironmentVariables = {
    API_URL: DEV_API,
    CONNECT_URL: _DEV_CONNECT_API,
    TOKEN_TTL,
    CDN_PATH,
    client_id: client_id_dev,
    client_secret: client_secret_dev,
    googleSiteDomain,
    googleSiteKey
} 
 
const prodEnvironmentVariables = {
    API_URL: PROD_API,
    CONNECT_URL: PROD_CONNECT_API,
    TOKEN_TTL,
    CDN_PATH,
    client_id,
    client_secret,
    googleSiteDomain,
    googleSiteKey
}

const testEnvironmentVariables = {
    API_URL: TEST_API,
    CONNECT_URL: TEST_CONNECT_API,
    TOKEN_TTL,
    CDN_PATH
}

export default __DEV__ ? prodEnvironmentVariables : prodEnvironmentVariables;
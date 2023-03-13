// Copyright 2022 Google LLC
//
//     Licensed under the Apache License, Version 2.0 (the "License");
//     you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
//     Unless required by applicable law or agreed to in writing, software
//     distributed under the License is distributed on an "AS IS" BASIS,
//     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
//     limitations under the License.

package com.payunicard.utilities;

import com.facebook.react.bridge.ReactApplicationContext;
import android.content.Context;
import android.content.SharedPreferences;
import com.google.android.gms.tapandpay.TapAndPay;
// import com.google.android.gms.tapandpay.issuer.devapp.littlebear.R;

/**
 * This class is used as a utility to help with the storage and retrieval of the Opaque Payment Card
 * (OPC) on your local device for the purposes of the Google Pay Push Provisioning demo. It is
 * purely for demonstration purposes and is not a recommended way of storing and retrieving your
 * OPC. This should be handed by your back-end server.
 */
public class OPCHelper {

  private SharedPreferences sharedPrefs;
  private String opcSharedPreferencesFile;
  private String opcSharedPreferencesKey;
  private String opcNotSetString;
  private String opcNetworkKey;
  private String opcTokenServiceProviderKey;
  private String opcNetworkNameKey;
  private String opcTokenServiceProviderNameKey;
  private String opcNameNotSetKey;

  private int[] tspList = {
    TapAndPay.TOKEN_PROVIDER_VISA,
    TapAndPay.TOKEN_PROVIDER_MASTERCARD,
    TapAndPay.TOKEN_PROVIDER_AMEX,
    TapAndPay.TOKEN_PROVIDER_DISCOVER,
    TapAndPay.TOKEN_PROVIDER_INTERAC,
    TapAndPay.TOKEN_PROVIDER_EFTPOS,
    TapAndPay.TOKEN_PROVIDER_OBERTHUR,
    TapAndPay.TOKEN_PROVIDER_PAYPAL,
    TapAndPay.TOKEN_PROVIDER_JCB,
    TapAndPay.TOKEN_PROVIDER_GEMALTO
  };
  private int[] networkList = {
    TapAndPay.CARD_NETWORK_VISA,
    TapAndPay.CARD_NETWORK_MASTERCARD,
    TapAndPay.CARD_NETWORK_AMEX,
    TapAndPay.CARD_NETWORK_DISCOVER,
    TapAndPay.CARD_NETWORK_INTERAC,
    TapAndPay.CARD_NETWORK_QUICPAY,
    TapAndPay.CARD_NETWORK_ID
  };

  public OPCHelper(ReactApplicationContext context) {
    opcSharedPreferencesFile = "OPC_SHARED_PREFERENCES_FILE";
    opcSharedPreferencesKey = "OPC_SHARED_PREFERENCES_KEY";
    opcNotSetString = "OPC_NOT_SET_STRING";
    opcNetworkKey = "OPC_NETWORK_KEY";
    opcTokenServiceProviderKey = "OPC_TOKEN_SERVICE_PROVIDER_KEY";
    opcNetworkNameKey = "OPC_NETWORK_NAME_KEY";
    opcTokenServiceProviderNameKey =
        "OPC_TOKEN_SERVICE_PROVIDER_NAME_KEY";
    opcNameNotSetKey = "OPC_NAME_NOT_SET_KEY";

    this.sharedPrefs = context.getSharedPreferences(opcSharedPreferencesFile, Context.MODE_PRIVATE);
  }

  public String getOPC() {
    return sharedPrefs.getString(opcSharedPreferencesKey, opcNotSetString);
  }

  public boolean setOPC(String opc) {
    SharedPreferences.Editor editor = sharedPrefs.edit();
    editor.putString(opcSharedPreferencesKey, opc);
    return editor.commit();
  }

  public boolean isOPCSet() {
    return !getOPC().equals(opcNotSetString);
  }

  public String getLast4OfOPC() {
    String opc = sharedPrefs.getString(opcSharedPreferencesKey, opcNotSetString);
    if (opc.length() > 4) {
      return opc.substring(opc.length() - 4);
    } else {
      return "";
    }
  }

  public int getNetworkInt() {
    return sharedPrefs.getInt(opcNetworkKey, 0);
  }

  public boolean setNetworkInt(int networkInt) {
    SharedPreferences.Editor editor = sharedPrefs.edit();
    editor.putInt(opcNetworkKey, networkInt);
    return editor.commit();
  }

  public int getTokenServiceProviderInt() {
    return sharedPrefs.getInt(opcTokenServiceProviderKey, 0);
  }

  public boolean setTokenServiceProviderInt(int tokenServiceProviderInt) {
    SharedPreferences.Editor editor = sharedPrefs.edit();
    editor.putInt(opcTokenServiceProviderKey, tokenServiceProviderInt);
    return editor.commit();
  }

  public int[] getNetworkList() {
    return networkList;
  }

  public int[] getTspList() {
    return tspList;
  }

  public String getNetworkName() {
    return sharedPrefs.getString(opcNetworkNameKey, opcNameNotSetKey);
  }

  public boolean setNetworkName(String networkName) {
    SharedPreferences.Editor editor = sharedPrefs.edit();
    editor.putString(opcNetworkNameKey, networkName);
    return editor.commit();
  }

  public String getTokenServiceProviderName() {
    return sharedPrefs.getString(opcTokenServiceProviderNameKey, opcNameNotSetKey);
  }

  public boolean setTokenServiceProviderName(String tokenServiceProviderName) {
    SharedPreferences.Editor editor = sharedPrefs.edit();
    editor.putString(opcTokenServiceProviderNameKey, tokenServiceProviderName);
    return editor.commit();
  }

  public void clearOPC() {
    SharedPreferences.Editor editor = sharedPrefs.edit();
    editor.clear().commit();
  }
}

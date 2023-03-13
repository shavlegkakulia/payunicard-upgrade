package com.payunicard;
import android.provider.MediaStore;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.google.android.gms.tapandpay.TapAndPay;
import com.google.android.gms.tapandpay.TapAndPayClient;
import com.google.android.gms.tapandpay.issuer.PushTokenizeRequest;
import com.google.android.gms.tapandpay.issuer.UserAddress;
import com.payunicard.models.Card;
import com.payunicard.utilities.OPCHelper;

import androidx.appcompat.app.AlertDialog;

import org.jetbrains.annotations.NotNull;

public class GPayModule extends ReactContextBaseJavaModule {
    private static final int REQUEST_CODE_PUSH_TOKENIZE = 3;

    private TapAndPayClient tapAndPayClient;
    private ReactApplicationContext mContext;
    GPayModule (@Nullable ReactApplicationContext reactContext){
      
         super(reactContext);
         this.mContext = reactContext;
     }
    @Override
    public String getName() {
        return "GPayModule";
    }

    @ReactMethod
    public void handleAddToGooglePayClick() {
        OPCHelper opcHelper = new OPCHelper(this.mContext);
        if (opcHelper.isOPCSet()) {
          byte[] opcBytes = opcHelper.getOPC().getBytes();
    
          UserAddress userAddress =
              UserAddress.newBuilder()
                  .setName("name")
                  .setAddress1("address1")
                  .setLocality("locality")
                  .setAdministrativeArea("administrative_area")
                  .setCountryCode("country_code")
                  .setPostalCode("postal_code")
                  .setPhoneNumber("phone_number")
                  .build();
    
          PushTokenizeRequest pushTokenizeRequest =
              new PushTokenizeRequest.Builder()
                  .setOpaquePaymentCard(opcBytes)
                  .setNetwork(opcHelper.getNetworkInt())
                  .setTokenServiceProvider(opcHelper.getTokenServiceProviderInt())
                  .setDisplayName("name")
                  .setLastDigits("last_digits")
                  .setUserAddress(userAddress)
                  .build();
    
          tapAndPayClient.pushTokenize(this.mContext, pushTokenizeRequest, REQUEST_CODE_PUSH_TOKENIZE);
        }
      }
}

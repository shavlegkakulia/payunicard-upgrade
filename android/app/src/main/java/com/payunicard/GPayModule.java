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

import org.json.JSONObject;
import android.app.Activity;
import android.content.Intent;
import androidx.appcompat.app.AlertDialog;
import static android.app.Activity.RESULT_CANCELED;
import static android.app.Activity.RESULT_OK;
import org.jetbrains.annotations.NotNull;
import com.facebook.react.bridge.Callback;
import android.util.Log;
import java.util.Base64;

public class GPayModule extends ReactContextBaseJavaModule {
    private static final int REQUEST_CODE_PUSH_TOKENIZE = 3;

    private TapAndPayClient tapAndPayClient;
    Activity activity;

    GPayModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "GPayModule";
    }

    @Override
    public void initialize() {
        super.initialize();
        activity = getCurrentActivity();
        tapAndPayClient = TapAndPay.getClient(activity);
    }

    @ReactMethod
    public void handleAddToGooglePayClick(String name, String address1, String locality, String administrative_area,
            String country_code, String postal_code, String last_digits, String phone_number, Callback callBack) {

      //  OPCHelper opcHelper = new OPCHelper(activity);
      //  if (opcHelper.isOPCSet()) {
            String payload = "{'foo' : 'bar'}";
            String encodedPayload = Base64.getEncoder().withoutPadding().encodeToString(payload.getBytes());
            byte[] opc = encodedPayload.getBytes();

            UserAddress userAddress = UserAddress.newBuilder()
                    .setName(name)
                    .setAddress1(address1)
                    .setLocality(locality)
                    .setAdministrativeArea(administrative_area)
                    .setCountryCode(country_code)
                    .setPostalCode(postal_code)
                    .setPhoneNumber(phone_number)
                    .build();

            PushTokenizeRequest pushTokenizeRequest = new PushTokenizeRequest.Builder()
                    .setOpaquePaymentCard(opc)
                    .setNetwork(TapAndPay.CARD_NETWORK_VISA)
                    .setTokenServiceProvider(TapAndPay.TOKEN_PROVIDER_VISA)
                    .setDisplayName(name)
                    .setLastDigits(last_digits)
                    .setUserAddress(userAddress)
                    .build();

            callBack.invoke(last_digits);
            tapAndPayClient.pushTokenize(activity, pushTokenizeRequest, REQUEST_CODE_PUSH_TOKENIZE);
      //  }
    }

    // @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_CODE_PUSH_TOKENIZE) {
            if (resultCode == RESULT_CANCELED) {
                // TODO: Handle provisioning failure here.
                return;
            } else if (resultCode == RESULT_OK) {
                // TODO: Handle successful provisioning here.
                String tokenId = data.getStringExtra(TapAndPay.EXTRA_ISSUER_TOKEN_ID);
                return;
            }
        }
        // TODO: Handle results for other request codes.
        // ...
    }
}

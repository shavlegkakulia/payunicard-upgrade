package com.payunicard;
import android.provider.MediaStore;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.jetbrains.annotations.NotNull;

public class GPayModule extends ReactContextBaseJavaModule {
    GPayModule (@Nullable ReactApplicationContext reactContext){
         super(reactContext);
     }
    @Override
    public String getName() {
        return "HelloGPay";
    }

    @ReactMethod
    public void sayHello (String name, Callback cb) {
        try {
            String hello = "Hello " + name;
            cb.invoke(null, hello);
        } catch (Exception err) {
            cb.invoke(err, null);
        }
    }
}

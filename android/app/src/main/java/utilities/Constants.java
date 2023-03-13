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

/** Constants used throughout the app */
public class Constants {

  // SettingsFragment.java constants
  public static final String GOOGLE_PAY_TP_HCE_SERVICE =
      "com.google.android.gms.tapandpay.hce.service.TpHceService";
  public static final String ENVIRONMENT_PROD = "PROD";
  public static final String ENVIRONMENT_SANDBOX = "SANDBOX";
  public static final String GOOGLE_PAY_SANDBOX_FLAG_FILENAME = "android_pay_env_override_sandbox";
  public static final String APACHE_2_0_LICENSE_PATH =
      "file:///android_asset/apache_2.0_license.html";
}

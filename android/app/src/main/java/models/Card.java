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

package com.payunicard.models;

import android.os.Parcel;
import android.os.Parcelable;

/** Data model class for the dummy cards displayed in the application. */
public class Card implements Parcelable {

  /** Builder class used to construct an instance of the data model. */
  public static class CardBuilder {
    private String cardProductName;
    private String last4;
    private int cardArt;
    private boolean isAlreadyAddedToGooglePay;
    private int largeCardArt;
    private String cardExampleText;
    private boolean cardShouldOpenLightThemeDetailedActivity;

    public CardBuilder() {
      // empty constructor
    }

    public CardBuilder setCardProductName(String cardProductName) {
      this.cardProductName = cardProductName;
      return this;
    }

    public CardBuilder setLast4(String last4Digits) {
      this.last4 = last4Digits;
      return this;
    }

    public CardBuilder setCardArt(int cardArt, int largeCardArt) {
      this.cardArt = cardArt;
      this.largeCardArt = largeCardArt;
      return this;
    }

    public CardBuilder setIsAlreadyAddedToGooglePay(boolean isAlreadyAddedToGooglePay) {
      this.isAlreadyAddedToGooglePay = isAlreadyAddedToGooglePay;
      return this;
    }

    public CardBuilder setCardExampleText(String cardExampleText) {
      this.cardExampleText = cardExampleText;
      return this;
    }

    public CardBuilder setCardShouldOpenLightThemeDetailedActivity(
        boolean cardShouldOpenLightThemeDetailedActivity) {
      this.cardShouldOpenLightThemeDetailedActivity = cardShouldOpenLightThemeDetailedActivity;
      return this;
    }

    public Card build() {
      return new Card(
          this.cardProductName,
          this.last4,
          this.cardArt,
          this.isAlreadyAddedToGooglePay,
          this.largeCardArt,
          this.cardExampleText,
          this.cardShouldOpenLightThemeDetailedActivity);
    }
  }

  private String cardProductName;
  private String last4;
  private int cardArt;
  private boolean isAlreadyAddedToGooglePay;
  private int largeCardArt;
  private String cardExampleText;
  private boolean cardShouldOpenLightThemeDetailedActivity;

  private Card(
      String cardProductName,
      String last4,
      int cardArt,
      boolean isAlreadyAddedToGooglePay,
      int largeCardArt,
      String cardExampleText,
      boolean cardShouldOpenLightThemeDetailedActivity) {
    this.cardProductName = cardProductName;
    this.last4 = last4;
    this.cardArt = cardArt;
    this.isAlreadyAddedToGooglePay = isAlreadyAddedToGooglePay;
    this.largeCardArt = largeCardArt;
    this.cardExampleText = cardExampleText;
    this.cardShouldOpenLightThemeDetailedActivity = cardShouldOpenLightThemeDetailedActivity;
  }

  private Card(Parcel in) {
    cardProductName = in.readString();
    last4 = in.readString();
    cardArt = in.readInt();
    isAlreadyAddedToGooglePay = in.readByte() != 0;
    largeCardArt = in.readInt();
    cardExampleText = in.readString();
    cardShouldOpenLightThemeDetailedActivity = (boolean) in.readValue(null);
  }

  public static final Creator<Card> CREATOR =
      new Creator<Card>() {
        @Override
        public Card createFromParcel(Parcel in) {
          return new Card(in);
        }

        @Override
        public Card[] newArray(int size) {
          return new Card[size];
        }
      };

  public String getCardProductName() {
    return cardProductName;
  }

  public String getLast4() {
    return last4;
  }

  public int getCardArt() {
    return cardArt;
  }

  public boolean getIsAlreadyAddedToGooglePay() {
    return isAlreadyAddedToGooglePay;
  }

  public int getLargeCardArt() {
    return largeCardArt;
  }

  public String getCardExampleText() {
    return cardExampleText;
  }

  public boolean getCardShouldOpenLightThemeDetailedActivity() {
    return cardShouldOpenLightThemeDetailedActivity;
  }

  @Override
  public int describeContents() {
    return 0;
  }

  @Override
  public void writeToParcel(Parcel dest, int flags) {
    dest.writeString(cardProductName);
    dest.writeString(last4);
    dest.writeInt(cardArt);
    dest.writeByte((byte) (isAlreadyAddedToGooglePay ? 1 : 0));
    dest.writeInt(largeCardArt);
    dest.writeString(cardExampleText);
    dest.writeValue(cardShouldOpenLightThemeDetailedActivity);
  }
}

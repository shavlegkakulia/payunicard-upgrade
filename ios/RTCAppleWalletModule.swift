//
//  RTCAppleWalletModule.swift
//  Payunicard
//
//  Created by PayUnicard on 8/2/22.
//
import Foundation
import PassKit
import SwiftUI
import UIKit


var callbackAction: RCTResponseSenderBlock!
var callbackAction1: RCTResponseSenderBlock!
private struct Card {
    /// Last four digits of the `pan token` numeration for the card (****-****-****-0000)
    let panTokenSuffix: String
    /// Holder for the card
    let holder: String
}

struct  PrepareDataResponseData: Codable {
    let activationData: String
    let encryptedPassData: String
    let ephemeralPublicKey: String
}

struct PrepareDataResponse: Codable {
    let data:PrepareDataResponseData
}

@objc(RTCAppleWalletModule)



class RTCAppleWalletModule: NSObject {
  var referencedViewController: UIViewController?;
  var presentableViewController: UIViewController;
  override init() {
      presentableViewController = UIViewController()
    
  }

  deinit {
      referencedViewController = nil
  }

  @objc static func requiresMainQueueSetup() -> Bool { return true }
  @available(iOS 13.4, *)

  @objc private func getRemoteElements () -> [PKSecureElementPass] {
    return PKPassLibrary().remoteSecureElementPasses;
    
  }
  

  
  var holderName: String!
  var cardId: Int!
  var cardMask: String!
  var authToken: String!
  
  @objc private func onEcheckElements(_ callback: RCTResponseSenderBlock) -> Void {
    
   if #available(iOS 13.4, *) {
     let availableCardsArray = PKPassLibrary().passes(of:PKPassType.secureElement)
     let cardsDataArray: NSMutableArray = [];
     var cardInfo = [
      "primaryAccountIdentifier": "",
      "primaryAccountNumberSuffix": "",
     ]
     
     for card in availableCardsArray {
       cardInfo["primaryAccountIdentifier"] = card.secureElementPass?.primaryAccountIdentifier;
       cardInfo["primaryAccountNumberSuffix"] = card.secureElementPass?.primaryAccountNumberSuffix;
       cardsDataArray.add(cardInfo)
     }
     callback([cardsDataArray])
    }
  }
    
  @objc private func onEnroll(_ name: String, cardId: Int, cardMask: String, authToken: String, callback successCallback: @escaping RCTResponseSenderBlock) {
    self.holderName = name
    self.cardId = cardId
    self.cardMask = cardMask
    self.authToken = authToken
    callbackAction = successCallback
   
   
    guard isPassKitAvailable() else {
        showPassKitUnavailable(message: "InApp enrollment not available for this device")
        callbackAction(["[InApp enrollment not available for this device], [false]"])
        return
    }
    initEnrollProcess()
    }
    
    /**
     Init enrollment process
     */
    @objc private func initEnrollProcess() {
        let card = cardInformation()
        guard let configuration = PKAddPaymentPassRequestConfiguration(encryptionScheme: .ECC_V2) else {
            showPassKitUnavailable(message: "InApp enrollment configuraton fails")
            callbackAction(["[InApp enrollment configuraton fails], [false]"])
            return
        }
        configuration.cardholderName = card.holder
        configuration.primaryAccountSuffix = card.panTokenSuffix
        
        guard let enrollViewController = PKAddPaymentPassViewController(requestConfiguration: configuration, delegate: self) else {
            showPassKitUnavailable(message: "InApp enrollment controller configuration fails")
            callbackAction(["[InApp enrollment controller configuration fails], [false]"])
            return
        }
    
      
        DispatchQueue.main.async {
           UIApplication.shared.keyWindow?.rootViewController?.present(enrollViewController, animated: true, completion: nil)
        }
    }
    
    /**
     Define if PassKit will be available for this device
     */
    private func isPassKitAvailable() -> Bool {
      return PKAddPaymentPassViewController.canAddPaymentPass()
    }
    
    /**
     Show an alert that indicates that PassKit isn't available for this device
     */
    private func showPassKitUnavailable(message: String) {
        let alert = UIAlertController(title: "InApp Error",
                                      message: message,
                                      preferredStyle: .alert)
        let action = UIAlertAction(title: "Ok", style: .default, handler: nil)
        alert.addAction(action)
      DispatchQueue.main.async {
        UIApplication.shared.keyWindow?.rootViewController?.present(alert, animated: true, completion: nil)
      }
    }
    
    /**
     Return the card information that Apple will display into enrollment screen
     */
    private func cardInformation() -> Card {
        return Card(panTokenSuffix: cardMask, holder: holderName)
    }
}

extension RTCAppleWalletModule: PKAddPaymentPassViewControllerDelegate {
    func addPaymentPassViewController(
        _ controller: PKAddPaymentPassViewController,
        generateRequestWithCertificateChain certificates: [Data],
        nonce: Data, nonceSignature: Data,
        completionHandler handler: @escaping (PKAddPaymentPassRequest) -> Void) {
        
          let nonceString = nonce.base64EncodedString(options: [])
          let nonceSignatureString = nonceSignature.base64EncodedString(options: [])
          var certaDataString: [String] = []
          for cert in certificates {
          let pemCertString = cert.base64EncodedString(options: [
            .lineLength64Characters, .endLineWithLineFeed
          ])
            certaDataString.append(pemCertString)
          }
                  
          // declare the parameter as a dictionary that contains string as key and value combination. considering inputs are valid
          let parameters: [String: Any] = ["cardId": cardId as Any, "nonce": nonceString, "certificates": certaDataString, "nonceSignature": nonceSignatureString]
              // create the url with URL
          let url = URL(string: "https://wapi.payunicard.ge/Card/PrepareDataForAppleWallet")! // change server url accordingly
          // create the session object
          let session = URLSession.shared
          
          // now create the URLRequest object using the url object
          var request = URLRequest(url: url)
          request.httpMethod = "POST" //set http method as POST
          
          // add headers for the request
          request.addValue("application/json", forHTTPHeaderField: "Content-Type") // change as per server requirements
          request.addValue("application/json", forHTTPHeaderField: "Accept")
          request.setValue(authToken, forHTTPHeaderField: "Authorization")
          
          do {
            // convert parameters to Data and assign dictionary to httpBody of request
            request.httpBody = try JSONSerialization.data(withJSONObject: parameters, options: .prettyPrinted)
           
          } catch let error {
            print(error.localizedDescription)
            callbackAction(["[\(error.localizedDescription)], [false]"])

          }
          
          // create dataTask using the session object to send data to the server
          let task = session.dataTask(with: request) { data, response, error in
            
            if let error = error {
              print("Post Request Error: \(error.localizedDescription)")
              callbackAction(["[Post Request Error: \(error.localizedDescription)], [false]"])
              return
            }
            // ensure there is valid response code returned from this HTTP response
            if let httpResponse = response as? HTTPURLResponse {
              if !(200...299).contains(httpResponse.statusCode) {
                print("Invalid Response received from the server")
                callbackAction(["[Invalid Response received from the server], [false]"])
                return
              }
            }
            // ensure there is data returned
            guard let responseData = data else {
              print("nil Data received from the server")
              return
            }
            
            do {
              let decoder = JSONDecoder();

              if let resp = try decoder.decode(PrepareDataResponse.self, from: responseData) as? PrepareDataResponse {

                let requiest = PKAddPaymentPassRequest.init()
                  let encryptedPassData = resp.data.encryptedPassData
                  let activationData = resp.data.activationData
                  let ephemeralPublicKey = resp.data.ephemeralPublicKey
                 
                 requiest.encryptedPassData = Data.init(base64Encoded: encryptedPassData, options: [])
                 requiest.activationData = Data.init(base64Encoded: activationData, options: [])
                 requiest.ephemeralPublicKey = Data.init(base64Encoded: ephemeralPublicKey, options: [])
                //print(Data.init(base64Encoded: ephemeralPublicKey, options: []));
                print(Data.init(base64Encoded: ephemeralPublicKey, options: [])! as NSData)
                 handler(requiest)
            } else {
              print("data maybe corrupted or in wrong format")
              callbackAction(["[data maybe corrupted or in wrong format], [false]"])
              throw URLError(.badServerResponse)
            }
              
            
            } catch let error {
              print(error.localizedDescription)
            }
          }
         
          // perform the task
          task.resume()
       
    }
    
    func addPaymentPassViewController(
        _ controller: PKAddPaymentPassViewController,
        didFinishAdding pass: PKPaymentPass?,
        error: Error?) {
          if error == nil {
          callbackAction(["[success], [true]"])
          } else {
            callbackAction(["[\(error.debugDescription)], [false]"])
          }
            NSLog("<--------addPaymentPassViewController didFinishAdding function called------->")
                   NSLog("<--------addPaymentPassViewController error------->",error.debugDescription)
                   NSLog("<--------addPaymentPassViewController error------->'%@'", error.debugDescription)
            UIApplication.shared.keyWindow?.rootViewController?.dismiss(animated: true, completion: nil)
                   print("addPaymentPassViewController didFinishAdding function called")
        // This method will be called when enroll process ends (with success / error)
    }
}

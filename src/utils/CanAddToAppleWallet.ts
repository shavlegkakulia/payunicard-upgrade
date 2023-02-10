import { ICardsInWallet, onEcheckElements } from "../navigation/AppleWallet/AppleWallet";
import { FETCH_USER_ACCOUNTS } from "../redux/action_types/user_action_types";
import UserService, { IAccountBallances, ICard } from "../services/UserService";
// async (dispatch: any)=> 

export const SetAppleWalletAvailability = (userAccounts: any) =>  async (dispatch: any)=> 
{
    let tempAccounts: any[] = [];
    let userCards: ICard[] = [];
    let cardsInAppleWallet: ICardsInWallet[] = [];
    let cardsIdToCheck: any[] = [];
    let FpanResponse: any[] = [];
    let isAddedToAppleWalletCardId: any[] = [];
    //Storing all user available cards from accounts
    userAccounts?.forEach((ac: { cards: string | any[]; }) => {
        if (ac.cards && ac.cards.length > 0) {
            userCards = [...userCards, ...ac.cards]
        };
    });
    

    //Getting User Cards Stored In Apple Wallet on the device 
    onEcheckElements().then((cardsInWallet: any) => {
        if (cardsInWallet.length > 0) {
            //Checking if user has any card stored in apple wallet on device. If any, comparing each cards cardId to all retrieved card's primaryAccountNumberSuffix.
            //If there are any equal cardID-s, storing them into separate array
            //@ts-ignore
            cardsInWallet.forEach(card => {
                let cardsToCheck = userCards.filter(el => el.maskedCardNumber?.slice(12) == card.primaryAccountNumberSuffix);
                if (cardsToCheck.length > 0) {
                    cardsToCheck.forEach(c => {
                        cardsIdToCheck = [...cardsIdToCheck, c.cardID]
                    })
                }
            })
            //If there is any cardID in the cardsToCheck array, checking them with Prinum Service 
            if (cardsIdToCheck.length > 0) {
                UserService.CheckAddToWalletAvailability(cardsIdToCheck).then(res => {
                    FpanResponse = res.data.data.fpans;
                    console.log('FpanResposne', FpanResponse)
                    //Check if any received Fpans and Fpans retrieved from Apple Wallet app from the device are the same
                    cardsInWallet.forEach((card: any) => {
                        let checkedCards = FpanResponse.filter((el: any) => el.fPanID == card.primaryAccountIdentifier);
                        console.log('checkedCards =====>>', checkedCards.length)
                        if (checkedCards.length > 0) {
                            console.log('pushing')
                            isAddedToAppleWalletCardId = [...isAddedToAppleWalletCardId, ...checkedCards]
                        }
                        console.log('pushing finished', isAddedToAppleWalletCardId)
                    });
                        
                    //@ts-ignore
                    tempAccounts = userAccounts.map(ac => {
                        ac.cards?.map((c: any) => {
                            console.log('cardID ==>', c.cardID)
                            let tempCard = isAddedToAppleWalletCardId.filter(el => el.cardId == c.cardID)
                            if (tempCard.length > 0) {
                                console.log("cant add ", c.cardID)
                                c.canAddToAppleWallet = false;
                            } else {
                                c.canAddToAppleWallet = true;
                            }
                            return c;
                        })
                        return ac
                    })
                }).catch(err => {
                    console.log(JSON.stringify(err?.response?.data?.message))
                })
            };
        }
        //assining a status to a card if it can be added to a wallet or not 
        dispatch({
            type: FETCH_USER_ACCOUNTS,
            userAccounts: {
                accountBallances: [
                    ...userAccounts?.accountBallances,
                    ...tempAccounts,
                ],
            },
        });
    }).catch(err => {
        console.log(JSON.stringify(err?.response?.data?.message))
    });



}
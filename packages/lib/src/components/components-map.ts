/** Components */
import AfterPay from './AfterPay';
import AfterPayB2B from './AfterPay/AfterPayB2B';
import AmazonPay from './AmazonPay';
import ANCV from './ANCV';
import ApplePay from './ApplePay';
import Atome from './Atome';
import { BillDeskOnline, BillDeskWallet } from './BillDesk';
import Card from './Card';
import CashAppPay from './CashAppPay';
import ClickToPay from './ClickToPay';
import Bancontact from './Card/Bancontact';
import Donation from './Donation';
import Giropay from './Giropay';
import GooglePay from './GooglePay';
import Econtext from './Econtext';
import { FacilyPay3x, FacilyPay4x, FacilyPay6x, FacilyPay10x, FacilyPay12x } from './FacilyPay';
import PayPal from './PayPal';
import Redirect from './Redirect';
import CustomCard from './CustomCard';
import Sepa from './Sepa';
import WeChat from './WeChat';
import PayNow from './PayNow';
import BcmcMobile from './BcmcMobile';
import { MolPayEBankingMY, MolPayEBankingTH, MolPayEBankingVN } from './MolPayEBanking';
import Dragonpay from './Dragonpay';
import Doku from './Doku';
import Boleto from './Boleto';
import Oxxo from './Oxxo';
import Multibanco from './Multibanco';
import Dotpay from './Dotpay';
import Eps from './EPS';
import Giftcard from './Giftcard';
import Vipps from './Vipps';
import { PayuCashcard, PayuNetBanking } from './PayU';
import RatePay from './RatePay';
import Swish from './Swish';
import Ach from './Ach';
import MBWay from './MBWay';
import Blik from './Blik';
import BankTransfer from './BankTransfer';
import Affirm from './Affirm';
import Pix from './Pix';
import BacsDD from './BacsDD';
import Address from './Address';
import PersonalDetails from './PersonalDetails';
import Klarna from './Klarna';
import Twint from './Twint';
import MealVoucherFR from './MealVoucherFR';
import OnlineBankingIN from './OnlineBankingIN';
import OnlineBankingPL from './OnlineBankingPL';
import RatePayDirectDebit from './RatePay/RatePayDirectDebit';
import UPI from './UPI';
import WalletINElement from './WalletIN';
import OnlineBankingCZ from './OnlineBankingCZ';
import OnlineBankingSK from './OnlineBankingSK';
import PayByBank from './PayByBank';
import PromptPay from './PromptPay';
import Duitnow from './DuitNow';
import Trustly from './Trustly';
import Riverty from './Riverty';
import PayByBankUS from './PayByBankUS';
import Fastlane from './PayPalFastlane/Fastlane';
import PreAuthorizedDebitCanada from './PreAuthorizedDebitCanada';
import PayTo from './PayTo/PayTo';
import PayByBankPix from './PayByBankPix';

import { TxVariants } from './tx-variants';

/**
 * Maps each tx variant to a Component element.
 *
 * WARNING: This mapping must be imported carefully as it breaks the tree-shaking. It is now used in:
 * - The utility function 'createComponent' for UMD bundle (UMD bundle does not have tree-shaking, so this use-case is fine)
 * - Generating Drop-in Typescript types (Typescript types do not break tree-shaking)
 */
export const ComponentsMap = {
    /** internal */
    [TxVariants.address]: Address,
    [TxVariants.donation]: Donation,
    [TxVariants.personal_details]: PersonalDetails,
    /** internal */

    /** Bank Transfer */
    [TxVariants.bankTransfer_IBAN]: BankTransfer,
    [TxVariants.bankTransfer_BE]: BankTransfer,
    [TxVariants.bankTransfer_NL]: BankTransfer,
    [TxVariants.bankTransfer_PL]: BankTransfer,
    [TxVariants.bankTransfer_FR]: BankTransfer,
    [TxVariants.bankTransfer_CH]: BankTransfer,
    [TxVariants.bankTransfer_IE]: BankTransfer,
    [TxVariants.bankTransfer_GB]: BankTransfer,
    [TxVariants.bankTransfer_DE]: BankTransfer,
    [TxVariants.bankTransfer_AE]: BankTransfer,
    [TxVariants.bankTransfer_AT]: BankTransfer,
    [TxVariants.bankTransfer_AU]: BankTransfer,
    [TxVariants.bankTransfer_BG]: BankTransfer,
    [TxVariants.bankTransfer_CA]: BankTransfer,
    [TxVariants.bankTransfer_EE]: BankTransfer,
    [TxVariants.bankTransfer_ES]: BankTransfer,
    [TxVariants.bankTransfer_FI]: BankTransfer,
    [TxVariants.bankTransfer_HK]: BankTransfer,
    [TxVariants.bankTransfer_HU]: BankTransfer,
    [TxVariants.bankTransfer_IT]: BankTransfer,
    [TxVariants.bankTransfer_JP]: BankTransfer,
    [TxVariants.bankTransfer_LU]: BankTransfer,
    [TxVariants.bankTransfer_NZ]: BankTransfer,
    [TxVariants.bankTransfer_PT]: BankTransfer,
    [TxVariants.bankTransfer_SG]: BankTransfer,
    [TxVariants.bankTransfer_SK]: BankTransfer,
    [TxVariants.bankTransfer_US]: BankTransfer,
    /** Bank Transfer */

    /** Card */
    [TxVariants.bcmc]: Bancontact,
    [TxVariants.card]: Card,
    [TxVariants.scheme]: Card,
    [TxVariants.storedCard]: Card,
    [TxVariants.customCard]: CustomCard,
    /** Card */

    /** Direct debit */
    [TxVariants.ach]: Ach,
    [TxVariants.directdebit_GB]: BacsDD,
    [TxVariants.sepadirectdebit]: Sepa,
    [TxVariants.eft_directdebit_CA]: PreAuthorizedDebitCanada,
    /** Direct debit */

    /** Open Invoice */
    [TxVariants.affirm]: Affirm,
    [TxVariants.afterpay]: AfterPay,
    [TxVariants.afterpay_default]: AfterPay,
    [TxVariants.afterpay_b2b]: AfterPayB2B,
    [TxVariants.atome]: Atome,
    [TxVariants.facilypay_3x]: FacilyPay3x,
    [TxVariants.facilypay_4x]: FacilyPay4x,
    [TxVariants.facilypay_6x]: FacilyPay6x,
    [TxVariants.facilypay_10x]: FacilyPay10x,
    [TxVariants.facilypay_12x]: FacilyPay12x,
    [TxVariants.ratepay]: RatePay,
    [TxVariants.ratepay_directdebit]: RatePayDirectDebit,
    /** Open Invoice */

    /** Wallets */
    [TxVariants.amazonpay]: AmazonPay,
    [TxVariants.applepay]: ApplePay,
    [TxVariants.cashapp]: CashAppPay,
    [TxVariants.clicktopay]: ClickToPay,
    [TxVariants.googlepay]: GooglePay,
    [TxVariants.paypal]: PayPal,
    [TxVariants.fastlane]: Fastlane,
    [TxVariants.paywithgoogle]: GooglePay,
    /** Wallets */

    /** Voucher */
    [TxVariants.boletobancario]: Boleto,
    [TxVariants.boletobancario_itau]: Boleto,
    [TxVariants.boletobancario_santander]: Boleto,
    [TxVariants.doku]: Doku,
    [TxVariants.doku_alfamart]: Doku,
    [TxVariants.doku_permata_lite_atm]: Doku,
    [TxVariants.doku_indomaret]: Doku,
    [TxVariants.doku_atm_mandiri_va]: Doku,
    [TxVariants.doku_sinarmas_va]: Doku,
    [TxVariants.doku_mandiri_va]: Doku,
    [TxVariants.doku_cimb_va]: Doku,
    [TxVariants.doku_danamon_va]: Doku,
    [TxVariants.doku_bri_va]: Doku,
    [TxVariants.doku_bni_va]: Doku,
    [TxVariants.doku_bca_va]: Doku,
    [TxVariants.doku_wallet]: Doku,
    [TxVariants.oxxo]: Oxxo,
    [TxVariants.primeiropay_boleto]: Boleto,
    /** Voucher */

    /** issuerList */
    [TxVariants.billdesk_online]: BillDeskOnline,
    [TxVariants.billdesk_wallet]: BillDeskWallet,
    [TxVariants.dotpay]: Dotpay,
    [TxVariants.eps]: Eps,
    [TxVariants.molpay_ebanking_fpx_MY]: MolPayEBankingMY,
    [TxVariants.molpay_ebanking_TH]: MolPayEBankingTH,
    [TxVariants.molpay_ebanking_VN]: MolPayEBankingVN,
    [TxVariants.onlineBanking_CZ]: OnlineBankingCZ,
    [TxVariants.onlinebanking_IN]: OnlineBankingIN, // NOTE: the txVariant does have a lowercase "b"
    [TxVariants.onlineBanking_PL]: OnlineBankingPL,
    [TxVariants.onlineBanking_SK]: OnlineBankingSK,
    [TxVariants.paybybank]: PayByBank,
    [TxVariants.payu_IN_cashcard]: PayuCashcard,
    [TxVariants.payu_IN_nb]: PayuNetBanking,
    [TxVariants.wallet_IN]: WalletINElement,
    /** issuerList */

    /** Dragonpay */
    [TxVariants.dragonpay_ebanking]: Dragonpay,
    [TxVariants.dragonpay_otc_banking]: Dragonpay,
    [TxVariants.dragonpay_otc_non_banking]: Dragonpay,
    [TxVariants.dragonpay_otc_philippines]: Dragonpay,
    /** Dragonpay */

    /** Econtext */
    [TxVariants.econtext_atm]: Econtext,
    [TxVariants.econtext_online]: Econtext,
    [TxVariants.econtext_seven_eleven]: Econtext,
    [TxVariants.econtext_stores]: Econtext,
    /** Econtext */

    /** Redirect */
    [TxVariants.giropay]: Giropay,
    [TxVariants.multibanco]: Multibanco,
    [TxVariants.redirect]: Redirect,
    [TxVariants.twint]: Twint,
    [TxVariants.vipps]: Vipps,
    [TxVariants.trustly]: Trustly,
    [TxVariants.paybybank_AIS_DD]: PayByBankUS,
    [TxVariants.riverty]: Riverty,
    [TxVariants.paybybank_pix]: PayByBankPix,
    /** Redirect */

    /** Klarna */
    [TxVariants.klarna]: Klarna,
    [TxVariants.klarna_account]: Klarna,
    [TxVariants.klarna_paynow]: Klarna,
    [TxVariants.klarna_b2b]: Klarna,
    /** Klarna */

    /** QRLoader */
    [TxVariants.bcmc_mobile]: BcmcMobile,
    [TxVariants.bcmc_mobile_QR]: BcmcMobile,
    [TxVariants.pix]: Pix,
    [TxVariants.swish]: Swish,
    [TxVariants.wechatpay]: WeChat,
    [TxVariants.wechatpayQR]: WeChat,
    [TxVariants.promptpay]: PromptPay,
    [TxVariants.paynow]: PayNow,
    [TxVariants.duitnow]: Duitnow,
    /** QRLoader */

    /** Await */
    [TxVariants.blik]: Blik,
    [TxVariants.mbway]: MBWay,
    [TxVariants.ancv]: ANCV,
    [TxVariants.payto]: PayTo,
    [TxVariants.upi]: UPI, // also QR
    [TxVariants.upi_qr]: UPI, // also QR
    [TxVariants.upi_collect]: UPI, // also QR
    [TxVariants.upi_intent]: UPI,
    /** Await */

    /** Giftcard */
    [TxVariants.giftcard]: Giftcard,
    [TxVariants.mealVoucher_FR_natixis]: MealVoucherFR,
    [TxVariants.mealVoucher_FR_sodexo]: MealVoucherFR,
    [TxVariants.mealVoucher_FR_groupeup]: MealVoucherFR
    /** Giftcard */
};

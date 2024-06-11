import paymentsConfig from "@/app/_utils/paymentsConfig";
import { DEFAULT_SHOPPER_REFERENCE } from "@/app/_utils/constants";

async function makeSessionsSetupCall({ countryCode, amount, shopperLocale }) {
    try {
        const sessionsPayload = {
            amount,
            countryCode,
            shopperLocale,
            blockedPaymentMethods: ["wechatpayWeb"],
            channel: "Web",
            shopperReference: DEFAULT_SHOPPER_REFERENCE,
            lineItems: paymentsConfig.lineItems,
            reference: paymentsConfig.reference,
            returnUrl: paymentsConfig.returnUrl,
            shopperEmail: paymentsConfig.shopperEmail,
        };

        const response = await fetch("/api/sessions-setup", {
            method: "POST",
            body: JSON.stringify(sessionsPayload),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });

        if (response) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error("Error during sessions setup call", error);
    }
}

export default makeSessionsSetupCall;

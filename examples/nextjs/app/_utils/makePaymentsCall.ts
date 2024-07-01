import paymentsConfig from "./paymentsConfig";
import { DEFAULT_SHOPPER_REFERENCE } from "@/app/_utils/constants";
import type { PaymentData } from "@adyen/adyen-web";

async function makePaymentsCall(
    data: PaymentData,
    countryCode,
    shopperLocale,
    amount,
) {
    const paymentsRequest = {
        ...paymentsConfig,
        ...data,
        countryCode,
        shopperLocale,
        amount,
        shopperReference: DEFAULT_SHOPPER_REFERENCE,
        channel: "Web",
    };

    try {
        const response = await fetch("/api/payments", {
            method: "POST",
            body: JSON.stringify(paymentsRequest),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });

        if (response) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error("Error during /payments call", error);
    }
}

export default makePaymentsCall;

import { DEFAULT_SHOPPER_REFERENCE } from "@/app/_utils/constants";

async function makePaymentMethodsCall({ countryCode, shopperLocale, amount }) {
    try {
        const paymentMethodsConfig = {
            countryCode,
            shopperLocale,
            amount,
            channel: "Web",
            shopperName: {
                firstName: "Jonny",
                lastName: "Jansen",
                gender: "MALE",
            },
            shopperReference: DEFAULT_SHOPPER_REFERENCE,
            telephoneNumber: "0612345678",
            shopperEmail: "test@adyen.com",
            dateOfBirth: "1970-07-10",
        };

        const response = await fetch("/api/paymentMethods", {
            method: "POST",
            body: JSON.stringify(paymentMethodsConfig),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });

        if (response) {
            const { paymentMethodsResponse } = await response.json();
            return paymentMethodsResponse;
        }
    } catch (error) {
        console.log(error);
    }
}

export default makePaymentMethodsCall;

import type { AdditionalDetailsStateData } from "@adyen/adyen-web";

async function makeDetailsCall(data: AdditionalDetailsStateData["data"]) {
    try {
        const response = await fetch("/api/paymentDetails", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });

        if (response) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.log(error);
    }
}

export default makeDetailsCall;

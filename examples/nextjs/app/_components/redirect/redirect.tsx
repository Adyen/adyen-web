"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AdyenCheckout, AdyenCheckoutError, UIElement } from "@adyen/adyen-web";
import makeDetailsCall from "@/app/_utils/makeDetailsCall";
import type {
    AdditionalDetailsActions,
    AdditionalDetailsData,
    PaymentCompletedData,
    PaymentFailedData,
} from "@adyen/adyen-web";

export default function Redirect() {
    const isRedirectHandled = useRef<boolean>(false);
    const searchParams = useSearchParams();

    const handleRedirectResult = useCallback(
        async (redirectResult: string, sessionId: string) => {
            const isSessionsFlow = !!sessionId;

            const checkout = await AdyenCheckout({
                analytics: {
                    enabled: false,
                },
                clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY,
                environment: "test",
                countryCode: "US",

                // If it is sessions flow, pass the sessionId back to the library
                ...(isSessionsFlow && {
                    session: {
                        id: sessionId,
                    },
                }),

                // If it is NOT sessions flow, add the 'onAdditionalDetails' so you can handle the /payment/details part here
                ...(!isSessionsFlow && {
                    onAdditionalDetails: async (
                        state: AdditionalDetailsData,
                        component: UIElement,
                        actions: AdditionalDetailsActions,
                    ) => {
                        try {
                            const { resultCode } = await makeDetailsCall(
                                state.data,
                            );
                            actions.resolve({ resultCode });
                        } catch (error) {
                            console.error(error);
                            actions.reject();
                        }
                    },
                }),

                onPaymentCompleted(
                    data: PaymentCompletedData,
                    component?: UIElement,
                ) {
                    document.querySelector(
                        "#result-container > pre",
                    ).innerHTML = JSON.stringify(data, null, "\t");
                },
                onPaymentFailed(
                    data?: PaymentFailedData,
                    component?: UIElement,
                ) {
                    document.querySelector(
                        "#result-container > pre",
                    ).innerHTML = "Payment failed";
                },
                onError: (error: AdyenCheckoutError) => {
                    console.error("Something went wrong", error);
                },
            });

            checkout.submitDetails({ details: { redirectResult } });
        },
        [],
    );

    useEffect(() => {
        const redirectResult = searchParams.get("redirectResult");
        const sessionId = searchParams.get("sessionId");

        if (redirectResult) {
            if (isRedirectHandled.current) return;

            isRedirectHandled.current = true;
            void handleRedirectResult(redirectResult, sessionId);
        } else {
            document.querySelector("#result-container").innerHTML =
                "No redirectResult available";
        }
    }, [searchParams, handleRedirectResult]);

    return (
        <div id="result-container">
            <pre>Loading...</pre>
        </div>
    );
}

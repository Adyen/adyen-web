"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
    AdditionalDetailsStateData,
    AdyenCheckout,
    CheckoutAdvancedFlowResponse,
    PaymentCompletedData,
    PaymentFailedData,
} from "@adyen/adyen-web";
import makeDetailsCall from "@/app/_utils/makeDetailsCall";

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
                        // TODO: remove sesiondata once type is fixed
                        sessionData: "",
                    },
                }),

                // If it is NOT sessions flow, add the 'onAdditionalDetails' so you can handle the /payment/details part here
                ...(!isSessionsFlow && {
                    onAdditionalDetails: async (
                        state: AdditionalDetailsStateData,
                        component: any,
                        actions: {
                            resolve: (
                                response: CheckoutAdvancedFlowResponse,
                            ) => void;
                            reject: () => void;
                        },
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
                    component?: any,
                ) {
                    document.querySelector(
                        "#result-container > pre",
                    ).innerHTML = JSON.stringify(data, null, "\t");
                },
                onPaymentFailed(data?: PaymentFailedData, component?: any) {
                    document.querySelector(
                        "#result-container > pre",
                    ).innerHTML = "Payment failed";
                },
                onError: (error) => {
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
        <main id="redirect-result-page">
            <h1>Redirect Result Page</h1>
            <div id="result-container">
                <pre>Loading...</pre>
            </div>
        </main>
    );
}

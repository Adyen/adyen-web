"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
    AdyenCheckout,
    Dropin,
    Card,
    Ach,
    Affirm,
    ApplePay,
    CashAppPay,
    Doku,
    Giftcard,
    GooglePay,
    PayPal,
    UPI,
    WeChat,
} from "@adyen/adyen-web";
import "@adyen/adyen-web/styles/adyen.css";
import type {
    CoreConfiguration,
    DropinConfiguration,
    PaymentMethodsRequestData,
    PaymentMethodsResponse,
    CheckoutAdvancedFlowResponse,
    PaymentData,
    AdditionalDetailsStateData,
} from "@adyen/adyen-web";

import {
    DEFAULT_AMOUNT,
    DEFAULT_COUNTRY,
    DEFAULT_LOCALE,
} from "@/app/_utils/constants";
import makePaymentsCall from "@/app/_utils/makePaymentsCall";
import makePaymentMethodsCall from "@/app/_utils/makePaymentMethodsCall";
import makeDetailsCall from "@/app/_utils/makeDetailsCall";
import { parseAmount } from "@/app/_utils/amount-utils";

export default function AdvancedFlow() {
    const dropinRef = useRef<HTMLDivElement>(null);
    const isAdyenWebInitialized = useRef<boolean>(false);
    const searchParams = useSearchParams();

    const loadAdyen = useCallback(async () => {
        const countryCode = searchParams.get("countryCode") || DEFAULT_COUNTRY;
        const locale = searchParams.get("shopperLocale") || DEFAULT_LOCALE;
        const amount = parseAmount(
            searchParams.get("amount") || DEFAULT_AMOUNT,
            countryCode,
        );

        const paymentMethodsResponse = await makePaymentMethodsCall({
            countryCode,
            amount,
            shopperLocale: locale,
        });

        const options: CoreConfiguration = {
            clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY,
            countryCode,
            amount,
            locale,
            environment: "test",
            analytics: {
                enabled: false,
            },
            paymentMethodsResponse,

            onSubmit: async (
                state: { data: PaymentData; isValid: boolean },
                component: any,
                actions: {
                    resolve: (response: CheckoutAdvancedFlowResponse) => void;
                    reject: (
                        error?: Pick<CheckoutAdvancedFlowResponse, "error">,
                    ) => void;
                },
            ) => {
                try {
                    const result = await makePaymentsCall(
                        state.data,
                        countryCode,
                        locale,
                        amount,
                    );

                    if (!result.resultCode) {
                        actions.reject();
                        return;
                    }

                    const { resultCode, action, order, donationToken } = result;

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken,
                    });
                } catch (error) {
                    console.error("onSubmit", error);
                    actions.reject();
                }
            },
            onPaymentMethodsRequest(
                data: PaymentMethodsRequestData,
                actions: {
                    resolve: (response: PaymentMethodsResponse) => void;
                    reject: () => void;
                },
            ) {
                // TODO
            },

            onAdditionalDetails: async (
                state: AdditionalDetailsStateData,
                component: any,
                actions: {
                    resolve: (response: CheckoutAdvancedFlowResponse) => void;
                    reject: () => void;
                },
            ) => {
                try {
                    const result = await makeDetailsCall(state.data);

                    if (!result.resultCode) {
                        actions.reject();
                        return;
                    }

                    const { resultCode, action, order, donationToken } = result;

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken,
                    });
                } catch (error) {
                    console.error("onSubmit", error);
                    actions.reject();
                }
            },
            onError(error) {
                console.error("Something went wrong", error);
            },
            onPaymentCompleted(data, element) {
                console.log(data, element);
            },
            onPaymentFailed(data, element) {
                console.log(data, element);
            },
        };

        const checkout = await AdyenCheckout(options);

        const dropinConfiguration: DropinConfiguration = {
            paymentMethodsConfiguration: {
                card: {
                    _disableClickToPay: true,
                },
            },
            paymentMethodComponents: [
                Card,
                PayPal,
                Ach,
                Affirm,
                ApplePay,
                CashAppPay,
                Doku,
                Giftcard,
                GooglePay,
                UPI,
                WeChat,
            ],
        };

        if (dropinRef.current) {
            new Dropin(checkout, dropinConfiguration).mount(dropinRef.current);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!isAdyenWebInitialized.current) {
            isAdyenWebInitialized.current = true;
            loadAdyen();
        }
    }, [loadAdyen]);

    return <div ref={dropinRef} id="dropin"></div>;
}

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
    AdyenCheckout,
    Dropin,
    Card,
    CashAppPay,
    GooglePay,
    PayPal,
    UIElement,
    AdyenCheckoutError,
} from "@adyen/adyen-web";
import "@adyen/adyen-web/styles/adyen.css";
import type {
    PaymentFailedData,
    PaymentCompletedData,
    CoreConfiguration,
    DropinConfiguration,
} from "@adyen/adyen-web";
import {
    DEFAULT_AMOUNT,
    DEFAULT_COUNTRY,
    DEFAULT_LOCALE,
} from "@/app/_utils/constants";
import makeSessionsSetupCall from "../../_utils/makeSessionsSetupCall";
import { parseAmount } from "@/app/_utils/amount-utils";

export default function SessionsFlow() {
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

        const session = await makeSessionsSetupCall({
            countryCode,
            amount,
            shopperLocale: locale,
        });

        const options: CoreConfiguration = {
            clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY,
            session: {
                id: session.id,
                sessionData: session.sessionData,
            },
            countryCode,
            amount,
            locale,
            environment: "test",
            analytics: {
                enabled: false,
            },
            onError(error: AdyenCheckoutError) {
                console.error("Something went wrong", error);
            },
            onPaymentCompleted(data: PaymentCompletedData, element: UIElement) {
                console.log(data, element);
            },
            onPaymentFailed(data: PaymentFailedData, element: UIElement) {
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
            paymentMethodComponents: [Card, PayPal, CashAppPay, GooglePay],
        };

        if (dropinRef.current) {
            new Dropin(checkout, dropinConfiguration).mount(dropinRef.current);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!isAdyenWebInitialized.current) {
            isAdyenWebInitialized.current = true;
            void loadAdyen();
        }
    }, [loadAdyen]);

    return <div ref={dropinRef} id="dropin"></div>;
}

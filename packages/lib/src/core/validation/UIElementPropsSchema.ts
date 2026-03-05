import { z } from 'zod/mini';

const PaymentAmountSchema = z.object({
    value: z.number(),
    currency: z.string()
});

export const UIElementPropsSchema = z.looseObject({
    // Merchant-facing props
    type: z.optional(z.string()),
    name: z.optional(z.string()),
    icon: z.optional(z.string()),
    amount: z.optional(PaymentAmountSchema),
    secondaryAmount: z.optional(PaymentAmountSchema),
    showPayButton: z.optional(z.boolean()),
    environment: z.optional(z.string()),
    clientKey: z.optional(z.string()),
    isInstantPayment: z.optional(z.boolean()),
    label: z.optional(z.string()),
    paymentMethodId: z.optional(z.string()),
    storedPaymentMethodId: z.optional(z.string()),

    // Callbacks
    beforeRedirect: z.optional(z.function()),
    beforeSubmit: z.optional(z.function()),
    onSubmit: z.optional(z.function()),
    onAdditionalDetails: z.optional(z.function()),
    onPaymentFailed: z.optional(z.function()),
    onPaymentCompleted: z.optional(z.function()),
    onOrderUpdated: z.optional(z.function()),
    onPaymentMethodsRequest: z.optional(z.function()),
    onChange: z.optional(z.function()),
    onActionHandled: z.optional(z.function()),
    onError: z.optional(z.function()),
    onEnterKeyPressed: z.optional(z.function()),
    onComplete: z.optional(z.function()),

    // Internal props — allowed but not validated strictly
    session: z.optional(z.unknown()),
    isStoredPaymentMethod: z.optional(z.boolean()),
    oneClick: z.optional(z.boolean()),
    statusType: z.optional(z.enum(['redirect', 'loading', 'custom'])),
    payButton: z.optional(z.function()),
    loadingContext: z.optional(z.string()),
    createFromAction: z.optional(z.function()),
    elementRef: z.optional(z.unknown()),
    i18n: z.optional(z.unknown()),
    paymentMethodType: z.optional(z.string()),
    originalAction: z.optional(z.unknown()),
    order: z.optional(z.unknown()),
    modules: z.optional(z.unknown()),
    isDropin: z.optional(z.boolean())
});

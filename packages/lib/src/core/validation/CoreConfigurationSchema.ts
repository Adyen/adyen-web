import { z } from 'zod/mini';

const EnvironmentSchema = z.enum(['test', 'live', 'live-us', 'live-au', 'live-apse', 'live-in']);

const PaymentAmountSchema = z.object({
    value: z.number(),
    currency: z.string()
});

const SessionSchema = z.object({
    id: z.string(),
    sessionData: z.optional(z.string()),
    shopperEmail: z.optional(z.string()),
    telephoneNumber: z.optional(z.string())
});

const AriaAttributesSchema = z.object({
    'aria-relevant': z.optional(z.enum(['additions', 'all', 'removals', 'text', 'additions text'])),
    'aria-live': z.optional(z.enum(['off', 'polite', 'assertive'])),
    'aria-atomic': z.optional(z.enum(['true', 'false']))
});

const SRPanelConfigSchema = z.object({
    enabled: z.optional(z.boolean()),
    node: z.optional(z.string()),
    showPanel: z.optional(z.boolean()),
    moveFocus: z.optional(z.boolean()),
    id: z.optional(z.string()),
    ariaAttributes: z.optional(AriaAttributesSchema)
});

const ApplicationInfoSchema = z.object({
    externalPlatform: z.object({
        name: z.string(),
        version: z.string(),
        integrator: z.string()
    }),
    merchantApplication: z.object({
        name: z.string(),
        version: z.string()
    }),
    merchantDevice: z.optional(
        z.object({
            os: z.string(),
            osVersion: z.string()
        })
    )
});

const AnalyticsOptionsSchema = z.object({
    enabled: z.optional(z.boolean()),
    analyticsData: z.optional(
        z.object({
            applicationInfo: z.optional(ApplicationInfoSchema),
            checkoutAttemptId: z.optional(z.string())
        })
    )
});

const RiskModuleOptionsSchema = z.record(z.string(), z.unknown());

const OrderSchema = z.record(z.string(), z.unknown());

const EnvironmentUrlsSchema = z.object({
    api: z.optional(z.string()),
    analytics: z.optional(z.string()),
    cdn: z.optional(
        z.object({
            images: z.optional(z.string()),
            translations: z.optional(z.string())
        })
    )
});

export const CoreConfigurationSchema = z.strictObject({
    session: z.optional(SessionSchema),
    environment: z.optional(EnvironmentSchema),
    showPayButton: z.optional(z.boolean()),
    clientKey: z.optional(z.string()),
    locale: z.optional(z.string()),
    translations: z.optional(z.record(z.string(), z.unknown())),
    paymentMethodsResponse: z.optional(z.record(z.string(), z.unknown())),
    amount: z.optional(PaymentAmountSchema),
    secondaryAmount: z.optional(PaymentAmountSchema),
    countryCode: z.optional(z.string()),
    allowPaymentMethods: z.optional(z.array(z.string())),
    removePaymentMethods: z.optional(z.array(z.string())),
    srConfig: z.optional(SRPanelConfigSchema),
    analytics: z.optional(AnalyticsOptionsSchema),
    risk: z.optional(RiskModuleOptionsSchema),
    order: z.optional(OrderSchema),
    exposeLibraryMetadata: z.optional(z.boolean()),

    // Callbacks
    beforeRedirect: z.optional(z.function()),
    beforeSubmit: z.optional(z.function()),
    onPaymentCompleted: z.optional(z.function()),
    onPaymentFailed: z.optional(z.function()),
    onSubmit: z.optional(z.function()),
    onAdditionalDetails: z.optional(z.function()),
    afterAdditionalDetails: z.optional(z.function()),
    onActionHandled: z.optional(z.function()),
    onChange: z.optional(z.function()),
    onError: z.optional(z.function()),
    onBalanceCheck: z.optional(z.function()),
    onOrderRequest: z.optional(z.function()),
    onEnterKeyPressed: z.optional(z.function()),
    onPaymentMethodsRequest: z.optional(z.function()),
    onOrderCancel: z.optional(z.function()),
    onOrderUpdated: z.optional(z.function()),

    // Internal props
    loadingContext: z.optional(z.string()),
    _environmentUrls: z.optional(EnvironmentUrlsSchema)
});

export type CoreConfigurationFromSchema = z.infer<typeof CoreConfigurationSchema>;

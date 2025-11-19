export const URL_MAP = {
    /* Drop-in */
    dropinWithSession: '/iframe.html?args=&globals=&id=dropin-dropin-component--default&viewMode=story',
    dropinWithAdvanced: '/iframe.html?globals=&args=useSessions:!false&id=dropin-dropin-component--default&viewMode=story',
    dropinSessions_zeroAuthCard_success:
        '/iframe.html?globals=&args=amount:0;sessionData.recurringProcessingModel:CardOnFile;sessionData.storePaymentMethodMode:askForConsent&id=dropin-dropin-component--default&viewMode=story',
    dropinSessions_zeroAuthCard_fail:
        '/iframe.html?globals=&args=amount:0;sessionData.recurringProcessingModel:CardOnFile;sessionData.storePaymentMethodMode:askForConsent;sessionData.enableOneClick:!true&id=dropin-dropin-component--default&viewMode=story',
    dropinWithSession_BCMC_noStoredPms: '/iframe.html?args=countryCode:BE&globals=&id=dropin-dropin-component--default&viewMode=story',

    /**
     * Card
     */
    card: '/iframe.html?args=&id=components-cards--default&viewMode=story',
    cardWithVisibleSrPanel: '/iframe.html?args=srConfig.showPanel:!true&globals=&id=components-cards--default&viewMode=story',
    cardWithSsn: '/iframe.html?globals=&id=components-cards--with-ssn&viewMode=story',
    cardWithAdvancedFlow: '/iframe.html?args=useSessions:!false&globals=&id=components-cards--default&viewMode=story',
    cardWithOwnOnAdditionalDetailsCallback:
        '/iframe.html?args=useSessions:!false&globals=&id=components-cards--card-with-3-ds-2-own-on-additional-details&viewMode=story',
    cardWithAvs: '/iframe.html?args=&globals=&id=components-cards--with-avs&viewMode=story',
    cardWithPartialAvs: '/iframe.html?args=&globals=&id=components-cards--with-partial-avs&viewMode=story',
    cardWithInstallments: '/iframe.html?args=&id=components-cards--with-installments&viewMode=story',
    cardWithKcp: '/iframe.html?args=&globals=&id=components-cards--with-kcp&viewMode=story',
    cardWithClickToPay: '/iframe.html?args=&id=components-cards--with-click-to-pay&viewMode=story',
    cardWithFastlane: '/iframe.html?args=&globals=&id=components-cards--with-mocked-fastlane&viewMode=story',
    fullAvsWithoutPrefilledDataUrl: '/iframe.html?args=componentConfiguration.data:!undefined&globals=&id=components-cards--with-avs&viewMode=story',
    fullAvsWithPrefilledDataUrl: '/iframe.html?globals=&args=&id=components-cards--with-avs&viewMode=story',
    addressLookupUrl: '/iframe.html?id=components-cards--with-avs-address-lookup&viewMode=story',
    bcmc: '/iframe.html?args=&globals=&id=components-cards-bancontact--default&viewMode=story',
    /* Custom card */
    customCard: '/iframe.html?globals=&args=&id=components-cards-custom-card--default&viewMode=story',
    customCardSeparateExpiryDate: '/iframe.html?globals=&args=&id=components-cards-custom-card--variant&viewMode=story',
    /* Await */
    ancv: '/iframe.html?args=useSessions:!true&globals=&id=components-ancv--default&viewMode=story',
    /* Issuer list */
    onlineBankingPL: '/iframe.html?args=&globals=&id=components-issuerlist-onlinebankingpl--default&viewMode=story',
    /* Open invoice */
    riverty: '/iframe.html?globals=&args=&id=components-riverty--default&viewMode=story',
    /* Redirect */
    ideal: '/iframe.html?globals=&id=components-redirect--ideal&viewMode=story',
    giftcard_with_card: '/iframe.html?args=&globals=&id=components-gift-cards--default&viewMode=story',
    giftcard_with_giftcard: '/iframe.html?args=&globals=&id=components-gift-cards--with-giftcard&viewMode=story',

    /**
     * Vouchers
     */
    boleto: '/iframe.html?globals=&id=components-vouchers-boleto--default&viewMode=story',
    bacsDirectDebit: '/iframe.html?globals=&args=&id=components-vouchers-bacsdirectdebit--default&viewMode=story'
};

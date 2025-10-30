export const URL_MAP = {
    /* Drop-in */
    dropinWithSession: '/iframe.html?args=&globals=&id=components-dropin-default--auto&viewMode=story',
    dropinWithAdvanced: '/iframe.html?globals=&args=useSessions:!false&id=components-dropin-default--auto&viewMode=story',
    dropinSessions_zeroAuthCard_success:
        '/iframe.html?globals=&args=amount:0;sessionData.recurringProcessingModel:CardOnFile;sessionData.storePaymentMethodMode:askForConsent&id=components-dropin-default--auto&viewMode=story',
    dropinSessions_zeroAuthCard_fail:
        '/iframe.html?globals=&args=amount:0;sessionData.recurringProcessingModel:CardOnFile;sessionData.storePaymentMethodMode:askForConsent;sessionData.enableOneClick:!true&id=components-dropin-default--auto&viewMode=story',
    dropinWithSession_BCMC_noStoredPms: '/iframe.html?args=countryCode:BE&globals=&id=components-dropin-default--auto&viewMode=story',

    /**
     * Card
     */
    card: '/iframe.html?args=&id=components-cards-card--default&viewMode=story',
    cardWithVisibleSrPanel: '/iframe.html?args=srConfig.showPanel:!true&globals=&id=components-cards-card--default&viewMode=story',
    cardWithSsn: '/iframe.html?globals=&id=components-cards-card--with-ssn&viewMode=story',
    cardWithAdvancedFlow: '/iframe.html?args=useSessions:!false&globals=&id=components-cards-card--default&viewMode=story',
    cardWithAvs: '/iframe.html?args=&globals=&id=components-cards-card--with-avs&viewMode=story',
    cardWithPartialAvs: '/iframe.html?args=&globals=&id=components-cards-card--with-partial-avs&viewMode=story',
    cardWithInstallments: '/iframe.html?args=&id=components-cards-card--with-installments&viewMode=story',
    cardWithKcp: '/iframe.html?args=&globals=&id=components-cards-card--with-kcp&viewMode=story',
    cardWithClickToPay: '/iframe.html?args=&id=components-cards-card--with-click-to-pay&viewMode=story',
    cardWithFastlane: '/iframe.html?args=&globals=&id=components-cards-card--with-mocked-fastlane&viewMode=story',
    fullAvsWithoutPrefilledDataUrl:
        '/iframe.html?args=componentConfiguration.data:!undefined&globals=&id=components-cards-card--with-avs&viewMode=story',
    fullAvsWithPrefilledDataUrl: '/iframe.html?globals=&args=&id=components-cards-card--with-avs&viewMode=story',
    addressLookupUrl: '/iframe.html?id=components-cards-card--with-avs-address-lookup&viewMode=story',
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
    ideal: '/iframe.html?globals=&id=components-ideal--default&viewMode=story',
    giftcard_with_card: '/iframe.html?args=&globals=&id=components-partial-payments-givex-giftcard--default&viewMode=story',
    giftcard_with_giftcard: '/iframe.html?args=&globals=&id=components-partial-payments-givex-giftcard--with-giftcard&viewMode=story',

    /**
     * Vouchers
     */
    boleto: '/iframe.html?globals=&id=components-vouchers-boleto--default&viewMode=story',
    bacsDirectDebit: '/iframe.html?globals=&args=&id=components-vouchers-bacsdirectdebit--default&viewMode=story'
};

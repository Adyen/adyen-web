export const URL_MAP = {
    /* Drop-in */
    dropinWithSession: '/iframe.html?args=&globals=&id=dropin-default--auto&viewMode=story',
    dropinWithAdvanced: '/iframe.html?globals=&args=useSessions:!false&id=dropin-default--auto&viewMode=story',
    dropinSessions_zeroAuthCard_success:
        '/iframe.html?globals=&args=amount:0;sessionData.recurringProcessingModel:CardOnFile;sessionData.storePaymentMethodMode:askForConsent&id=dropin-default--auto&viewMode=story',
    dropinSessions_zeroAuthCard_fail:
        '/iframe.html?globals=&args=amount:0;sessionData.recurringProcessingModel:CardOnFile;sessionData.storePaymentMethodMode:askForConsent;sessionData.enableOneClick:!true&id=dropin-default--auto&viewMode=story',
    dropinWithSession_BCMC_noStoredPms: '/iframe.html?args=countryCode:BE&globals=&id=dropin-default--auto&viewMode=story',

    /**
     * Card
     */
    card: '/iframe.html?args=&id=cards-card--default&viewMode=story',
    cardWithVisibleSrPanel: '/iframe.html?args=srConfig.showPanel:!true&globals=&id=cards-card--default&viewMode=story',
    cardWithSsn: '/iframe.html?globals=&id=cards-card--with-ssn&viewMode=story',
    cardWithAdvancedFlow: '/iframe.html?args=useSessions:!false&globals=&id=cards-card--default&viewMode=story',
    cardWithAvs: '/iframe.html?args=&globals=&id=cards-card--with-avs&viewMode=story',
    cardWithPartialAvs: '/iframe.html?args=&globals=&id=cards-card--with-partial-avs&viewMode=story',
    cardWithInstallments: '/iframe.html?args=&id=cards-card--with-installments&viewMode=story',
    cardWithKcp: '/iframe.html?args=&globals=&id=cards-card--with-kcp&viewMode=story',
    cardWithClickToPay: '/iframe.html?args=&id=cards-card--with-click-to-pay&viewMode=story',
    cardWithFastlane: '/iframe.html?args=&globals=&id=cards-card--with-mocked-fastlane&viewMode=story',
    fullAvsWithoutPrefilledDataUrl: '/iframe.html?args=componentConfiguration.data:!undefined&globals=&id=cards-card--with-avs&viewMode=story',
    fullAvsWithPrefilledDataUrl: '/iframe.html?globals=&args=&id=cards-card--with-avs&viewMode=story',
    addressLookupUrl: '/iframe.html?id=cards-card--with-avs-address-lookup&viewMode=story',
    bcmc: '/iframe.html?args=&globals=&id=cards-bancontact--default&viewMode=story',
    /* Custom card */
    customCard: '/iframe.html?globals=&args=&id=cards-custom-card--default&viewMode=story',
    customCardSeparateExpiryDate: '/iframe.html?globals=&args=&id=cards-custom-card--variant&viewMode=story',
    /* Await */
    ancv: '/iframe.html?args=useSessions:!true&globals=&id=components-ancv--default&viewMode=story',
    /* Issuer list */
    onlineBankingPL: '/iframe.html?args=&globals=&id=issuerlist-onlinebankingpl--default&viewMode=story',
    /* Open invoice */
    riverty: '/iframe.html?globals=&args=&id=components-riverty--default&viewMode=story',
    rivertyWithVisibleSrPanel: '/iframe.html?args=srConfig.showPanel:!true&globals=&id=components-riverty--default&viewMode=story',
    /* Redirect */
    ideal: '/iframe.html?globals=&id=components-ideal--default&viewMode=story',
    giftcard_with_card: '/iframe.html?globals=&id=partial-payments-givex-giftcard--with-card&viewMode=story',
    giftcard_with_giftcard: '/iframe.html?globals=&id=partial-payments-givex-giftcard--with-gift-card&viewMode=story',

    /**
     * Vouchers
     */
    boleto: '/iframe.html?globals=&id=vouchers-boleto--default&viewMode=story',
    bacsDirectDebit: '/iframe.html?globals=&args=&id=vouchers-bacsdirectdebit--default&viewMode=story'
};

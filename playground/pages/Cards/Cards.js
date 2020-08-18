import AdyenCheckout from '../../../src';
import { getPaymentMethods, getOriginKey } from '../../services';
import { handleSubmit, handleAdditionalDetails, handleError } from '../../handlers';
import { amount, shopperLocale } from '../../config/commonConfig';
import '../../../config/polyfills';
import '../../style.scss';

const lang = {
    'paymentMethods.moreMethodsButton': 'Flere betalingsmetoder',
    payButton: 'Betal',
    'payButton.redirecting': 'Omdirigerer...',
    storeDetails: 'Lagre til min neste betaling',
    'payment.redirecting': 'Du vil bli videresendt...',
    'payment.processing': 'Betalingen din behandles',
    'creditCard.holderName': 'Navn på kortet',
    'creditCard.holderName.placeholder': 'O. Nordmann',
    'creditCard.holderName.invalid': 'Ugyldig navn på kortholder',
    'creditCard.numberField.title': 'Kortnummer',
    'creditCard.numberField.placeholder': '1234 5678 9012 3456',
    'creditCard.numberField.invalid': 'Ugyldig kortnummer',
    'creditCard.expiryDateField.title': 'Utløpsdato',
    'creditCard.expiryDateField.placeholder': 'MM/ÅÅ',
    'creditCard.expiryDateField.invalid': 'Ugyldig utløpsdato',
    'creditCard.expiryDateField.month': 'Måned',
    'creditCard.expiryDateField.month.placeholder': 'MM',
    'creditCard.expiryDateField.year.placeholder': 'ÅÅ',
    'creditCard.expiryDateField.year': 'År',
    'creditCard.cvcField.title': 'CVC / CVV',
    'creditCard.cvcField.placeholder': '123',
    'creditCard.storeDetailsButton': 'Husk til neste gang',
    'creditCard.oneClickVerification.invalidInput.title': 'Ugyldig CVC-/CVV-format',
    'creditCard.cvcField.placeholder.4digits': '4 siffer',
    'creditCard.cvcField.placeholder.3digits': '3 siffer',
    installments: 'Antall avdrag',
    installmentOption: '%{times}x %{partialValue}',
    'sepaDirectDebit.ibanField.invalid': 'Ugyldig kontonummer',
    'sepaDirectDebit.nameField.placeholder': 'O. Nordmann',
    'sepa.ownerName': 'Kortholders navn',
    'sepa.ibanNumber': 'Kontonummer (IBAN)',
    'giropay.searchField.placeholder': 'Bank navn / BIC / Bankleitzahl',
    'giropay.minimumLength': 'Min. 4 tegn',
    'giropay.noResults': 'Ingen søkeresultater',
    'giropay.details.bic': 'BIC (Bank Identifier Code)',
    'error.title': 'Feil',
    'error.subtitle.redirect': 'Videresending feilet',
    'error.subtitle.payment': 'Betaling feilet',
    'error.subtitle.refused': 'Betaling avvist',
    'error.message.unknown': 'En ukjent feil oppstod',
    'idealIssuer.selectField.title': 'Bank',
    'idealIssuer.selectField.placeholder': 'Velg din bank',
    'creditCard.success': 'Betalingen var vellykket',
    loading: 'Laster...',
    continue: 'Fortsett',
    continueTo: 'Fortsett til',
    'wechatpay.timetopay': 'Du har %@ igjen til å betale',
    'wechatpay.scanqrcode': 'Skann QR-kode',
    personalDetails: 'Personopplysninger',
    socialSecurityNumber: 'Personnummer',
    firstName: 'Fornavn',
    infix: 'Prefiks',
    lastName: 'Etternavn',
    mobileNumber: 'Mobilnummer',
    city: 'Poststed',
    postalCode: 'Postnummer',
    countryCode: 'Landkode',
    telephoneNumber: 'Telefonnummer',
    dateOfBirth: 'Fødselsdato',
    shopperEmail: 'E-postadresse',
    gender: 'Kjønn',
    male: 'Mann',
    female: 'Kvinne',
    billingAddress: 'Faktureringsadresse',
    street: 'Gate',
    stateOrProvince: 'Fylke',
    country: 'Land',
    houseNumberOrName: 'Husnummer',
    separateDeliveryAddress: 'Spesifiser en separat leveringsadresse',
    deliveryAddress: 'Leveringsadresse',
    'creditCard.cvcField.title.optional': 'CVC / CVV (valgfritt)',
    privacyPolicy: 'Retningslinjer for personvern',
    'afterPay.agreement': 'Jeg godtar AfterPays %@',
    paymentConditions: 'betalingsbetingelser',
    openApp: 'Åpne appen',
    'voucher.readInstructions': 'Les instruksjoner',
    'voucher.introduction': 'Takk for ditt kjøp. Vennligst bruk den følgende kupongen til å fullføre betalingen.',
    'voucher.expirationDate': 'Utløpsdato',
    'voucher.alternativeReference': 'Alternativ referanse',
    'dragonpay.voucher.non.bank.selectField.placeholder': 'Velg din leverandør',
    'dragonpay.voucher.bank.selectField.placeholder': 'Velg din bank',
    'voucher.paymentReferenceLabel': 'Betalingsreferanse',
    'voucher.surcharge': 'Inkl. %@ tilleggsavgift',
    'voucher.introduction.doku': 'Takk for ditt kjøp, vennligst bruk den følgende informasjonen for å fullføre betalingen.',
    'voucher.shopperName': 'Kundenavn',
    'voucher.merchantName': 'Forhandler',
    'voucher.introduction.econtext': 'Takk for ditt kjøp, vennligst bruk den følgende informasjonen for å fullføre betalingen.',
    'voucher.telephoneNumber': 'Telefonnummer',
    'voucher.shopperReference': 'Kundereferanse',
    'voucher.collectionInstitutionNumber': 'Innbetalingslokasjonsnummer',
    'boletobancario.btnLabel': 'Generer Boleto',
    'boleto.sendCopyToEmail': 'Send meg en kopi på e-post',
    'button.copy': 'Kopier',
    'button.download': 'Last ned',
    'creditCard.storedCard.description.ariaLabel': 'Lagret kort slutter på %@',
    'voucher.entity': 'Enhet',
    donateButton: 'Donér',
    notNowButton: 'Ikke nå',
    thanksForYourSupport: 'Takk for din støtte!',
    preauthorizeWith: 'Forhåndsgodkjenn med',
    confirmPreauthorization: 'Bekreft forhåndsgodkjenning',
    confirmPurchase: 'Bekreft kjøp',
    applyGiftcard: 'Bruk gavekort',
    'creditCard.pin.title': 'PIN',
    'creditCard.encryptedPassword.label': 'Første 2 sifre av kortpassord',
    'creditCard.encryptedPassword.placeholder': '12',
    'creditCard.encryptedPassword.invalid': 'Ugyldig passord',
    'creditCard.taxNumber.label': 'Kortholders fødselsdato (YYMMDD) eller bedriftsregistreringsnummer (10 siffer)',
    'creditCard.taxNumber.labelAlt': 'Bedriftsregistreringsnummer (10 siffer)',
    'creditCard.taxNumber.invalid': 'Ugyldig kortholders fødselsdato eller bedriftsregistreringsnummer',
    'storedPaymentMethod.disable.button': 'Fjern',
    'storedPaymentMethod.disable.confirmation': 'Fjern lagret betalingsmetode',
    'storedPaymentMethod.disable.confirmButton': 'Ja, fjern',
    'storedPaymentMethod.disable.cancelButton': 'Avbryt',
    'ach.bankAccount': 'Bankkonto',
    'ach.accountHolderNameField.title': 'Kontoholders navn',
    'ach.accountHolderNameField.placeholder': 'O. Nordmann',
    'ach.accountHolderNameField.invalid': 'Ugyldig navn på kontoholder',
    'ach.accountNumberField.title': 'Kontonummer',
    'ach.accountNumberField.invalid': 'Ugyldig kontonummer',
    'ach.accountLocationField.title': 'ABA-dirigeringsnummer',
    'ach.accountLocationField.invalid': 'Ugyldig ABA-dirigeringsnummer',
    'select.stateOrProvince': 'Velg delstat eller provins',
    'select.country': 'Velg land',
    'telephoneNumber.invalid': 'Ugyldig telefonnummer',
    qrCodeOrApp: 'eller',
    'paypal.processingPayment': 'Behandler betaling …',
    generateQRCode: 'Generer QR-kode',
    'await.waitForConfirmation': 'Venter på bekreftelse',
    'mbway.confirmPayment': 'Bekreft betalingen din i MB WAY-appen',
    'shopperEmail.invalid': 'Ugyldig e-postadresse',
    'dateOfBirth.format': 'DD/MM/ÅÅÅÅ',
    'blik.confirmPayment': 'Åpne bank-appen din for å bekrefte betalingen.',
    'blik.invalid': 'Tast inn 6 tall',
    'blik.code': '6-sifret kode',
    'blik.help': 'Hent koden fra bank-appen din.',
    'swish.pendingMessage':
        'Etter at du har skannet koden kan det ta opptil 10 minutter før betalingen vises som bekreftet. Forsøk på å betale igjen kan føre til flere innbetalinger.'
};

getOriginKey()
    .then(originKey => {
        window.originKey = originKey;
    })
    .then(() => getPaymentMethods({ amount, shopperLocale }))
    .then(paymentMethodsResponse => {
        window.checkout = new AdyenCheckout({
            amount, // Optional. Used to display the amount in the Pay Button.
            originKey,
            clientKey: process.env.__CLIENT_KEY__,
            paymentMethodsResponse,
            locale: 'no-NO', //shopperLocale,
            langFile: lang,
            environment: 'test',
            showPayButton: true,
            onSubmit: handleSubmit,
            onAdditionalDetails: handleAdditionalDetails,
            onError: handleError,
            risk: {
                enabled: true, // Means that "riskdata" will then show up in the data object sent to the onChange event. Also accessible via
                // checkout.modules.risk.data
                //                node: '.merchant-checkout__form', // Element that DF iframe is briefly added to (defaults to body)
                //                onComplete: obj => {},
                onError: console.error
            },
            translations: {
                'no-NO': {
                    'creditCard.numberField.title': 'Kård nømber (custom tran)'
                }
            }
            //            analytics: {
            //                conversion: true,
            //                telemetry: true
            //            }
        });

        // Stored Card
        if (checkout.paymentMethodsResponse.storedPaymentMethods && checkout.paymentMethodsResponse.storedPaymentMethods.length > 0) {
            const storedCardData = checkout.paymentMethodsResponse.storedPaymentMethods[0];
            window.storedCard = checkout.create('card', storedCardData).mount('.storedcard-field');
        }

        // Credit card with installments
        window.card = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
                hasHolderName: false,
                // holderNameRequired: true,
                enableStoreDetails: false,
                installmentOptions: {
                    // card: {
                    //     values: [1, 2]
                    // },
                    mc: {
                        values: [1, 2, 3]
                    },
                    visa: {
                        values: [1, 2, 3, 4]
                    }
                }
            })
            .mount('.card-field');

        // Bancontact card
        window.bancontact = checkout
            .create('bcmc', {
                type: 'bcmc',
                hasHolderName: true,
                // holderNameRequired: true,
                enableStoreDetails: false
            })
            .mount('.bancontact-field');

        // Credit card with AVS
        window.cardAvs = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
                enableStoreDetails: true,

                // holderName config:
                hasHolderName: true,
                holderNameRequired: true,
                holderName: 'J. Smith',

                // billingAddress config:
                billingAddressRequired: true,
                billingAddressAllowedCountries: ['US', 'CA', 'BR', 'IT'],
                // billingAddressRequiredFields: ['postalCode', 'country'],

                // data:
                data: {
                    holderName: 'J. Smith',
                    billingAddress: {
                        street: 'Infinite Loop',
                        postalCode: '95014',
                        city: 'Cupertino',
                        houseNumberOrName: '1',
                        country: 'US',
                        stateOrProvince: 'CA'
                    }
                }
            })
            .mount('.card-avs-field');

        // Credit card with KCP Authentication
        window.kcpCard = checkout
            .create('card', {
                type: 'scheme',
                brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro'],
                koreanAuthenticationRequired: true,
                countryCode: 'KR'
            })
            .mount('.card-kcp-field');
    });

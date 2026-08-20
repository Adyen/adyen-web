// @ts-check

/**
 * ESLint plugin backing the incremental `strictNullChecks` migration.
 *
 * `tsconfig.json` still compiles with `strictNullChecks: false`, so the compiler cannot
 * enforce nullability yet. This plugin re-checks the project with that one flag turned on
 * and reports the resulting diagnostics as lint errors, which keeps the feedback inline in
 * the editor and inside `yarn lint`.
 *
 * To reproduce the raw compiler output for a folder:
 *
 *     yarn workspace @adyen/adyen-web exec tsc -p tsconfig.json --strictNullChecks --noEmit --pretty false | grep src/core
 *
 * The list of files that do not compile yet is passed as the `unmigrated` option in
 * `eslint.config.js`. That list may only ever shrink:
 *
 * - a file NOT on the list reports every diagnostic, so new files are enforced from
 *   the moment they are created;
 * - a file ON the list that no longer has diagnostics reports "remove me", so the
 *   list cannot silently exempt code that is already correct.
 *
 * Delete this plugin once `strictNullChecks` is enabled in `tsconfig.json`.
 */

import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const LIB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TSCONFIG_PATH = resolve(LIB_ROOT, 'tsconfig.json');
const SRC_ROOT = resolve(LIB_ROOT, 'src');

/**
 * Mirrors the `files`/`ignores` of the `Strict null checks` block in eslint.config.js, which is
 * what actually decides where the rule reports. Nothing in `src` imports a test or a story, so
 * leaving them out of the program cannot change a production diagnostic — it only avoids
 * parsing and version-checking ~420 files that are never reported on.
 */
const OUT_OF_SCOPE = /\.(test|spec)\.tsx?$|[\\/]stories[\\/]|\.stories\.tsx$/;
const BACKLOG_HINT = '`STRICT_NULL_CHECKS_BACKLOG` in eslint-rules/strict-null-checks.js';

/**
 * On a case-insensitive filesystem the same file can reach us with different casing — an editor
 * may hand ESLint a lowercase drive letter while Node resolves an uppercase one. Comparing raw
 * strings would then miss a backlog entry or track one file twice, so every lookup key goes
 * through here. On Linux this is the identity function.
 *
 * @param {string} fileName
 */
const canonicalPath = fileName => (ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase());

// ══════════════════════════════════════════════════════════
// Files that do not compile with `strictNullChecks` yet.
//
// Every file NOT listed here is enforced by `strict-null-checks/enforce`, so new code is
// checked from the moment it is written. Remove entries as migration tickets land — the
// list may only shrink. A listed file with no errors left is reported as an obsolete entry.
// ══════════════════════════════════════════════════════════
const STRICT_NULL_CHECKS_BACKLOG = [
    // ── Ticket 1: UIElement and BaseElement (25 errors) ──
    'src/components/internal/BaseElement/BaseElement.ts',
    'src/components/internal/UIElement/UIElement.tsx',
    'src/components/internal/UIElement/utils.ts',

    // ── Ticket 2: Core, utils and hooks (89 errors) ──
    'src/core/Analytics/Analytics.ts',
    'src/core/Analytics/events/AnalyticsInfoEvent.ts',
    'src/core/Analytics/utils.ts',
    'src/core/Context/AmountProvider.tsx',
    'src/core/Context/CoreProvider.tsx',
    'src/core/core.registry.ts',
    'src/core/core.ts',
    'src/core/Environment/Environment.ts',
    'src/core/Errors/SRPanel.tsx',
    'src/core/Errors/SRPanelContext.ts',
    'src/core/Errors/utils.ts',
    'src/core/ProcessResponse/PaymentAction/actionTypes.ts',
    'src/core/ProcessResponse/PaymentMethods/PaymentMethods.ts',
    'src/core/RiskModule/components/DeviceFingerprint/DeviceFingerprint.tsx',
    'src/core/RiskModule/components/DeviceFingerprint/GetDeviceFingerprint.tsx',
    'src/core/RiskModule/RiskModule.tsx',
    'src/hooks/usePaymentStatusTimer/usePaymentStatusTimer.tsx',
    'src/utils/browserInfo.ts',
    'src/utils/clipboard.ts',
    'src/utils/createSdkData.ts',
    'src/utils/get-issuer-image.ts',
    'src/utils/getConsentUrl.ts',
    'src/utils/getOrigin.ts',
    'src/utils/promiseTimeout.ts',
    'src/utils/Script.ts',
    'src/utils/useAutoFocus.ts',
    'src/utils/Validator/defaultRules.ts',
    'src/utils/Validator/Validator.ts',

    // ── Ticket 3: SecuredFields and CSF (161 errors) ──
    'src/components/internal/SecuredFields/binLookup/extensions.ts',
    'src/components/internal/SecuredFields/lib/CSF/CSF.ts',
    'src/components/internal/SecuredFields/lib/CSF/extensions/createSecuredFields.ts',
    'src/components/internal/SecuredFields/lib/CSF/extensions/handleBrandFromBinLookup.ts',
    'src/components/internal/SecuredFields/lib/CSF/extensions/handleEncryption.ts',
    'src/components/internal/SecuredFields/lib/CSF/extensions/handleIOSTouchEvents.ts',
    'src/components/internal/SecuredFields/lib/CSF/extensions/handleTab.ts',
    'src/components/internal/SecuredFields/lib/CSF/partials/handleBinValue.ts',
    'src/components/internal/SecuredFields/lib/CSF/partials/handleFocus.ts',
    'src/components/internal/SecuredFields/lib/CSF/partials/handleIframeConfigFeedback.ts',
    'src/components/internal/SecuredFields/lib/CSF/partials/isConfigured.ts',
    'src/components/internal/SecuredFields/lib/CSF/partials/postMessageToAllIframes.ts',
    'src/components/internal/SecuredFields/lib/CSF/partials/processAutoComplete.ts',
    'src/components/internal/SecuredFields/lib/CSF/partials/processBrand.ts',
    'src/components/internal/SecuredFields/lib/CSF/partials/setFocusOnFrame.ts',
    'src/components/internal/SecuredFields/lib/CSF/partials/validateForm.ts',
    'src/components/internal/SecuredFields/lib/CSF/utils/cardType.ts',
    'src/components/internal/SecuredFields/lib/CSF/utils/processErrors.ts',
    'src/components/internal/SecuredFields/lib/CSF/utils/tabbing/tabScenarioCreditCard.ts',
    'src/components/internal/SecuredFields/lib/CSF/utils/tabbing/tabScenarioGiftCard.ts',
    'src/components/internal/SecuredFields/lib/CSF/utils/tabbing/tabScenarioKCP.ts',
    'src/components/internal/SecuredFields/lib/CSF/utils/tabbing/utils.ts',
    'src/components/internal/SecuredFields/lib/securedField/SecuredField.ts',
    'src/components/internal/SecuredFields/SFP/SecuredFieldsProvider.ts',
    'src/components/internal/SecuredFields/SFP/SecuredFieldsProviderHandlers.ts',
    'src/components/internal/SecuredFields/SFP/SFPUtils.ts',

    // ── Ticket 4: Shared form fields (92 errors) ──
    'src/components/internal/Address/Address.tsx',
    'src/components/internal/Address/components/AddressSearch.tsx',
    'src/components/internal/Address/components/FieldContainer.tsx',
    'src/components/internal/Address/Specifications.ts',
    'src/components/internal/Address/utils.ts',
    'src/components/internal/Address/validate.formats.ts',
    'src/components/internal/Address/validate.ts',
    'src/components/internal/CompanyDetails/CompanyDetails.tsx',
    'src/components/internal/CompanyDetails/validate.ts',
    'src/components/internal/FormFields/Field/Field.tsx',
    'src/components/internal/FormFields/InputBase.tsx',
    'src/components/internal/FormFields/InputDate/InputDate.tsx',
    'src/components/internal/FormFields/InputDate/utils.ts',
    'src/components/internal/FormFields/Select/components/SelectButton.tsx',
    'src/components/internal/FormFields/Select/Select.tsx',
    'src/components/internal/IbanInput/IbanInput.tsx',
    'src/components/internal/IbanInput/utils.ts',
    'src/components/internal/IbanInput/validate.ts',
    'src/components/internal/PersonalDetails/PersonalDetails.tsx',
    'src/components/internal/PersonalDetails/validate.ts',
    'src/components/internal/PhoneInput/PhoneInputFields.tsx',
    'src/components/internal/PhoneInput/PhoneInputForm.tsx',
    'src/components/internal/PhoneInput/validate.ts',

    // ── Ticket 5: Card, Card Input and Custom Card (100 errors) ──
    'src/components/Card/Card.tsx',
    'src/components/Card/components/CardInput/CardInput.tsx',
    'src/components/Card/components/CardInput/components/AvailableBrands/AvailableBrands.tsx',
    'src/components/Card/components/CardInput/components/CardFields.tsx',
    'src/components/Card/components/CardInput/components/CardFieldsWrapper.tsx',
    'src/components/Card/components/CardInput/components/CardHolderName.tsx',
    'src/components/Card/components/CardInput/components/Installments/Installments.tsx',
    'src/components/Card/components/CardInput/components/KCPAuthentication.tsx',
    'src/components/Card/components/CardInput/components/StoredCardFields.tsx',
    'src/components/Card/components/CardInput/handlers.ts',
    'src/components/Card/components/CardInput/useSRPanelForCardInputErrors.ts',
    'src/components/Card/components/CardInput/utils.ts',
    'src/components/Card/components/CardInput/validate.ts',
    'src/components/Card/components/ClickToPayHolder.tsx',
    'src/components/Card/components/Fastlane/FastlaneSignup.tsx',
    'src/components/Card/components/Fastlane/InfoButton.tsx',
    'src/components/Card/components/Fastlane/InfoModal.tsx',
    'src/components/Card/components/Fastlane/USOnlyPhoneInput.tsx',
    'src/components/Card/components/Fastlane/utils/validate-configuration.ts',
    'src/components/CustomCard/CustomCard.tsx',
    'src/components/CustomCard/CustomCardInput/CustomCardInput.tsx',

    // ── Ticket 6: Drop-in (48 errors) ──
    'src/components/Dropin/components/DropinComponent.tsx',
    'src/components/Dropin/components/PaymentMethod/OrderPaymentMethods.tsx',
    'src/components/Dropin/components/PaymentMethod/PaymentMethodBrands/PaymentMethodBrands.tsx',
    'src/components/Dropin/components/PaymentMethod/PaymentMethodItem/PaymentMethodItem.tsx',
    'src/components/Dropin/components/PaymentMethod/PaymentMethodList.tsx',
    'src/components/Dropin/components/PaymentMethod/PaymentMethodsContainer.tsx',
    'src/components/Dropin/Dropin.tsx',
    'src/components/Dropin/elements/createElements.ts',

    // ── Ticket 7: ThreeDS2 (41 errors) ──
    'src/components/ThreeDS2/components/Challenge/PrepareChallenge3DS2.tsx',
    'src/components/ThreeDS2/components/DeviceFingerprint/DoFingerprint3DS2.tsx',
    'src/components/ThreeDS2/components/DeviceFingerprint/PrepareFingerprint3DS2.tsx',
    'src/components/ThreeDS2/components/Form/ThreeDS2Form.tsx',
    'src/components/ThreeDS2/ThreeDS2Challenge.tsx',
    'src/components/ThreeDS2/ThreeDS2DeviceFingerprint.tsx',

    // ── Ticket 8: Google Pay and Apple Pay (71 errors) ──
    'src/components/ApplePay/ApplePay.tsx',
    'src/components/ApplePay/services/ApplePaySdkLoader.ts',
    'src/components/ApplePay/services/ApplePayService.ts',
    'src/components/ApplePay/utils/map-adyen-brands-to-applepay-brands.ts',
    'src/components/ApplePay/utils/payment-request.ts',
    'src/components/GooglePay/components/GooglePayButton.tsx',
    'src/components/GooglePay/GooglePay.tsx',
    'src/components/GooglePay/requests.ts',

    // ── Ticket 9: Amazon Pay, PayPal and Cash App Pay (79 errors) ──
    'src/components/AmazonPay/AmazonPay.tsx',
    'src/components/AmazonPay/components/AmazonPayButton.tsx',
    'src/components/AmazonPay/components/AmazonPayComponent.tsx',
    'src/components/AmazonPay/components/OrderButton.tsx',
    'src/components/AmazonPay/utils.ts',
    'src/components/CashAppPay/CashAppPay.tsx',
    'src/components/CashAppPay/components/CashAppComponent.tsx',
    'src/components/PayPal/utils/get-paypal-settings.ts',
    'src/components/PayPalFastlane/Fastlane.tsx',
    'src/components/PayPalFastlane/FastlaneSDK.ts',

    // ── Ticket 10: Click to Pay (98 errors) ──
    'src/components/ClickToPay/ClickToPay.tsx',
    'src/components/internal/ClickToPay/ClickToPayComponent.tsx',
    'src/components/internal/ClickToPay/components/CtPCards/CtPCards.tsx',
    'src/components/internal/ClickToPay/components/CtPCards/CtPCardsList/CtPCardsList.tsx',
    'src/components/internal/ClickToPay/components/CtPInfo/CtPInfo.tsx',
    'src/components/internal/ClickToPay/components/CtPInfo/CtPInfoModal/CtPInfoModal.tsx',
    'src/components/internal/ClickToPay/components/CtPLogin/CtPLogin.tsx',
    'src/components/internal/ClickToPay/components/CtPLogin/CtPLoginInput.tsx',
    'src/components/internal/ClickToPay/components/CtPOneTimePassword/CtPOneTimePassword.tsx',
    'src/components/internal/ClickToPay/components/CtPOneTimePassword/CtPOneTimePasswordInput/CtPOneTimePasswordInput.tsx',
    'src/components/internal/ClickToPay/components/CtPOneTimePassword/CtPOneTimePasswordInput/CtPResendOtpLink.tsx',
    'src/components/internal/ClickToPay/context/ClickToPayContext.ts',
    'src/components/internal/ClickToPay/context/ClickToPayProvider.tsx',
    'src/components/internal/ClickToPay/models/ShopperCard.ts',
    'src/components/internal/ClickToPay/services/ClickToPayService.ts',
    'src/components/internal/ClickToPay/services/create-clicktopay-service.ts',
    'src/components/internal/ClickToPay/services/execute-with-timeout.ts',
    'src/components/internal/ClickToPay/services/sdks/AbstractSrcInitiator.ts',
    'src/components/internal/ClickToPay/services/sdks/SrcSdkLoader.ts',
    'src/components/internal/ClickToPay/services/utils.ts',

    // ── No ticket yet (316 errors) ──
    // src/components/Ach (19 errors)
    'src/components/Ach/Ach.tsx',
    'src/components/Ach/components/AchComponent.tsx',
    'src/components/Ach/components/useSRPanelForACHErrors.ts',
    'src/components/Ach/components/validate.ts',
    // src/components/AfterPay (1 errors)
    'src/components/AfterPay/AfterPay.tsx',
    // src/components/ANCV (8 errors)
    'src/components/ANCV/ANCV.tsx',
    'src/components/ANCV/components/ANCVInput.tsx',
    // src/components/BacsDD (5 errors)
    'src/components/BacsDD/components/BacsInput.tsx',
    // src/components/BankTransfer (6 errors)
    'src/components/BankTransfer/BankTransfer.tsx',
    'src/components/BankTransfer/components/BankTransferInput/BankTransferInput.tsx',
    'src/components/BankTransfer/components/BankTransferResult/BankTransferResult.tsx',
    // src/components/Blik (9 errors)
    'src/components/Blik/Blik.tsx',
    'src/components/Blik/components/BlikInput.tsx',
    // src/components/Boleto (3 errors)
    'src/components/Boleto/components/BoletoInput/BoletoInput.tsx',
    // src/components/Doku (4 errors)
    'src/components/Doku/components/DokuInput/DokuInput.tsx',
    'src/components/Doku/components/DokuVoucherResult/DokuVoucherResult.tsx',
    // src/components/Donation (4 errors)
    'src/components/Donation/components/DonationComponent.tsx',
    'src/components/Donation/components/FixedAmounts.tsx',
    // src/components/Dragonpay (8 errors)
    'src/components/Dragonpay/components/DragonpayInput/DragonpayInput.tsx',
    'src/components/Dragonpay/components/DragonpayVoucherResult/DragonpayVoucherResult.tsx',
    'src/components/Dragonpay/Dragonpay.tsx',
    // src/components/Econtext (4 errors)
    'src/components/Econtext/components/EcontextVoucherResult/EcontextVoucherResult.tsx',
    'src/components/Econtext/Econtext.tsx',
    // src/components/Giftcard (23 errors)
    'src/components/Giftcard/components/GiftcardComponent.tsx',
    'src/components/Giftcard/components/GiftcardFields.tsx',
    'src/components/Giftcard/components/GiftcardNumberField.tsx',
    'src/components/Giftcard/components/GiftcardPinField.tsx',
    'src/components/Giftcard/components/GiftcardResult.tsx',
    'src/components/Giftcard/components/useSRPanelForGiftcardErrors.ts',
    'src/components/Giftcard/Giftcard.tsx',
    // src/components/Giropay (1 errors)
    'src/components/Giropay/Giropay.tsx',
    // src/components/helpers (9 errors)
    'src/components/helpers/IssuerListContainer/IssuerListContainer.tsx',
    'src/components/helpers/QRLoaderContainer/QRLoaderContainer.tsx',
    // src/components/internal/Await (2 errors)
    'src/components/internal/Await/Await.tsx',
    // src/components/internal/Button (4 errors)
    'src/components/internal/Button/Button.tsx',
    'src/components/internal/Button/CopyIconButton.tsx',
    // src/components/internal/Countdown (2 errors)
    'src/components/internal/Countdown/useCountdownA11yReporter.ts',
    // src/components/internal/DisclaimerMessage (2 errors)
    'src/components/internal/DisclaimerMessage/DisclaimerMessage.tsx',
    // src/components/internal/IFrame (2 errors)
    'src/components/internal/IFrame/Iframe.tsx',
    // src/components/internal/Img (4 errors)
    'src/components/internal/Img/Img.tsx',
    // src/components/internal/IssuerList (6 errors)
    'src/components/internal/IssuerList/IssuerList.tsx',
    // src/components/internal/Modal (8 errors)
    'src/components/internal/Modal/Modal.tsx',
    'src/components/internal/Modal/useModal.ts',
    'src/components/internal/Modal/useTrapFocus.ts',
    // src/components/internal/OpenInvoice (23 errors)
    'src/components/internal/OpenInvoice/OpenInvoice.tsx',
    'src/components/internal/OpenInvoice/useSRPanelForOpenInvoiceErrors.ts',
    'src/components/internal/OpenInvoice/utils.ts',
    // src/components/internal/PayButton (3 errors)
    'src/components/internal/PayButton/PayButton.tsx',
    // src/components/internal/QRLoader (8 errors)
    'src/components/internal/QRLoader/QRLoader.tsx',
    // src/components/internal/RedirectButton (2 errors)
    'src/components/internal/RedirectButton/RedirectButton.tsx',
    // src/components/internal/SocialSecurityNumberBrazil (4 errors)
    'src/components/internal/SocialSecurityNumberBrazil/SocialSecurityNumberBrazil.tsx',
    // src/components/internal/Toggle (3 errors)
    'src/components/internal/Toggle/Toggle.tsx',
    // src/components/internal/Tooltip (6 errors)
    'src/components/internal/Tooltip/Tooltip.tsx',
    'src/components/internal/Tooltip/TooltipController.ts',
    // src/components/internal/Voucher (2 errors)
    'src/components/internal/Voucher/utils.ts',
    'src/components/internal/Voucher/Voucher.tsx',
    // src/components/Klarna (20 errors)
    'src/components/Klarna/components/KlarnaContainer/KlarnaContainer.tsx',
    'src/components/Klarna/components/KlarnaWidget/KlarnaWidget.tsx',
    'src/components/Klarna/KlarnaPayments.tsx',
    // src/components/MBWay (7 errors)
    'src/components/MBWay/components/MBWayInput/MBWayInput.tsx',
    'src/components/MBWay/MBWay.tsx',
    // src/components/MealVoucherFR (2 errors)
    'src/components/MealVoucherFR/components/MealVoucherFields.tsx',
    'src/components/MealVoucherFR/MealVoucherFR.tsx',
    // src/components/Multibanco (2 errors)
    'src/components/Multibanco/components/MultibancoVoucherResult/MultibancoVoucherResult.tsx',
    'src/components/Multibanco/Multibanco.tsx',
    // src/components/Oxxo (2 errors)
    'src/components/Oxxo/Oxxo.tsx',
    // src/components/PayByBankPix (32 errors)
    'src/components/PayByBankPix/components/Enrollment/components/PayByBankPixAwait.tsx',
    'src/components/PayByBankPix/components/Enrollment/Enrollment.tsx',
    'src/components/PayByBankPix/components/StoredPayment/StoredPayment.tsx',
    'src/components/PayByBankPix/PayByBankPix.tsx',
    'src/components/PayByBankPix/services/PasskeyService.ts',
    // src/components/PayByBankUS (7 errors)
    'src/components/PayByBankUS/PayByBankUS.tsx',
    // src/components/PayMe (1 errors)
    'src/components/PayMe/PayMe.ts',
    // src/components/PayNow (1 errors)
    'src/components/PayNow/PayNow.ts',
    // src/components/PayTo (26 errors)
    'src/components/PayTo/components/MandateSummary.tsx',
    'src/components/PayTo/components/PayIDInput.tsx',
    'src/components/PayTo/components/validate.ts',
    'src/components/PayTo/PayTo.tsx',
    // src/components/Pix (3 errors)
    'src/components/Pix/components/PixInput/PixInput.tsx',
    'src/components/Pix/Pix.tsx',
    // src/components/PreAuthorizedDebitCanada (11 errors)
    'src/components/PreAuthorizedDebitCanada/components/PreAuthorizedDebitCanadaComponent.tsx',
    'src/components/PreAuthorizedDebitCanada/components/validate.ts',
    'src/components/PreAuthorizedDebitCanada/PreAuthorizedDebitCanada.tsx',
    // src/components/Redirect (7 errors)
    'src/components/Redirect/components/RedirectShopper/RedirectShopper.tsx',
    'src/components/Redirect/Redirect.tsx',
    // src/components/Trustly (3 errors)
    'src/components/Trustly/Trustly.tsx',
    // src/components/Twint (3 errors)
    'src/components/Twint/Twint.tsx',
    // src/components/UPI (5 errors)
    'src/components/UPI/components/UPIComponent/UPIComponent.tsx',
    'src/components/UPI/components/UPIIntentAppList/UPIIntentAppList.tsx',
    'src/components/UPI/components/UPIMandate/UPIMandate.tsx',
    'src/components/UPI/UPI.tsx'
];

/** Lookup index for the list above. */
const CANONICAL_BACKLOG = new Set(STRICT_NULL_CHECKS_BACKLOG.map(canonicalPath));

/* ── Language service over the project, with strictNullChecks forced on ──
 * Created once per ESLint process and kept in sync with the editor: ESLint hands us the
 * current buffer, so bumping the script version on change keeps diagnostics live while typing.
 * Which files are actually reported is decided by `files`/`ignores` in eslint.config.js.
 */

/** @type {{ service: ts.LanguageService, files: Map<string, string> } | undefined} */
let project;
/** Canonical path -> current buffer. @type {Map<string, string>} */
const sourceTexts = new Map();
/** Canonical path -> revision of that buffer. @type {Map<string, number>} */
const sourceVersions = new Map();

function getProject() {
    if (project !== undefined) return project;

    const configFile = ts.readConfigFile(TSCONFIG_PATH, ts.sys.readFile);
    if (configFile.error) {
        throw new Error(`Could not read ${TSCONFIG_PATH}: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, ' ')}`);
    }

    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, LIB_ROOT, undefined, TSCONFIG_PATH);
    if (parsed.errors.length > 0) {
        throw new Error(
            `Could not parse ${TSCONFIG_PATH}: ${parsed.errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, ' ')).join(' ')}`
        );
    }

    // Keyed by canonical path so one file is never tracked under two spellings, valued with the
    // spelling TypeScript should read from disk. Mutable: files created after the ESLint process
    // started are added on demand, so a long-running editor session type-checks them instead of
    // silently skipping them.
    /** @type {Map<string, string>} */
    const files = new Map();
    const canonicalSrcRoot = canonicalPath(SRC_ROOT);

    for (const parsedFileName of parsed.fileNames) {
        const fileName = ts.sys.resolvePath(parsedFileName);
        const key = canonicalPath(fileName);
        if (!key.startsWith(canonicalSrcRoot) || OUT_OF_SCOPE.test(key)) continue;
        files.set(key, fileName);
    }

    const options = { ...parsed.options, strictNullChecks: true, noEmit: true };

    const service = ts.createLanguageService({
        getCompilationSettings: () => options,
        getScriptFileNames: () => [...files.values()],
        getScriptVersion: fileName => {
            const version = sourceVersions.get(canonicalPath(fileName));
            if (version !== undefined) return version.toString();
            return ts.sys.getModifiedTime?.(fileName)?.getTime().toString() ?? '0';
        },
        getScriptSnapshot: fileName => {
            const sourceText = sourceTexts.get(canonicalPath(fileName)) ?? ts.sys.readFile(fileName);
            return sourceText === undefined ? undefined : ts.ScriptSnapshot.fromString(sourceText);
        },
        getCurrentDirectory: () => LIB_ROOT,
        getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
        directoryExists: ts.sys.directoryExists,
        getDirectories: ts.sys.getDirectories,
        realpath: ts.sys.realpath,
        useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
        getNewLine: () => ts.sys.newLine
    });

    project = { service, files };
    return project;
}

/**
 * @param {string} fileName
 * @param {string} sourceText
 */
function syncSourceText(fileName, sourceText) {
    const key = canonicalPath(fileName);
    if (sourceTexts.get(key) === sourceText) return;
    sourceTexts.set(key, sourceText);
    sourceVersions.set(key, (sourceVersions.get(key) ?? 0) + 1);
}

/**
 * Path as written in the backlog: relative to `packages/lib`, forward slashes.
 *
 * @param {string} absolutePath
 */
function toListedPath(absolutePath) {
    const listedPath = relative(LIB_ROOT, absolutePath).split('\\').join('/');
    if (!listedPath.startsWith('..')) return listedPath;

    // `relative` compares case-sensitively on POSIX, so a differently-cased root escapes the
    // package. Retry canonically rather than hand back a path that matches nothing.
    return relative(canonicalPath(LIB_ROOT), canonicalPath(absolutePath)).split('\\').join('/');
}

/**
 * Errors reported by the language service for one file, resolved to 1-based lines.
 *
 * @param {ts.LanguageService} service
 * @param {string} fileName
 */
function getStrictNullErrors(service, fileName) {
    /** @type {Array<{ line: number, column: number, code: number, message: string }>} */
    const errors = [];

    for (const diagnostic of service.getSemanticDiagnostics(fileName)) {
        const { file, start } = diagnostic;
        if (diagnostic.category !== ts.DiagnosticCategory.Error || file === undefined || start === undefined) continue;

        const { line, character } = file.getLineAndCharacterOfPosition(start);
        errors.push({
            line: line + 1,
            column: character,
            code: diagnostic.code,
            message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        });
    }

    return errors;
}

/* ── Rules ── */

/** @type {import('eslint').Rule.RuleModule} */
const enforce = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Report TypeScript strictNullChecks diagnostics for files outside the migration backlog'
        },
        schema: [],
        messages: {
            diagnostic: '{{code}}: {{message}}',
            obsolete: 'This file has no strictNullChecks errors left. Remove `{{path}}` from {{hint}} to keep it that way.'
        }
    },
    create(context) {
        const fileName = ts.sys.resolvePath(context.filename);
        const { service, files } = getProject();

        // A file created after this process started is not in the tsconfig snapshot. Adding it
        // keeps the promise that new code is checked from the moment it is written, including
        // in a long-running editor session.
        files.set(canonicalPath(fileName), fileName);

        syncSourceText(fileName, context.sourceCode.text);

        const listedPath = toListedPath(fileName);
        const isUnmigrated = CANONICAL_BACKLOG.has(canonicalPath(listedPath));

        return {
            Program() {
                const errors = getStrictNullErrors(service, fileName);

                if (isUnmigrated) {
                    // The backlog may only shrink: flag entries that are already correct.
                    if (errors.length === 0) {
                        context.report({
                            loc: { line: 1, column: 0 },
                            messageId: 'obsolete',
                            data: { path: listedPath, hint: BACKLOG_HINT }
                        });
                    }
                    return;
                }

                for (const { line, column, code, message } of errors) {
                    context.report({
                        loc: { line, column },
                        messageId: 'diagnostic',
                        data: { code: `TS${code}`, message }
                    });
                }
            }
        };
    }
};

/**
 * `noInlineConfig` cannot be used for this, because it would also disable the legitimate
 * `jsx-a11y` and `react` directives that already exist in `src`. This rule is reported under a
 * different name than `enforce`, so disabling `enforce` cannot hide it.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const noSuppression = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow silencing the strictNullChecks migration with ESLint directives'
        },
        schema: [],
        messages: {
            suppressed:
                'Do not silence `strict-null-checks/enforce`. Fix the nullability, or add the file to {{hint}} only as part of a migration ticket.'
        }
    },
    create(context) {
        return {
            Program() {
                for (const comment of context.sourceCode.getAllComments()) {
                    if (!comment.loc || !comment.value.includes('eslint-disable') || !comment.value.includes('strict-null-checks')) continue;

                    context.report({ loc: comment.loc, messageId: 'suppressed', data: { hint: BACKLOG_HINT } });
                }
            }
        };
    }
};

export default {
    rules: {
        enforce,
        'no-suppression': noSuppression
    }
};

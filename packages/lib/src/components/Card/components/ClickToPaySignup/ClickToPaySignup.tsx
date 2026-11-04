import { Fragment, h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import classNames from 'classnames';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import useForm from '../../../../utils/useForm';
import { interpolateElement } from '../../../../language/utils';
import Checkbox from '../../../internal/FormFields/Checkbox';
import Field from '../../../internal/FormFields/Field';
import InputText from '../../../internal/FormFields/InputText';
import InputEmail from '../../../internal/FormFields/InputEmail';
import Img from '../../../internal/Img';
import { PhoneInputFields, usePhonePrefixes } from '../../../internal/PhoneInput';
import { phoneFormatters } from '../../../internal/PhoneInput/validate';
import { CtPInfoModal } from '../../../internal/ClickToPay/components/CtPInfo/CtPInfoModal';
import { LabelOnlyDisclaimerMessage } from '../../../internal/DisclaimerMessage/DisclaimerMessage';
import { MASTERCARD_PRIVACY_NOTICE_URL, MASTERCARD_TERMS_URL } from './constants';
import { getPhonePrefixForCountry, getSignupDetails, splitTelephoneNumber } from './utils';
import type { ValidatorRules } from '../../../../utils/Validator/types';
import type { ClickToPaySignupFormData, ClickToPaySignupProps } from './types';
import styles from './ClickToPaySignup.module.scss';

const SCHEMA = ['firstName', 'lastName', 'shopperEmail', 'phonePrefix', 'phoneNumber'];

/**
 * Sign-up is optional and must never block the payment, so every field is left unvalidated:
 * no errors and no valid state are ever shown.
 */
const NO_VALIDATION_RULES: ValidatorRules = {
    default: {
        validate: () => null,
        modes: []
    }
};

const noError = (): false => false;

export function ClickToPaySignup({
    firstName,
    lastName,
    shopperEmail,
    telephoneNumber,
    countryCode,
    checked,
    onConsentChange,
    onDetailsChange
}: Readonly<ClickToPaySignupProps>) {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
    const infoButtonRef = useRef<HTMLButtonElement>(null);

    const { phonePrefixes, loadingStatus } = usePhonePrefixes({ allowedCountries: [], loadingContext, handleError: undefined });

    const form = useForm<ClickToPaySignupFormData>({
        schema: SCHEMA,
        rules: NO_VALIDATION_RULES,
        formatters: phoneFormatters,
        defaultData: { firstName, lastName, shopperEmail }
    });
    const { data, handleChangeFor, setData } = form;

    // The prefilled number can only be split, and the default prefix picked, once the prefixes are known
    useEffect(() => {
        if (loadingStatus !== 'ready') return;

        if (!telephoneNumber) {
            const defaultPrefix = getPhonePrefixForCountry(phonePrefixes, countryCode);
            if (defaultPrefix) setData('phonePrefix', defaultPrefix);
            return;
        }

        const { phonePrefix, phoneNumber } = splitTelephoneNumber(
            telephoneNumber,
            phonePrefixes.map(({ id }) => id)
        );
        if (phonePrefix) setData('phonePrefix', phonePrefix);
        if (phoneNumber) setData('phoneNumber', phoneNumber);
    }, [loadingStatus]);

    useEffect(() => {
        onDetailsChange(getSignupDetails(data));
    }, [data]);

    const handleConsentChange = useCallback(() => {
        onConsentChange(!checked);
    }, [checked, onConsentChange]);

    const openInfoModal = useCallback((event: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        // The button sits inside the checkbox label, so the click must not also toggle the checkbox
        event.preventDefault();
        setIsInfoModalOpen(true);
    }, []);

    const closeInfoModal = useCallback(() => {
        setIsInfoModalOpen(false);
    }, []);

    const renderConsentLabel = () => {
        const message = i18n.get('ctp.signup.consentLabel');
        try {
            return (
                <Fragment>
                    {interpolateElement(message, [
                        function renderInfoButton(term: string) {
                            return (
                                <button
                                    ref={infoButtonRef}
                                    type="button"
                                    className={styles.infoButton}
                                    aria-haspopup="dialog"
                                    onClick={openInfoModal}
                                >
                                    {term}
                                </button>
                            );
                        }
                    ])}
                </Fragment>
            );
        } catch {
            return message.replace(/%#/g, '');
        }
    };

    return (
        <div className={styles.clickToPaySignup}>
            <div className={styles.form}>
                <div className={styles.consent}>
                    <Checkbox name="clickToPaySignupConsent" checked={checked} onChange={handleConsentChange} label={renderConsentLabel()} />
                    <Img className={styles.logo} src={getImage()('ctp')} alt={i18n.get('ctp.signup.a11y.logo')} />
                </div>

                {checked && (
                    <div className={styles.fields} role="group" aria-label={i18n.get('ctp.signup.a11y.detailsGroup')}>
                        <div className={styles.nameRow}>
                            <Field label={i18n.get('firstName')} name="firstName" className={classNames(styles.field, styles.firstName)} i18n={i18n}>
                                <InputText
                                    name="firstName"
                                    value={data.firstName}
                                    onInput={handleChangeFor('firstName', 'input')}
                                    onBlur={handleChangeFor('firstName', 'blur')}
                                    spellcheck={false}
                                    autocomplete="given-name"
                                />
                            </Field>
                            <Field label={i18n.get('lastName')} name="lastName" className={classNames(styles.field, styles.lastName)} i18n={i18n}>
                                <InputText
                                    name="lastName"
                                    value={data.lastName}
                                    onInput={handleChangeFor('lastName', 'input')}
                                    onBlur={handleChangeFor('lastName', 'blur')}
                                    spellcheck={false}
                                    autocomplete="family-name"
                                />
                            </Field>
                        </div>

                        <Field label={i18n.get('ctp.signup.emailLabel')} name="shopperEmail" className={styles.field} dir="ltr" i18n={i18n}>
                            <InputEmail
                                name="shopperEmail"
                                value={data.shopperEmail}
                                onInput={handleChangeFor('shopperEmail', 'input')}
                                onBlur={handleChangeFor('shopperEmail', 'blur')}
                                autocomplete="email"
                            />
                        </Field>

                        <div className={styles.phoneRow}>
                            <PhoneInputFields
                                form={form}
                                items={phonePrefixes}
                                getError={noError}
                                showPrefix={phonePrefixes.length > 0}
                                showNumber={true}
                                phoneNumberKey="ctp.signup.mobileLabel"
                                phoneNumberRequired={false}
                            />
                        </div>
                    </div>
                )}
            </div>

            {checked && (
                <Fragment>
                    <p className={styles.caption}>{i18n.get('ctp.signup.verificationInfo')}</p>
                    <p className={styles.caption}>
                        <LabelOnlyDisclaimerMessage
                            message={i18n.get('ctp.signup.termsAndPrivacy')}
                            urls={[MASTERCARD_TERMS_URL, MASTERCARD_PRIVACY_NOTICE_URL]}
                        />
                    </p>
                </Fragment>
            )}

            <CtPInfoModal isOpen={isInfoModalOpen} onClose={closeInfoModal} focusAfterClose={infoButtonRef.current} />
        </div>
    );
}

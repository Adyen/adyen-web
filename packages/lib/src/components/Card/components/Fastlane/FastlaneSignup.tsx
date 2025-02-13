import { Fragment, h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import cx from 'classnames';
import Toggle from '../../../internal/Toggle';
import Img from '../../../internal/Img';
import useImage from '../../../../core/Context/useImage';
import USOnlyPhoneInput from './USOnlyPhoneInput';
import { InfoButton } from './InfoButton';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { LabelOnlyDisclaimerMessage } from '../../../internal/DisclaimerMessage/DisclaimerMessage';
import type { FastlaneSignupConfiguration } from '../../../PayPalFastlane/types';
import { isConfigurationValid } from './utils/validate-configuration';

import './FastlaneSignup.scss';
import mobileNumberFormatter from './utils/mobile-number-formatter';

type FastlaneSignupProps = FastlaneSignupConfiguration & {
    currentDetectedBrand: string;
    onChange(state: any): void;
};

const SUPPORTED_BRANDS = ['mc', 'visa'];

const FastlaneSignup = ({
    showConsent,
    defaultToggleState,
    termsAndConditionsLink,
    privacyPolicyLink,
    termsAndConditionsVersion,
    fastlaneSessionId,
    currentDetectedBrand,
    telephoneNumber: telephoneNumberFromProps,
    onChange
}: FastlaneSignupProps) => {
    const displaySignup = useMemo(() => showConsent && SUPPORTED_BRANDS.includes(currentDetectedBrand), [showConsent, currentDetectedBrand]);
    const [consentShown, setConsentShown] = useState<boolean>(displaySignup);
    const [isChecked, setIsChecked] = useState<boolean>(defaultToggleState);
    const getImage = useImage();
    const [telephoneNumber, setTelephoneNumber] = useState<string>('');
    const { i18n } = useCoreContext();

    const isFastlaneConfigurationValid = useMemo(() => {
        return isConfigurationValid({
            showConsent,
            defaultToggleState,
            termsAndConditionsLink,
            privacyPolicyLink,
            termsAndConditionsVersion,
            fastlaneSessionId
        });
    }, [showConsent, defaultToggleState, termsAndConditionsLink, privacyPolicyLink, termsAndConditionsVersion, fastlaneSessionId]);

    /**
     * If the configuration is valid, the Component propagates fastlaneData to the Card component state
     *
     * 'telephoneNumber' is optional since the shopper can check out without passing it
     * 'termsAndConditionsVersion' is optional since the signup flow may not be available for the shopper, although we still add fastlaneData to the /payments request for analytics purposes
     */
    useEffect(() => {
        if (!isFastlaneConfigurationValid) {
            return;
        }

        onChange({
            fastlaneData: {
                consentShown,
                fastlaneSessionId: fastlaneSessionId,
                consentGiven: displaySignup ? isChecked : false,
                ...(termsAndConditionsVersion && { consentVersion: termsAndConditionsVersion }),
                ...(telephoneNumber && { telephoneNumber })
            }
        });
    }, [
        displaySignup,
        consentShown,
        termsAndConditionsVersion,
        isChecked,
        fastlaneSessionId,
        telephoneNumber,
        onChange,
        isFastlaneConfigurationValid
    ]);

    /**
     * If the sign-up has been displayed at least once, we set consentShown: true
     */
    useEffect(() => {
        if (displaySignup) setConsentShown(true);
    }, [displaySignup]);

    if (!displaySignup || !isFastlaneConfigurationValid) {
        return null;
    }

    return (
        <div className="adyen-checkout-card__fastlane" data-testid="fastlane-signup-component">
            <div
                className={cx('adyen-checkout-card__fastlane-consent-toggle', {
                    'adyen-checkout-card__fastlane-consent-toggle--active': isChecked
                })}
            >
                <Toggle
                    checked={isChecked}
                    onChange={setIsChecked}
                    ariaLabel={i18n.get('card.fastlane.consentToggle')}
                    label={
                        <Fragment>
                            <span>{i18n.get('card.fastlane.consentToggle')}</span>
                            <InfoButton />
                        </Fragment>
                    }
                />
            </div>

            {isChecked && (
                <Fragment>
                    <USOnlyPhoneInput initialValue={mobileNumberFormatter(telephoneNumberFromProps)} onChange={setTelephoneNumber} />
                    <div className="adyen-checkout-card__fastlane-consent-text">
                        <LabelOnlyDisclaimerMessage
                            message={i18n.get('card.fastlane.consentText')}
                            urls={[termsAndConditionsLink, privacyPolicyLink]}
                        />
                    </div>
                    <Img
                        className="adyen-checkout-card__fastlane-brand"
                        src={getImage({ imageFolder: 'components/' })(`paypal_fastlane_black`)}
                        alt={i18n.get('card.fastlane.a11y.logo')}
                    />
                </Fragment>
            )}
        </div>
    );
};

export default FastlaneSignup;

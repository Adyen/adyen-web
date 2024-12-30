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

import './FastlaneSignup.scss';

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
    onChange
}: FastlaneSignupProps) => {
    const displaySignup = useMemo(() => showConsent && SUPPORTED_BRANDS.includes(currentDetectedBrand), [showConsent, currentDetectedBrand]);
    const [consentShown, setConsentShown] = useState<boolean>(displaySignup);
    const [isChecked, setIsChecked] = useState<boolean>(defaultToggleState);
    const getImage = useImage();
    const [telephoneNumber, setTelephoneNumber] = useState<string>('');
    const { i18n } = useCoreContext();

    // Blocked by paypal
    // TODO: Validate that parameters are valid. If showConsent is false, do we get privacyLink, t&c link, version, etc?

    useEffect(() => {
        onChange({
            fastlaneData: {
                consentShown,
                consentVersion: termsAndConditionsVersion,
                consentGiven: isChecked,
                fastlaneSessionId: fastlaneSessionId,
                ...(telephoneNumber && { telephoneNumber })
            }
        });
    }, [consentShown, termsAndConditionsVersion, isChecked, fastlaneSessionId, telephoneNumber, onChange]);

    useEffect(() => {
        if (displaySignup) setConsentShown(true);
    }, [displaySignup]);

    if (!displaySignup) {
        return null;
    }

    return (
        <div className="adyen-checkout-card__fastlane">
            <div
                className={cx('adyen-checkout-card__fastlane-consent-toggle', {
                    'adyen-checkout-card__fastlane-consent-toggle--active': isChecked
                })}
            >
                <Toggle checked={isChecked} onChange={setIsChecked} label={i18n.get('card.fastlane.consentToggle')} />
                <InfoButton />
            </div>

            {isChecked && (
                <Fragment>
                    <USOnlyPhoneInput onChange={setTelephoneNumber} />
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

import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';
import cx from 'classnames';
import Toggle from '../../../internal/Toggle';
import Img from '../../../internal/Img';
import useImage from '../../../../core/Context/useImage';
import USOnlyPhoneInput from './USOnlyPhoneInput';
import { InfoButton } from './InfoButton';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { LabelOnlyDisclaimerMessage } from '../../../internal/DisclaimerMessage/DisclaimerMessage';

import './FastlaneSignup.scss';

interface FastlaneSignupProps {
    termsAndConditionsLink: string;
    privacyPolicyLink: string;
    defaultToggleState: boolean;
}

const FastlaneSignup = ({ termsAndConditionsLink, privacyPolicyLink, defaultToggleState = false }: FastlaneSignupProps) => {
    const [isChecked, setIsChecked] = useState<boolean>(defaultToggleState);
    const getImage = useImage();
    const { i18n } = useCoreContext();

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
                    <USOnlyPhoneInput onChange={value => console.log(value)} />
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

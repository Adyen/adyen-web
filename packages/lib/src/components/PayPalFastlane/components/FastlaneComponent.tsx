import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { ComponentMethodsRef, PayButtonFunctionProps, UIElementStatus } from '../../internal/UIElement/types';
import FastlaneBrandIcon from './FaslaneBrandIcon';
import { PREFIX } from '../../internal/Icon/constants';
import useImage from '../../../core/Context/useImage';
import Img from '../../internal/Img';

import './Fastlane.scss';

interface FastlaneComponentProps {
    lastFour: string;
    brand: string;
    showPayButton: boolean;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    payButton(props?: PayButtonFunctionProps): h.JSX.Element;
}

const FastlaneComponent = ({ lastFour, brand, payButton, setComponentRef, showPayButton }: FastlaneComponentProps) => {
    const getImage = useImage();
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const fastlaneRef = useRef({
        setStatus: (status: UIElementStatus) => setStatus(status)
    });

    useEffect(() => {
        setComponentRef(fastlaneRef.current);
    }, []);

    return (
        <div className="adyen-checkout-fastlane" data-testid="payment-method-fastlane">
            <div className="adyen-checkout-fastlane__card-section">
                <FastlaneBrandIcon brand={brand} />
                <span className="adyen-checkout-fastlane__card-number">•••• {lastFour}</span>
            </div>

            {showPayButton && payButton({ status, icon: getImage({ imageFolder: 'components/' })(`${PREFIX}lock`) })}

            <div className="adyen-checkout-fastlane__brand">
                <Img width="95px" src={getImage({ imageFolder: 'components/' })(`paypal_fastlane_gray`)} alt="Fastlane logo" />
            </div>
        </div>
    );
};

export default FastlaneComponent;

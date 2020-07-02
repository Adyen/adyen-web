import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Spinner from '../../internal/Spinner';
import AmazonPayButton from './AmazonPayButton';
import { getAmazonPayUrl } from '../utils';
import { AmazonPayComponentProps } from '../types';

export default function AmazonPayComponent(props: AmazonPayComponentProps) {
    const [status, setStatus] = useState('pending');

    const handleLoad = () => {
        setStatus('ready');
    };

    useEffect(() => {
        const script = document.createElement('script');
        const amazonPayUrl = getAmazonPayUrl(props.region);
        script.async = true;
        script.onload = handleLoad;
        script.src = amazonPayUrl;
        document.body.appendChild(script);
    }, []);

    if (status === 'pending') {
        return (
            <div className="adyen-checkout__amazonpay">
                <div className="adyen-checkout__amazonpay__status adyen-checkout__amazonpay__status--pending">
                    <Spinner />
                </div>
            </div>
        );
    }

    return <AmazonPayButton {...props} amazonRef={window.amazon} />;
}

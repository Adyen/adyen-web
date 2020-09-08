import { h } from 'preact';
import UIElement from '../UIElement';
import DeviceFingerprint from './components/DeviceFingerprint';

interface ThreeDS2DeviceFingerprintElementProps {
    dataKey: string;
    fingerprintToken: string;
    notificationURL: string;
    onError: (error?: string | object) => void;
    paymentData: string;
    showSpinner?: boolean;
    type: string;
}

class ThreeDS2DeviceFingerprintElement extends UIElement<ThreeDS2DeviceFingerprintElementProps> {
    public static type = 'threeDS2Fingerprint';

    public static defaultProps = {
        dataKey: 'threeds2.fingerprint',
        type: 'IdentifyShopper',
        onComplete: () => {}
    };

    render() {
        return <DeviceFingerprint {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2DeviceFingerprintElement;

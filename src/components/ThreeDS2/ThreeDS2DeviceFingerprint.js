import { h } from 'preact';
import UIElement from '../UIElement';
import ThreeDS2DeviceFingerprint from './components/DeviceFingerprint';

/**
 * ThreeDS2DeviceFingerprintElement
 * @extends UIElement
 */
class ThreeDS2DeviceFingerprintElement extends UIElement {
    static type = 'threeDS2Fingerprint';

    static defaultProps = {
        dataKey: 'threeds2.fingerprint',
        deviceFingerPrintContainer: null,
        type: 'IdentifyShopper',
        notificationURL: null,
        onComplete: () => {}
    };

    render() {
        return <ThreeDS2DeviceFingerprint {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2DeviceFingerprintElement;

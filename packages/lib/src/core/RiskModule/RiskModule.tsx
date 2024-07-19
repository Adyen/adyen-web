import { h } from 'preact';
import BaseElement from '../../components/BaseElement';
import { BaseElementProps } from '../../components/types';
import DeviceFingerprint from './components/DeviceFingerprint';
import base64 from '../../utils/base64';
import { RISK_DATA_VERSION, DEVICE_FINGERPRINT } from './constants';

export interface RiskModuleOptions {
    enabled: boolean;
    onComplete: (data) => void;
    onError: (error) => void;
    node: string;
}

interface RiskModuleProps extends BaseElementProps {
    risk: RiskModuleOptions;
    loadingContext: string;
}

export type RiskData = string | boolean;

export default class RiskElement extends BaseElement<RiskModuleProps> {
    public static type = 'risk';
    public static defaultProps = {
        risk: {
            enabled: true,
            onComplete: () => {},
            onError: () => {},
            node: 'body'
        }
    };

    private nodeRiskContainer = null;

    constructor(props) {
        super(props);

        // Populate state with null values
        const riskElements = {
            [DEVICE_FINGERPRINT]: null
        };

        this.setState({ data: riskElements });

        if (this.props.risk.enabled === true) {
            if (document.querySelector(this.props.risk.node)) {
                this.nodeRiskContainer = document.createElement('div');
                document.querySelector(this.props.risk.node).appendChild(this.nodeRiskContainer);
                this.mount(this.nodeRiskContainer);
            } else {
                this.onError({ message: 'RiskModule node was not found' });
            }
        }
    }

    formatProps(props) {
        return {
            ...props,
            risk: {
                ...RiskElement.defaultProps.risk,
                ...props.risk
            }
        };
    }

    public onComplete = result => {
        const data = { ...this.state.data, [result.type]: result.value, persistentCookie: result.persistentCookie, components: result.components };
        this.setState({ data, isValid: true });
        this.props.risk.onComplete(this.data);
        this.cleanUp();
    };

    public onError = error => {
        this.props.risk.onError(error);
        this.cleanUp();
    };

    get isValid() {
        return this.state.isValid;
    }

    get data(): RiskData {
        if (this.isValid) {
            const dataObj = { version: RISK_DATA_VERSION, ...this.state.data };
            return base64.encode(JSON.stringify(dataObj));
        }

        return false;
    }

    public get enabled() {
        return this.props.risk.enabled;
    }

    public cleanUp = () => {
        if (this.nodeRiskContainer && this.nodeRiskContainer.parentNode) this.nodeRiskContainer.parentNode.removeChild(this.nodeRiskContainer);
    };

    componentWillUnmount() {
        this.cleanUp();
    }

    render() {
        return <DeviceFingerprint {...this.props} loadingContext={this.props.loadingContext} onComplete={this.onComplete} onError={this.onError} />;
    }
}

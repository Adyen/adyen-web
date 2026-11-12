import RiskElement from './RiskModule';
import base64 from '../../utils/base64';
import { RISK_DATA_VERSION } from './constants';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();

const NODE_NOT_FOUND_ERROR = { message: 'RiskModule node was not found' };
const EXPECTED_RISK_DATA = base64.encode(JSON.stringify({ version: RISK_DATA_VERSION, deviceFingerprint: 'x' }));

describe('RiskModule', () => {
    let appendChildSpy: jest.SpyInstance;

    beforeEach(() => {
        appendChildSpy = jest.spyOn(document.body, 'appendChild');
    });

    afterEach(() => {
        appendChildSpy.mockRestore();
    });

    const getAppendedContainer = (): Node => {
        expect(appendChildSpy).toHaveBeenCalledTimes(1);
        return appendChildSpy.mock.calls[0][0];
    };

    describe('when risk.node is not found', () => {
        test('should call risk.onError once with the node-not-found message when risk.node is undefined', () => {
            const onError = jest.fn();

            const riskElement = new RiskElement(core, { risk: { enabled: true, node: undefined, onError } });

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(NODE_NOT_FOUND_ERROR);
            expect(appendChildSpy).not.toHaveBeenCalled();
            expect(riskElement.riskData).toBeNull();
        });

        test('should not throw from the constructor when risk.node is not found and risk.onError is undefined', () => {
            let riskElement: RiskElement | undefined;

            expect(() => {
                riskElement = new RiskElement(core, { risk: { enabled: true, node: '#missing', onError: undefined } });
            }).not.toThrow();

            expect(riskElement?.riskData).toBeNull();
        });
    });

    describe('cleanUp', () => {
        test('should call risk.onComplete once with the encoded riskData and then remove its container', () => {
            let containerConnectedDuringCallback: boolean | undefined;
            const onComplete = jest.fn(() => {
                containerConnectedDuringCallback = getAppendedContainer().isConnected;
            });

            const riskElement = new RiskElement(core, { risk: { enabled: true, onComplete } });
            const container = getAppendedContainer();
            expect(container.isConnected).toBe(true);

            riskElement.onComplete({ type: 'deviceFingerprint', value: 'x' });

            expect(onComplete).toHaveBeenCalledTimes(1);
            expect(onComplete).toHaveBeenCalledWith(EXPECTED_RISK_DATA);
            expect(riskElement.riskData).toBe(EXPECTED_RISK_DATA);
            expect(containerConnectedDuringCallback).toBe(true);
            expect(container.isConnected).toBe(false);
        });

        test('should not throw and should remove its container when risk.onComplete is undefined', () => {
            const riskElement = new RiskElement(core, { risk: { enabled: true, onComplete: undefined } });
            const container = getAppendedContainer();
            expect(container.isConnected).toBe(true);

            expect(() => riskElement.onComplete({ type: 'deviceFingerprint', value: 'x' })).not.toThrow();

            expect(container.isConnected).toBe(false);
            expect(riskElement.riskData).not.toBeNull();
        });

        test('should not throw and should remove its container when risk.onError is undefined', () => {
            const riskElement = new RiskElement(core, { risk: { enabled: true, onError: undefined } });
            const container = getAppendedContainer();
            expect(container.isConnected).toBe(true);

            expect(() => riskElement.onError({ message: 'fingerprint failed' })).not.toThrow();

            expect(container.isConnected).toBe(false);
        });

        test('should remove its container on componentWillUnmount', () => {
            const riskElement = new RiskElement(core, { risk: { enabled: true } });
            const container = getAppendedContainer();
            expect(container.isConnected).toBe(true);

            riskElement.componentWillUnmount();
            expect(container.isConnected).toBe(false);

            expect(() => riskElement.componentWillUnmount()).not.toThrow();
        });
    });
});

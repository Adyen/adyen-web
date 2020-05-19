import { mount } from 'enzyme';
import { h } from 'preact';
import ThreeDS2DeviceFingerprint from './ThreeDS2DeviceFingerprint';

const fingerPrintToken = {
    threeDSMethodNotificationURL:
        'http://localhost:8080/checkoutshopper/threeDSMethodNotification.shtml?originKey=pub.v2.9915577472872913.aHR0cDovL2xvY2FsaG9zdDo4MDgw.1lTNncM-m12vA2Qv7pdahcaZ8vbucNhpVmmYwrhEYx0',
    threeDSMethodUrl: 'http://localhost:8080/fakeURL',
    threeDSServerTransID: 'aaf9864a-a2a4-4ccf-8eeb-a17d4101e5ae'
};

const threeDS2FingerPrintToken = JSON.stringify(fingerPrintToken);
const base64FingerPrintToken = {
    fingerprintToken: btoa(threeDS2FingerPrintToken)
};

describe('ThreeDS2DeviceFingerprint', () => {
    test("Doesn't throw an error when passing correct properties", () => {
        const completeFunction = jest.fn();
        const errorFunction = jest.fn();
        const formResult = `
            <html>
                <body>
                    <script>
                    var type = 'fingerPrintResult';
                    var data = {
                        result: {
                            threeDSCompInd: 'Y'
                        },
                        type: type
                    };

                    var result = JSON.stringify(data);
                    window.parent.postMessage(result, 'http://localhost:8011');
                    </script>
                </body>
            </html>
        `;

        HTMLFormElement.prototype.submit = jest.fn().mockImplementation(() => formResult);

        mount(<ThreeDS2DeviceFingerprint {...base64FingerPrintToken} onError={errorFunction} onComplete={completeFunction} />);
        expect(errorFunction.mock.calls.length).toBe(0);
    });
});

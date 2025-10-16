import { mount } from 'enzyme';
import { render, waitFor, screen } from '@testing-library/preact';
import { h } from 'preact';
import RedirectShopper from './components/RedirectShopper';
import RedirectElement from './Redirect';
import Analytics from '../../core/Analytics';
import { RedirectConfiguration } from './types';

jest.mock('../../utils/detectInIframeInSameOrigin', () => {
    return jest.fn().mockImplementation(() => {
        return true;
    });
});

describe('Redirect', () => {
    describe('isValid', () => {
        test('Is always valid', () => {
            const redirect = new RedirectElement(global.core, { type: 'redirect' });
            expect(redirect.isValid).toBe(true);
        });
    });

    describe('Redirect Status', () => {
        test('Accepts a POST redirect status', done => {
            window.HTMLFormElement.prototype.submit = jest.fn();

            // @ts-ignore ignore
            const wrapper = mount(<RedirectShopper url="http://www.adyen.com" method="POST" data={{}} />);

            expect(wrapper.find('form')).toHaveLength(1);
            expect(wrapper.find('form').prop('action')).toBe('http://www.adyen.com');
            expect(wrapper.find('form').prop('target')).toBe(undefined);

            setTimeout(() => {
                expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalled();
                done();
            }, 0);
        });

        test('Accepts a POST redirect status, setting target to _top, when the config prop tells it to', done => {
            window.HTMLFormElement.prototype.submit = jest.fn();

            // @ts-ignore ignore
            const wrapper = mount(<RedirectShopper url="http://www.adyen.com" method="POST" data={{}} redirectFromTopWhenInIframe={true} />);

            expect(wrapper.find('form')).toHaveLength(1);
            expect(wrapper.find('form').prop('target')).toBe('_top');
            setTimeout(() => {
                expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    describe('Redirect formatData', () => {
        test('should send browserInfo in the data', () => {
            const redirectElement = new RedirectElement(global.core);
            expect(redirectElement.formatData().browserInfo).not.toBeNull();
        });
    });
});

describe('Redirect error', () => {
    const oldWindowLocation = window.location;

    beforeAll(() => {
        delete window.location;
        // @ts-ignore test only
        window.location = Object.defineProperties(
            {},
            {
                ...Object.getOwnPropertyDescriptors(oldWindowLocation),
                assign: {
                    configurable: true,
                    value: jest.fn()
                }
            }
        );
    });

    afterAll(() => {
        window.location = oldWindowLocation;
    });

    test('should send an error event to the analytics module if beforeRedirect rejects', async () => {
        const analytics = Analytics({ analytics: {}, analyticsContext: '', locale: '', clientKey: '' });
        analytics.sendAnalytics = jest.fn(() => true);
        const props: RedirectConfiguration = {
            url: 'test',
            method: 'POST',
            paymentMethodType: 'ideal',
            modules: { analytics },
            beforeRedirect: (_, reject) => {
                return reject();
            }
        };

        const redirectElement = new RedirectElement(global.core, props);
        render(redirectElement.render());
        await waitFor(() => {
            expect(screen.getByTestId('redirect-shopper-form')).toBeInTheDocument();
        });

        expect(analytics.sendAnalytics).toHaveBeenCalledWith({
            code: '600',
            component: 'ideal',
            errorType: 'Redirect',
            timestamp: expect.any(String),
            id: expect.any(String)
        });
    });

    test('should send an error event to the analytics module if the redirection failed', async () => {
        (window.location.assign as jest.Mock).mockImplementation(() => {
            throw new Error('Mock error');
        });

        const analytics = Analytics({ analytics: {}, analyticsContext: '', locale: '', clientKey: '' });
        analytics.sendAnalytics = jest.fn(() => true);
        const props: RedirectConfiguration = {
            url: 'test',
            method: 'GET',
            paymentMethodType: 'ideal',
            modules: { analytics }
        };

        const redirectElement = new RedirectElement(global.core, props);
        render(redirectElement.render());

        await waitFor(() => {
            expect(analytics.sendAnalytics).toHaveBeenCalledWith({
                code: '600',
                component: 'ideal',
                errorType: 'Redirect',
                timestamp: expect.any(String),
                id: expect.any(String)
            });
        });
    });
});

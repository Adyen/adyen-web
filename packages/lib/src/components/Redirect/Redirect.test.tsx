import { render, waitFor, screen } from '@testing-library/preact';
import { h } from 'preact';
import RedirectShopper from './components/RedirectShopper';
import RedirectElement from './Redirect';
import { RedirectConfiguration } from './types';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

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
        test('should accept a POST redirect status', async () => {
            window.HTMLFormElement.prototype.submit = jest.fn();

            // @ts-ignore ignore
            render(<RedirectShopper url="http://www.adyen.com" method="POST" data={{}} />);

            const form = screen.getByTestId('redirect-shopper-form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveAttribute('action', 'http://www.adyen.com');
            expect(form).not.toHaveAttribute('target');

            await waitFor(() => {
                expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalled();
            });
        });

        test('should accept a POST redirect status, setting target to _top, when the config prop tells it to', async () => {
            window.HTMLFormElement.prototype.submit = jest.fn();

            // @ts-ignore ignore
            render(<RedirectShopper url="http://www.adyen.com" method="POST" data={{}} redirectFromTopWhenInIframe={true} />);

            const form = screen.getByTestId('redirect-shopper-form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveAttribute('target', '_top');

            await waitFor(() => {
                expect(window.HTMLFormElement.prototype.submit).toHaveBeenCalled();
            });
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
        window.location = oldWindowLocation as string & Location;
    });

    test('should send an error event to the analytics module if beforeRedirect rejects', async () => {
        const core = setupCoreMock();
        const props: RedirectConfiguration = {
            url: 'test',
            method: 'POST',
            paymentMethodType: 'ideal',
            beforeRedirect: (_, reject) => {
                return reject();
            }
        };

        const redirectElement = new RedirectElement(core, props);
        render(redirectElement.render());

        await waitFor(() => {
            expect(screen.getByTestId('redirect-shopper-form')).toBeInTheDocument();
        });

        expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledWith({
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

        const core = setupCoreMock();

        const props: RedirectConfiguration = {
            url: 'test',
            method: 'GET',
            paymentMethodType: 'ideal'
        };

        const redirectElement = new RedirectElement(core, props);
        render(redirectElement.render());

        await waitFor(() => {
            expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledTimes(1);
        });

        expect(core.modules.analytics.sendAnalytics).toHaveBeenCalledWith(
            expect.objectContaining({
                code: '600',
                component: 'ideal',
                errorType: 'Redirect',
                timestamp: expect.any(String),
                id: expect.any(String)
            })
        );
    });
});

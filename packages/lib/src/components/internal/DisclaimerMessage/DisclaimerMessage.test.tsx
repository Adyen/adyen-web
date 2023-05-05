import { h } from 'preact';
import DisclaimerMessage from './DisclaimerMessage';
import { render, screen } from '@testing-library/preact';

describe('DisclaimerMessage', () => {
    const disclaimerMessage = {
        message: 'By continuing you accept the %#terms and conditions%# of MyStore',
        urls: ['https://www.adyen.com']
    };

    test('Renders the DisclaimerMessage with text before and after the link', () => {
        render(<DisclaimerMessage {...disclaimerMessage} />);
        expect(screen.getByText('By continuing', { exact: false }).textContent).toEqual(
            'By continuing you accept the terms and conditions of MyStore'
        );
        expect(screen.getByRole('link', { name: 'terms and conditions' })).toHaveAttribute('href', 'https://www.adyen.com');
    });

    test('Renders the DisclaimerMessage just with text before the link', () => {
        const nuMsg = { ...disclaimerMessage };
        nuMsg.message = 'By continuing you accept the %#terms and conditions%#';

        render(<DisclaimerMessage {...nuMsg} />);

        /* eslint-disable-next-line */
        expect(screen.queryByText('By continuing', { exact: false })).toBeTruthy(); // presence
        /* eslint-disable-next-line */
        expect(screen.queryByRole('link')).toBeTruthy(); // presence

        expect(screen.getByText('By continuing', { exact: false }).textContent).toEqual('By continuing you accept the terms and conditions');
        expect(screen.getByRole('link', { name: 'terms and conditions' })).toHaveAttribute('href', 'https://www.adyen.com');
    });

    test("Doesn't render the DisclaimerMessage because the link is not https", () => {
        const nuMsg = { ...disclaimerMessage };
        nuMsg.urls = ['http://www.adyen.com'];

        render(<DisclaimerMessage {...nuMsg} />);
        expect(screen.queryByText('By continuing', { exact: false })).toBeNull(); // non-presence
    });

    test("Doesn't render the DisclaimerMessage because the linkText is not a string", () => {
        const nuMsg = { ...disclaimerMessage };

        /* eslint-disable-next-line */
        nuMsg.message = <script>alert("busted")</script>;

        render(<DisclaimerMessage {...nuMsg} />);
        expect(screen.queryByText('By continuing', { exact: false })).toBeNull(); // non-presence
    });

    test("Doesn't render the DisclaimerMessage because the message is not a string", () => {
        const nuMsg = { ...disclaimerMessage };
        // @ts-ignore allow assignment
        nuMsg.message = {};

        render(<DisclaimerMessage {...nuMsg} />);
        expect(screen.queryByRole('link')).toBeNull(); // non-presence
    });
});

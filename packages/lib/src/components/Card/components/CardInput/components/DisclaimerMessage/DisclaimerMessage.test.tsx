import { h } from 'preact';
import DisclaimerMessage from './DisclaimerMessage';
import { render, screen } from '@testing-library/preact';

describe('DisclaimerMessage', () => {
    const disclaimerMessage = {
        message: 'By continuing you accept the %{linkText} of MyStore',
        linkText: 'terms and conditions',
        link: 'https://www.adyen.com'
    };

    test('Renders the DisclaimerMessage with text before and after the link', () => {
        render(<DisclaimerMessage disclaimer={disclaimerMessage} />);
        expect(screen.getByText('By continuing', { exact: false }).textContent).toEqual(
            'By continuing you accept the terms and conditions of MyStore'
        );
        expect(screen.getByRole('link', { name: 'terms and conditions' })).toHaveAttribute('href', 'https://www.adyen.com');
    });

    test('Renders the DisclaimerMessage just with text before the link', () => {
        const nuMsg = { ...disclaimerMessage };
        nuMsg.message = 'By continuing you accept the %{linkText}';

        render(<DisclaimerMessage disclaimer={nuMsg} />);

        /* eslint-disable-next-line */
        expect(screen.queryByText('By continuing', { exact: false })).toBeTruthy(); // presence
        /* eslint-disable-next-line */
        expect(screen.queryByRole('link')).toBeTruthy(); // presence

        expect(screen.getByText('By continuing', { exact: false }).textContent).toEqual('By continuing you accept the terms and conditions');
        expect(screen.getByRole('link', { name: 'terms and conditions' })).toHaveAttribute('href', 'https://www.adyen.com');
    });

    test("Doesn't render the DisclaimerMessage because the link is not https", () => {
        const nuMsg = { ...disclaimerMessage };
        nuMsg.link = 'http://www.adyen.com';

        render(<DisclaimerMessage disclaimer={nuMsg} />);
        expect(screen.queryByText('By continuing', { exact: false })).toBeNull(); // non-presence
    });

    test("Doesn't render the DisclaimerMessage because the linkText is not a string", () => {
        const nuMsg = { ...disclaimerMessage };

        /* eslint-disable-next-line */
        nuMsg.linkText = <script>alert("busted")</script>;

        render(<DisclaimerMessage disclaimer={nuMsg} />);
        expect(screen.queryByText('By continuing', { exact: false })).toBeNull(); // non-presence
    });

    test("Doesn't render the DisclaimerMessage because the message is not a string", () => {
        const nuMsg = { ...disclaimerMessage };
        // @ts-ignore allow assignment
        nuMsg.message = {};

        render(<DisclaimerMessage disclaimer={nuMsg} />);
        expect(screen.queryByRole('link')).toBeNull(); // non-presence
    });
});

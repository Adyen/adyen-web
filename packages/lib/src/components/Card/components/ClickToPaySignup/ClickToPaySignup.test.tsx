import { h } from 'preact';
import { useState } from 'preact/hooks';
import { render, screen, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import getDataset from '../../../../core/Services/get-dataset';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import { ClickToPaySignup } from './ClickToPaySignup';
import { MASTERCARD_PRIVACY_NOTICE_URL, MASTERCARD_TERMS_URL } from './constants';
import { InfoEventType, UiTarget } from '../../../../core/Analytics/events/AnalyticsInfoEvent';
import type { ClickToPaySignupProps } from './types';

jest.mock('../../../../core/Services/get-dataset');

const PHONE_PREFIXES_MOCK: { id: string; prefix: string }[] = [
    { id: 'NL', prefix: '+31' },
    { id: 'US', prefix: '+1' }
];

type SignupTestProps = Partial<ClickToPaySignupProps> & { defaultChecked?: boolean };

const SignupWithState = ({
    defaultChecked = false,
    onConsentChange,
    onDetailsChange,
    onSubmitAnalytics = jest.fn(),
    ...props
}: Readonly<SignupTestProps>) => {
    const [checked, setChecked] = useState<boolean>(defaultChecked);

    return (
        <ClickToPaySignup
            {...props}
            checked={checked}
            onConsentChange={value => {
                setChecked(value);
                onConsentChange?.(value);
            }}
            onDetailsChange={details => onDetailsChange?.(details)}
            onSubmitAnalytics={onSubmitAnalytics}
        />
    );
};

const renderSignup = (props: SignupTestProps = {}) => {
    const core = setupCoreMock();

    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <SignupWithState onSubmitAnalytics={jest.fn()} {...props} />
        </CoreProvider>
    );
};

const getConsentCheckbox = () => screen.getByRole('checkbox', { name: /Save my information with Click to Pay/ });
const queryFirstNameInput = () => screen.queryByRole('textbox', { name: 'First name' });

describe('ClickToPaySignup', () => {
    beforeEach(() => {
        (getDataset as jest.Mock).mockResolvedValue(PHONE_PREFIXES_MOCK);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should render collapsed by default', () => {
        renderSignup();

        expect(getConsentCheckbox()).not.toBeChecked();
        expect(screen.getByRole('img', { name: 'Click to Pay logo' })).toBeInTheDocument();
        expect(queryFirstNameInput()).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Terms' })).not.toBeInTheDocument();
    });

    test('should expand the form when the consent checkbox is checked', async () => {
        const user = userEvent.setup();
        const onConsentChange = jest.fn();
        renderSignup({ onConsentChange });

        await user.click(getConsentCheckbox());

        expect(onConsentChange).toHaveBeenCalledWith(true);
        expect(getConsentCheckbox()).toBeChecked();
        expect(screen.getByRole('textbox', { name: 'First name' })).toBeVisible();
        expect(screen.getByRole('textbox', { name: 'Last name' })).toBeVisible();
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeVisible();
        expect(screen.getByRole('textbox', { name: 'Mobile' })).toBeVisible();
        expect(await screen.findByRole('combobox', { name: /Prefix/ })).toBeVisible();
        expect(screen.getByText(/Your email and mobile number will be used to verify you/)).toBeVisible();
    });

    test('should group the sign-up fields under an accessible name, leaving the consent checkbox outside', async () => {
        renderSignup({ defaultChecked: true });

        const group = screen.getByRole('group', { name: 'Click to Pay sign up details' });

        expect(within(group).getByRole('textbox', { name: 'First name' })).toBeInTheDocument();
        expect(within(group).getByRole('textbox', { name: 'Last name' })).toBeInTheDocument();
        expect(within(group).getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
        expect(within(group).getByRole('textbox', { name: 'Mobile' })).toBeInTheDocument();
        expect(await within(group).findByRole('combobox', { name: /Prefix/ })).toBeInTheDocument();
        expect(within(group).queryByRole('checkbox')).not.toBeInTheDocument();
    });

    test('should not render the sign-up fields group while collapsed', () => {
        renderSignup();

        expect(screen.queryByRole('group', { name: 'Click to Pay details' })).not.toBeInTheDocument();
    });

    test('should collapse the form when the consent checkbox is unchecked', async () => {
        const user = userEvent.setup();
        const onConsentChange = jest.fn();
        renderSignup({ defaultChecked: true, onConsentChange });

        expect(queryFirstNameInput()).toBeInTheDocument();

        await user.click(getConsentCheckbox());

        expect(onConsentChange).toHaveBeenCalledWith(false);
        expect(queryFirstNameInput()).not.toBeInTheDocument();
    });

    test('should prefill the fields and split the telephone number into prefix and number', async () => {
        const onDetailsChange = jest.fn();
        renderSignup({
            defaultChecked: true,
            firstName: 'Arjen',
            lastName: 'Landstra',
            shopperEmail: 'arjen@example.com',
            telephoneNumber: '+31612345678',
            onDetailsChange
        });

        expect(screen.getByRole('textbox', { name: 'First name' })).toHaveValue('Arjen');
        expect(screen.getByRole('textbox', { name: 'Last name' })).toHaveValue('Landstra');
        expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('arjen@example.com');

        await waitFor(() => expect(screen.getByRole('textbox', { name: 'Mobile' })).toHaveValue('612345678'));
        expect(screen.getByRole('combobox', { name: /Prefix/ })).toHaveValue('+31');

        await waitFor(() =>
            expect(onDetailsChange).toHaveBeenLastCalledWith({
                firstName: 'Arjen',
                lastName: 'Landstra',
                shopperEmail: 'arjen@example.com',
                telephoneNumber: '+31612345678'
            })
        );
    });

    test('should preselect the phone prefix of the country code', async () => {
        renderSignup({ defaultChecked: true, countryCode: 'nl' });

        await waitFor(() => expect(screen.getByRole('combobox', { name: /Prefix/ })).toHaveValue('+31'));
        expect(screen.getByRole('textbox', { name: 'Mobile' })).toHaveValue('');
    });

    test('should prefer the prefix of the prefilled telephone number over the country code', async () => {
        renderSignup({ defaultChecked: true, countryCode: 'NL', telephoneNumber: '+15550100' });

        await waitFor(() => expect(screen.getByRole('textbox', { name: 'Mobile' })).toHaveValue('5550100'));
        expect(screen.getByRole('combobox', { name: /Prefix/ })).toHaveValue('+1');
    });

    test('should keep the prefilled details while collapsed', async () => {
        const onDetailsChange = jest.fn();
        renderSignup({ firstName: 'Arjen', telephoneNumber: '+1 555 0100', onDetailsChange });

        await waitFor(() => expect(onDetailsChange).toHaveBeenLastCalledWith({ firstName: 'Arjen', telephoneNumber: '+15550100' }));
    });

    test('should emit the details as the shopper types, leaving out empty fields', async () => {
        const user = userEvent.setup();
        const onDetailsChange = jest.fn();
        renderSignup({ defaultChecked: true, onDetailsChange });

        expect(onDetailsChange).toHaveBeenLastCalledWith({});

        await user.type(screen.getByRole('textbox', { name: 'First name' }), 'Jane');
        await user.type(screen.getByRole('textbox', { name: 'Email' }), 'jane@example.com');

        expect(onDetailsChange).toHaveBeenLastCalledWith({ firstName: 'Jane', shopperEmail: 'jane@example.com' });

        await user.type(screen.getByRole('textbox', { name: 'Mobile' }), '6 12-34');

        expect(onDetailsChange).toHaveBeenLastCalledWith({ firstName: 'Jane', shopperEmail: 'jane@example.com', telephoneNumber: '61234' });
    });

    test('should not show validation errors or mark fields as required', async () => {
        const user = userEvent.setup();
        renderSignup({ defaultChecked: true });

        await user.type(screen.getByRole('textbox', { name: 'Email' }), 'not-an-email');
        await user.type(screen.getByRole('textbox', { name: 'Mobile' }), '1');
        await user.click(screen.getByRole('textbox', { name: 'First name' }));
        await user.tab();

        for (const input of screen.getAllByRole('textbox')) {
            expect(input).not.toHaveAttribute('aria-invalid', 'true');
            expect(input).not.toBeRequired();
        }
        expect(screen.queryByRole('img', { name: 'Error' })).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: 'Valid' })).not.toBeInTheDocument();
    });

    test('should render the Mastercard terms and privacy notice links', () => {
        renderSignup({ defaultChecked: true });

        expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', MASTERCARD_TERMS_URL);
        expect(screen.getByRole('link', { name: 'Privacy Notice' })).toHaveAttribute('href', MASTERCARD_PRIVACY_NOTICE_URL);
    });

    test('should open the Click to Pay info dialog without toggling the consent', async () => {
        const user = userEvent.setup();
        const onConsentChange = jest.fn();
        renderSignup({ onConsentChange });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Click to Pay' }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onConsentChange).not.toHaveBeenCalled();
        expect(getConsentCheckbox()).not.toBeChecked();
    });

    test('should still render the mobile number when the phone prefixes fail to load', async () => {
        (getDataset as jest.Mock).mockRejectedValue(new Error('Dataset phonenumbers is not available'));
        const onDetailsChange = jest.fn();
        renderSignup({ defaultChecked: true, telephoneNumber: '+31612345678', onDetailsChange });

        await waitFor(() => expect(screen.getByRole('textbox', { name: 'Mobile' })).toHaveValue('31612345678'));
        expect(screen.queryByRole('combobox', { name: /Prefix/ })).not.toBeInTheDocument();
    });

    describe('analytics', () => {
        const getSignupEvents = (onSubmitAnalytics: jest.Mock, type: InfoEventType) =>
            onSubmitAnalytics.mock.calls.filter(([event]) => event.type === type && event.target === UiTarget.clickToPaySignupConsentToggle);

        test('should send a displayed event when rendered', () => {
            const onSubmitAnalytics = jest.fn();
            renderSignup({ onSubmitAnalytics });

            expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
            expect(onSubmitAnalytics).toHaveBeenCalledWith(
                expect.objectContaining({
                    component: 'scheme',
                    type: InfoEventType.displayed,
                    target: UiTarget.clickToPaySignupConsentToggle,
                    brand: 'mc'
                })
            );
        });

        test('should not send another displayed event when re-rendered while visible', async () => {
            const user = userEvent.setup();
            const onSubmitAnalytics = jest.fn();
            renderSignup({ defaultChecked: true, firstName: 'Jane', onSubmitAnalytics });

            await user.type(screen.getByRole('textbox', { name: 'Last name' }), 'Doe');

            expect(getSignupEvents(onSubmitAnalytics, InfoEventType.displayed)).toHaveLength(1);
        });

        test('should send a clicked event with the new consent value when the consent is toggled', async () => {
            const user = userEvent.setup();
            const onSubmitAnalytics = jest.fn();
            renderSignup({ onSubmitAnalytics });

            await user.click(getConsentCheckbox());
            await user.click(getConsentCheckbox());

            const clickedEvents = getSignupEvents(onSubmitAnalytics, InfoEventType.clicked);
            expect(clickedEvents).toHaveLength(2);
            expect(clickedEvents[0][0]).toEqual(
                expect.objectContaining({
                    component: 'scheme',
                    type: InfoEventType.clicked,
                    target: UiTarget.clickToPaySignupConsentToggle,
                    brand: 'mc',
                    selectedValue: 'checked'
                })
            );
            expect(clickedEvents[1][0]).toEqual(expect.objectContaining({ selectedValue: 'unchecked' }));
        });

        test('should not send a clicked event when the Click to Pay info dialog is opened', async () => {
            const user = userEvent.setup();
            const onSubmitAnalytics = jest.fn();
            renderSignup({ onSubmitAnalytics });

            await user.click(screen.getByRole('button', { name: 'Click to Pay' }));

            expect(getSignupEvents(onSubmitAnalytics, InfoEventType.clicked)).toHaveLength(0);
        });
    });
});

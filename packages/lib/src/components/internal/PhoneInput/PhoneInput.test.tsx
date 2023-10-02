import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';
import CoreProvider from '../../../core/Context/CoreProvider';
import { Resources } from '../../../core/Context/Resources';
import PhoneInput from './PhoneInput';

describe('PhoneInput', () => {
    const items = [{ id: '+7', name: 'Russian Federation', code: 'RU' }];
    const customRender = ui => {
        return render(
            // @ts-ignore ignore
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={new Resources()}>
                {ui}
            </CoreProvider>
        );
    };

    test('should render Prefix', async () => {
        customRender(<PhoneInput items={items} requiredFields={['phonePrefix']} data={undefined} onChange={() => {}} />);
        expect(await screen.findByText('Prefix')).toBeTruthy();
    });

    test('should render Telephone number', async () => {
        customRender(<PhoneInput items={[]} requiredFields={['phoneNumber']} data={undefined} onChange={() => {}} />);
        expect(await screen.findByText('Telephone number')).toBeTruthy();
    });

    test('should show error message for an invalid telephone number', async () => {
        customRender(<PhoneInput items={[]} phoneNumberErrorKey={'mobileNumber.invalid'} data={undefined} onChange={() => {}} />);
        const input = await screen.findByLabelText('Telephone number');
        fireEvent.blur(input, { target: { value: 1 } });
        expect(await screen.findByText('Invalid mobile number')).toBeTruthy();
    });
});

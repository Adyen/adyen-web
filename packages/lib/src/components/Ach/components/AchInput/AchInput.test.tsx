/** @tsx h */
import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import AchInput from './AchInput';
import { Resources } from '../../../../core/Context/Resources';
import CoreProvider from '../../../../core/Context/CoreProvider';

jest.mock('../../../internal/SecuredFields/lib/CSF');

describe('AchInput', () => {
    const withCoreProvider = ui => {
        return render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={new Resources()}>
                {ui}
            </CoreProvider>
        );
    };
    test('should render IbanInput by default', async () => {
        withCoreProvider(<AchInput enableStoreDetails={false} resources={new Resources()} />);
        expect(await screen.findByText(/account holder/i)).toBeTruthy();
        expect(await screen.findByText(/account number/i)).toBeTruthy();
        expect(await screen.findByText(/aba routing number/i)).toBeTruthy();
    });

    test('should render FormInstruction by default', async () => {
        withCoreProvider(<AchInput enableStoreDetails={false} resources={new Resources()} />);
        expect(await screen.findByText(/all fields are required unless marked otherwise./i)).toBeTruthy();
    });

    test('should render StoreDetails when enabled', async () => {
        withCoreProvider(<AchInput enableStoreDetails={true} resources={new Resources()} />);
        expect(await screen.findByText(/save for my next payment/i)).toBeTruthy();
    });

    test('should render a pay button', async () => {
        withCoreProvider(
            <AchInput enableStoreDetails={false} resources={new Resources()} showPayButton payButton={() => <button>test pay button</button>} />
        );
        expect(await screen.findByText(/test pay button/i)).toBeTruthy();
    });

    test('should show checking and savings selector', async () => {
        withCoreProvider(<AchInput enableStoreDetails={false} resources={global.resources} />);
        expect(await screen.findByText(/Checking/i)).toBeTruthy();
    });
});

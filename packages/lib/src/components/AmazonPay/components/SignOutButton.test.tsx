import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import SignOutButton from './SignOutButton';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AmazonWindowObject } from '../types';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();

const mockAmazonRef: AmazonWindowObject = {
    Pay: {
        renderButton: jest.fn().mockReturnValue({ onClick: jest.fn() }),
        initCheckout: jest.fn(),
        signout: jest.fn(),
        bindChangeAction: jest.fn()
    }
};

const renderSignOutButton = (props = {}) => {
    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <SignOutButton amazonRef={mockAmazonRef} onSignOut={resolve => Promise.resolve(resolve())} {...props} />
        </CoreProvider>
    );
};

describe('SignOutButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render a sign out button', () => {
        renderSignOutButton();
        expect(screen.getByRole('button', { name: 'Sign out from Amazon' })).toBeInTheDocument();
    });

    test('should call amazonRef.Pay.signout when clicked and onSignOut resolves', async () => {
        const user = userEvent.setup();
        renderSignOutButton();

        await user.click(screen.getByRole('button', { name: 'Sign out from Amazon' }));

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(mockAmazonRef.Pay.signout).toHaveBeenCalledTimes(1);
    });

    test('should not call signout if onSignOut rejects', async () => {
        const user = userEvent.setup();
        renderSignOutButton({
            onSignOut: (_resolve: (value?: unknown) => void, reject: () => void) => {
                reject();
                return Promise.resolve();
            }
        });

        jest.spyOn(console, 'error').mockImplementation(() => {});
        await user.click(screen.getByRole('button', { name: 'Sign out from Amazon' }));

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(mockAmazonRef.Pay.signout).not.toHaveBeenCalled();
    });
});

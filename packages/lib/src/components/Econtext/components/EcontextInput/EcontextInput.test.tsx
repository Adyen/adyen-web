import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import EcontextInput from './EcontextInput';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';

const requiredPropsFromUiElement = {
    showPayButton: false,
    setComponentRef: jest.fn()
};

const core = setupCoreMock();

describe('Econtext: EcontextInput', () => {
    test('renders PersonalDetails form by default', () => {
        render(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    payButton={() => <button>Continue purchase</button>}
                />
            </CoreProvider>
        );
        expect(screen.getByLabelText('First name')).toBeInTheDocument();
    });

    test('hide PersonalDetails form if prop personalDetailsRequired is set to false', () => {
        render(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    personalDetailsRequired={false}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    payButton={() => <button>Continue purchase</button>}
                />
            </CoreProvider>
        );
        expect(screen.queryByLabelText('First name')).not.toBeInTheDocument();
    });

    test('hide PayButton if showPayButton is set to false', () => {
        render(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    personalDetailsRequired={false}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    showPayButton={false}
                    payButton={() => <button>Continue purchase</button>}
                />
            </CoreProvider>
        );
        expect(screen.queryByRole('button', { name: 'Continue purchase' })).not.toBeInTheDocument();
    });

    test('hide form instruction if personalDetailsRequired sets to false', () => {
        render(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    personalDetailsRequired={false}
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    payButton={() => <button>Continue purchase</button>}
                />
            </CoreProvider>
        );
        expect(screen.queryByText('All fields are required unless marked otherwise.')).not.toBeInTheDocument();
    });

    test('show form instruction if personalDetailsRequired is set to true', () => {
        render(
            <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
                <EcontextInput
                    {...requiredPropsFromUiElement}
                    personalDetailsRequired
                    onChange={jest.fn()}
                    onSubmit={jest.fn()}
                    payButton={() => <button>Continue purchase</button>}
                />
            </CoreProvider>
        );
        expect(screen.getByText('All fields are required unless marked otherwise.')).toBeInTheDocument();
    });
});

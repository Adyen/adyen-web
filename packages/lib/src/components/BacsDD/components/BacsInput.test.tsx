import { createRef, h } from 'preact';
import { render, screen, act } from '@testing-library/preact';
import BacsInput from './BacsInput';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../core/Context/AmountProvider';

const defaultProps = {
    onChange: () => {},
    onSubmit: () => {}
};

const renderBacsInput = (props = {}) => {
    const bacsRef = createRef();
    render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <AmountProvider amount={{ currency: 'EUR', value: 1234 }} providerRef={createRef()}>
                {/* @ts-ignore ref is internal from the Component */}
                <BacsInput ref={bacsRef} {...defaultProps} {...props} />
            </AmountProvider>
        </CoreProvider>
    );
    return { bacsRef };
};

describe('BacsInput', () => {
    test('Should display expected fields for opening (enter-data) state', () => {
        renderBacsInput({});

        expect(screen.getByLabelText('Bank account holder name')).toBeInTheDocument();
        expect(screen.getByLabelText('Bank account number')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort code')).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
        expect(screen.getByLabelText('I agree that the above amount will be deducted from my bank account.')).toBeInTheDocument();
        expect(
            screen.getByLabelText(
                'I confirm the account is in my name and I am the only signatory required to authorise the Direct Debit on this account.'
            )
        );
    });

    test('Should display expected fields for second (confirm-data) state', () => {
        const { bacsRef } = renderBacsInput({});

        void act(() => {
            bacsRef.current.setStatus('confirm-data');
        });

        expect(screen.getByLabelText('Bank account holder name')).toHaveAttribute('readonly');
        expect(screen.getByLabelText('Bank account number')).toHaveAttribute('readonly');
        expect(screen.getByLabelText('Sort code')).toHaveAttribute('readonly');
        expect(screen.getByLabelText('Email address')).toHaveAttribute('readonly');

        expect(screen.queryByLabelText('I agree that the above amount will be deducted from my bank account.')).not.toBeInTheDocument();
        expect(
            screen.queryByLabelText(
                'I confirm the account is in my name and I am the only signatory required to authorise the Direct Debit on this account.'
            )
        ).not.toBeInTheDocument();
    });
});

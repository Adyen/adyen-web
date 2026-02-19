import { h } from 'preact';
import { useRef } from 'preact/hooks';
import { render, waitFor } from '@testing-library/preact';
import useSRPanelForCardInputErrors from './useSRPanelForCardInputErrors';
import { ERROR_ACTION_BLUR_SCENARIO, ERROR_ACTION_FOCUS_FIELD, SF_ErrorCodes } from '../../../../core/Errors/constants';

const setSRMessagesInnerMock = jest.fn();
const setSRMessagesFromObjectsMock = jest.fn(() => setSRMessagesInnerMock);
const setSRMessagesFromStringsMock = jest.fn();
const clearSRPanelMock = jest.fn();

let shouldMoveFocusSRValue = true;

jest.mock('../../../../core/Errors/useSRPanelContext', () => ({
    __esModule: true,
    default: () => ({
        setSRMessagesFromObjects: setSRMessagesFromObjectsMock,
        setSRMessagesFromStrings: setSRMessagesFromStringsMock,
        clearSRPanel: clearSRPanelMock,
        shouldMoveFocusSR: shouldMoveFocusSRValue
    })
}));

const setFocusOnFirstFieldMock = jest.fn();
jest.mock('./handlers', () => ({
    setFocusOnFirstField: (...args) => setFocusOnFirstFieldMock(...args)
}));

interface HarnessProps {
    errors: any;
    isValidatingRef?: { current: boolean };
}

const Harness = ({ errors, isValidatingRef }: HarnessProps) => {
    const internalRef = useRef(true);
    const isValidating = isValidatingRef ?? internalRef;

    useSRPanelForCardInputErrors({
        errors,
        props: { billingAddressMode: 'full' },
        isValidating,
        retrieveLayout: () => ['encryptedCardNumber', 'holderName', 'postalCode'],
        specifications: { getAddressLabelsForCountry: jest.fn(() => null) },
        billingAddress: { country: 'NL' },
        sfp: {
            current: {
                mapErrorsToValidationRuleResult: jest.fn(() => ({}))
            }
        }
    });

    return <div data-testid="harness" />;
};

describe('useSRPanelForCardInputErrors', () => {
    beforeEach(() => {
        jest.useRealTimers();
        shouldMoveFocusSRValue = true;

        setSRMessagesInnerMock.mockReset();
        setSRMessagesFromObjectsMock.mockClear();
        setSRMessagesFromStringsMock.mockClear();
        clearSRPanelMock.mockClear();
        setFocusOnFirstFieldMock.mockClear();
    });

    test('flattens billingAddress errors and passes merged errors to SRPanel partial', async () => {
        setSRMessagesInnerMock.mockReturnValue({
            action: null,
            fieldToFocus: null,
            currentErrorsSortedByLayout: []
        });

        const errors = {
            holderName: { errorMessage: 'Name is required', errorCode: 'name_error' },
            billingAddress: {
                postalCode: { errorMessage: 'Postal code is required', errorCode: 'postal_error' }
            }
        };

        render(<Harness errors={errors} />);

        await waitFor(() => expect(setSRMessagesInnerMock).toHaveBeenCalledTimes(1));

        const callArg = setSRMessagesInnerMock.mock.calls[0][0];
        expect(callArg.errors).toEqual({
            holderName: errors.holderName,
            postalCode: errors.billingAddress.postalCode
        });
    });

    test('when SRPanel returns focus action, it focuses first field and turns off isValidating after timeout', async () => {
        jest.useFakeTimers();

        const isValidatingRef = { current: true };

        setSRMessagesInnerMock.mockReturnValue({
            action: ERROR_ACTION_FOCUS_FIELD,
            fieldToFocus: 'holderName',
            currentErrorsSortedByLayout: []
        });

        const errors = { holderName: { errorMessage: 'Name is required', errorCode: 'name_error' } };

        render(<Harness errors={errors} isValidatingRef={isValidatingRef} />);

        await waitFor(() => expect(setFocusOnFirstFieldMock).toHaveBeenCalledTimes(1));
        expect(setFocusOnFirstFieldMock.mock.calls[0][0]).toBe(true);
        expect(setFocusOnFirstFieldMock.mock.calls[0][2]).toBe('holderName');

        expect(isValidatingRef.current).toBe(true);
        jest.advanceTimersByTime(300);
        expect(isValidatingRef.current).toBe(false);

        jest.useRealTimers();
    });

    test('when shouldMoveFocusSR is false, it does not move focus even if SRPanel requests it', async () => {
        shouldMoveFocusSRValue = false;

        setSRMessagesInnerMock.mockReturnValue({
            action: ERROR_ACTION_FOCUS_FIELD,
            fieldToFocus: 'holderName',
            currentErrorsSortedByLayout: []
        });

        render(<Harness errors={{ holderName: { errorMessage: 'Name is required', errorCode: 'name_error' } }} />);

        await waitFor(() => expect(setSRMessagesInnerMock).toHaveBeenCalledTimes(1));
        expect(setFocusOnFirstFieldMock).not.toHaveBeenCalled();
    });

    test('in blur scenario, it sets SRPanel message for new blur-based error', async () => {
        setSRMessagesInnerMock.mockReturnValueOnce({ action: null, fieldToFocus: null, currentErrorsSortedByLayout: [] }).mockReturnValueOnce({
            action: ERROR_ACTION_BLUR_SCENARIO,
            fieldToFocus: null,
            currentErrorsSortedByLayout: [
                {
                    field: 'holderName',
                    errorMessage: 'Name is required',
                    errorCode: 'name_error'
                }
            ]
        });

        const { rerender } = render(<Harness errors={{}} />);

        await waitFor(() => expect(setSRMessagesInnerMock).toHaveBeenCalledTimes(1));

        rerender(<Harness errors={{ holderName: { errorMessage: 'Name is required', errorCode: 'name_error' } }} />);

        await waitFor(() => expect(setSRMessagesFromStringsMock).toHaveBeenCalledTimes(1));
        expect(setSRMessagesFromStringsMock).toHaveBeenCalledWith('Name is required');
    });

    test('in blur scenario, it does not set SRPanel message for non blur-based error', async () => {
        setSRMessagesInnerMock.mockReturnValueOnce({ action: null, fieldToFocus: null, currentErrorsSortedByLayout: [] }).mockReturnValueOnce({
            action: ERROR_ACTION_BLUR_SCENARIO,
            fieldToFocus: null,
            currentErrorsSortedByLayout: [
                {
                    field: 'encryptedCardNumber',
                    errorMessage: 'Unsupported card',
                    errorCode: SF_ErrorCodes.ERROR_MSG_UNSUPPORTED_CARD_ENTERED
                }
            ]
        });

        const { rerender } = render(<Harness errors={{}} />);
        await waitFor(() => expect(setSRMessagesInnerMock).toHaveBeenCalledTimes(1));

        rerender(
            <Harness
                errors={{ encryptedCardNumber: { errorMessage: 'Unsupported card', errorCode: SF_ErrorCodes.ERROR_MSG_UNSUPPORTED_CARD_ENTERED } }}
            />
        );

        await waitFor(() => expect(setSRMessagesFromStringsMock).toHaveBeenCalledTimes(1));
        expect(setSRMessagesFromStringsMock).toHaveBeenCalledWith(null);
    });

    test('in blur scenario, it clears SRPanel when errors are removed', async () => {
        setSRMessagesInnerMock
            .mockReturnValueOnce({
                action: ERROR_ACTION_BLUR_SCENARIO,
                fieldToFocus: null,
                currentErrorsSortedByLayout: [
                    {
                        field: 'holderName',
                        errorMessage: 'Name is required',
                        errorCode: 'name_error'
                    }
                ]
            })
            .mockReturnValueOnce({ action: ERROR_ACTION_BLUR_SCENARIO, fieldToFocus: null, currentErrorsSortedByLayout: [] });

        const { rerender } = render(<Harness errors={{ holderName: { errorMessage: 'Name is required', errorCode: 'name_error' } }} />);
        await waitFor(() => expect(setSRMessagesInnerMock).toHaveBeenCalledTimes(1));

        rerender(<Harness errors={{}} />);

        await waitFor(() => expect(clearSRPanelMock).toHaveBeenCalledTimes(1));
    });
});

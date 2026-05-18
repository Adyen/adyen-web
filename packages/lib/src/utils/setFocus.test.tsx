import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import { setFocusOnField } from './setFocus';
import ua from '../components/internal/SecuredFields/lib/CSF/utils/userAgent';

test('setFocusOnField should focus on the specified field (with a label); and also call windowScrollTo for iOS scenarios', async () => {
    ua.__IS_IOS = true;

    const mockScrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

    // Render a form with a labeled text input and a dropdown
    render(
        <form>
            <label htmlFor="text-input">Text Input</label>
            <input type="text" id="text-input" name="text-input" />
            <label htmlFor="dropdown">Dropdown</label>
            <select id="dropdown" name="dropdown">
                <option value="option-1">Option 1</option>
                <option value="option-2">Option 2</option>
            </select>
        </form>
    );

    // Use setFocusOnField to set focus on the text input
    setFocusOnField('form', 'text-input');

    // Check that the text input is focused
    expect(screen.getByLabelText(/text input/i)).toHaveFocus();

    // Use setFocusOnField to set focus on the dropdown
    setFocusOnField('form', 'dropdown');

    // Check that the dropdown is focused
    expect(screen.getByLabelText(/dropdown/i)).toHaveFocus();

    await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: -100 });
    });

    mockScrollTo.mockRestore();
});

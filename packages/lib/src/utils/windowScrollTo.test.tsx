import { h } from 'preact';
import { windowScrollTo } from './windowScrollTo';
import { render, screen, waitFor } from '@testing-library/preact';

describe('windowScrollTo', () => {
    test('When called with an element, it should scroll to that element', async () => {
        const mockScrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

        const divId = 'test-div';
        render(<div id={divId} style={{ height: '1000px' }} data-testid={divId} />);

        const testDiv = screen.getByTestId(divId);
        windowScrollTo(testDiv);

        await waitFor(() => {
            expect(mockScrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: -100 });
        });

        mockScrollTo.mockRestore();
    });
});

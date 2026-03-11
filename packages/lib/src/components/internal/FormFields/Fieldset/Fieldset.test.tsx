import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import Fieldset from './Fieldset';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

describe('Fieldset', () => {
    const renderFieldset = props =>
        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <Fieldset {...props} />
            </CoreProvider>
        );

    test('shows a label', () => {
        const label = 'Test ABC';
        renderFieldset({ label });
        const legend = screen.getByText(label);
        expect(legend).toBeTruthy();
        expect(legend.className).toContain('adyen-checkout__fieldset__title');
    });

    test('shows no label', () => {
        const { container } = renderFieldset({});
        /* eslint-disable testing-library/no-node-access */
        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.adyen-checkout__fieldset__title')).toBeNull();
        /* eslint-enable testing-library/no-node-access */
    });
});

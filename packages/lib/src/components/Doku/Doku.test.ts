import { render, screen } from '@testing-library/preact';
import Doku from './Doku';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('Doku', () => {
    test('should show reference when reference is provided', () => {
        const core = setupCoreMock();

        const doku = new Doku(core, {
            loadingContext: 'test',
            i18n: global.i18n,
            modules: { resources: global.resources, srPanel: core.modules.srPanel }
        });

        render(doku.render());

        expect(screen.getByText('All fields are required unless marked otherwise.')).toBeInTheDocument();
        expect(screen.getByLabelText('First name')).toBeInTheDocument();
        expect(screen.getByLabelText('Last name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirm purchase' })).toBeInTheDocument();
    });

    test('does not show confirm purchase button when showPayButton is false', () => {
        const core = setupCoreMock();

        const doku = new Doku(core, {
            loadingContext: 'test',
            i18n: global.i18n,
            modules: { resources: global.resources, srPanel: core.modules.srPanel },
            showPayButton: false
        });

        render(doku.render());

        expect(screen.queryByRole('button', { name: 'Confirm purchase' })).not.toBeInTheDocument();
    });
});

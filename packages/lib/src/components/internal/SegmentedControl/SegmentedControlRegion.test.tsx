import { h } from 'preact';
import { render, screen } from '@testing-library/preact';

import { SegmentedControlRegion } from './SegmentedControlRegion';

describe('SegmentedControlRegion', () => {
    test('should render with role="tabpanel"', () => {
        render(
            <SegmentedControlRegion id="panel-1" ariaLabelledBy="tab-1">
                <span>Panel content</span>
            </SegmentedControlRegion>
        );
        expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    test('should set id attribute', () => {
        render(
            <SegmentedControlRegion id="panel-1" ariaLabelledBy="tab-1">
                <span>Panel content</span>
            </SegmentedControlRegion>
        );
        expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'panel-1');
    });

    test('should set aria-labelledby linking to tab id', () => {
        render(
            <SegmentedControlRegion id="panel-1" ariaLabelledBy="tab-1">
                <span>Panel content</span>
            </SegmentedControlRegion>
        );
        expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'tab-1');
    });

    test('should render children', () => {
        render(
            <SegmentedControlRegion id="panel-1" ariaLabelledBy="tab-1">
                <span>Visible content</span>
            </SegmentedControlRegion>
        );
        expect(screen.getByText('Visible content')).toBeInTheDocument();
    });
});

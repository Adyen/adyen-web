import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { useEffect } from 'preact/hooks';
import { SingletonTooltipProvider, useTooltip } from './SingletonTooltipProvider';
import { TooltipController } from './TooltipController';
import { TooltipProps } from './types';

jest.mock('./Tooltip', () => ({
    Tooltip: ({ text }: TooltipProps) => <div data-testid="tooltip">{text}</div>
}));

beforeEach(() => {
    (TooltipController as any).registered = false;
});

describe('SingletonTooltipProvider', () => {
    it('provides context and allows using useTooltip()', async () => {
        jest.useFakeTimers();

        const TestComponent = () => {
            const { showTooltip } = useTooltip();

            useEffect(() => {
                showTooltip({ text: 'Hello Tooltip' });
            }, []);

            return <div>Using Tooltip</div>;
        };

        render(
            <SingletonTooltipProvider>
                <TestComponent />
            </SingletonTooltipProvider>
        );

        jest.runAllTimers();

        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        expect((await screen.findByTestId('tooltip')).textContent).toBe('Hello Tooltip');
    });

    it('only renders Tooltip for the first provider', () => {
        const Component = () => <div>Scoped Consumer</div>;
        render(
            <SingletonTooltipProvider>
                <Component />
            </SingletonTooltipProvider>
        );
        render(
            <SingletonTooltipProvider>
                <Component />
            </SingletonTooltipProvider>
        );

        expect(screen.getAllByTestId('tooltip')).toHaveLength(1);
    });

    it('throws if useTooltip is used outside of a provider', () => {
        const BrokenComponent = () => {
            useTooltip();
            return <div>Oops</div>;
        };

        expect(() => render(<BrokenComponent />)).toThrow('useTooltip must be used within a TooltipProvider');
    });
});

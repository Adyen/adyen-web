import { Meta, StoryObj } from '@storybook/preact';
import { useRef } from 'preact/hooks';
import { Tooltip } from '../../../src/components/internal/Tooltip';
import { TooltipProvider, useTooltip } from '../../../src/components/internal/Tooltip/TooltipProvider';

const meta: Meta = {
    title: 'Internals/Tooltip',
    component: Tooltip,
    argTypes: {
        margin: {
            control: { type: 'range', min: 0, max: 500, step: 10 }
        }
    }
};

const TooltipConsumer = ({ anchorRef, margin }: { anchorRef: any; margin: number }) => {
    const { id: tooltipId, showTooltip, hideTooltip } = useTooltip();

    return (
        <button
            ref={anchorRef}
            style={{ margin: `${margin}px` }}
            aria-describedby={tooltipId}
            onMouseEnter={() => showTooltip({ text: 'tooltip text', anchorRef })}
            onMouseLeave={() => hideTooltip()}
        >
            Hover me
        </button>
    );
};

export const Default: StoryObj = {
    render: args => {
        const anchorRef = useRef<HTMLButtonElement>(null);

        return (
            <>
                <TooltipProvider>
                    <TooltipConsumer anchorRef={anchorRef} margin={args.margin} />
                </TooltipProvider>
            </>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: { margin: 0 }
};

export default meta;

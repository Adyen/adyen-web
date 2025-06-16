import { Meta, StoryObj } from '@storybook/preact';
import { Tooltip } from '../../../src/components/internal/Tooltip';
import { useTooltip } from '../../../src/components/internal/Tooltip/useTooltip';

const meta: Meta = {
    title: 'Internals/Tooltip',
    component: Tooltip,
    argTypes: {
        margin: {
            control: { type: 'range', min: 0, max: 500, step: 10 }
        }
    }
};

export const Default: StoryObj = {
    render: args => {
        const { anchorRef, visible, showTooltip, hideTooltip } = useTooltip<HTMLButtonElement>(100);
        const tooltipId = 'tooltip-id';

        return (
            <>
                <button
                    style={{ margin: `${args.margin}px` }}
                    ref={anchorRef}
                    aria-describedby={tooltipId}
                    onMouseEnter={() => showTooltip()}
                    onMouseLeave={() => hideTooltip()}
                >
                    Hover me
                </button>
                <Tooltip text={'I am the tooltip'} anchorRef={anchorRef} id={tooltipId} visible={visible} {...args} />
            </>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: { margin: 0 }
};

export default meta;

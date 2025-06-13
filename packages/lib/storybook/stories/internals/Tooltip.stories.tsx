import { Meta, StoryObj } from '@storybook/preact';
import { Tooltip } from '../../../src/components/internal/Tooltip';
import { useTooltip } from '../../../src/components/internal/Tooltip/useTooltip';

const meta: Meta = {
    title: 'Internals/Tooltip',
    component: Tooltip,
    argTypes: {
        top: {
            control: { type: 'range', min: 0, max: 500, step: 10 }
        }
    }
};

export const Default: StoryObj = {
    render: args => {
        const { anchorRef, visible, show, hide } = useTooltip();
        const tooltipId = 'tooltip-id';

        return (
            <div style={{ position: 'relative', display: 'inline-block', top: `${args.top}px` }}>
                <button ref={anchorRef} aria-describedby={tooltipId} onMouseEnter={() => show()} onMouseLeave={() => hide()}>
                    Hover me
                </button>
                <Tooltip text={'I am the tooltip'} anchorRef={anchorRef} id={tooltipId} visible={visible} {...args} />
            </div>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: { top: 0 }
};

export default meta;

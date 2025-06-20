import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { Tooltip } from './Tooltip';

let intersectionCallback: any;

beforeAll(() => {
    global.IntersectionObserver = class {
        constructor(cb: any) {
            intersectionCallback = cb;
        }
        // eslint-disable-next-line
        observe = jest.fn();
        // eslint-disable-next-line
        disconnect = jest.fn();
    } as any;
});

afterEach(() => {
    jest.clearAllMocks();
});

const mockAnchorRect = {
    top: 100,
    bottom: 120,
    left: 50,
    width: 100,
    height: 20,
    right: 150
};

function createAnchorRef() {
    const anchor = document.createElement('div');
    anchor.getBoundingClientRect = jest.fn(() => mockAnchorRect as DOMRect);
    document.body.appendChild(anchor);
    return { current: anchor };
}

it('renders tooltip text when visible', () => {
    const anchorRef = createAnchorRef();
    render(<Tooltip id="tooltip-id" text="Test tooltip" visible={true} anchorRef={anchorRef} />);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Test tooltip');
});

it('applies correct position class', () => {
    const anchorRef = createAnchorRef();
    render(<Tooltip id="tooltip-id" text="Tooltip with position" visible={true} anchorRef={anchorRef} />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('adyen-checkout-tooltip--top');
});

it('applies bottom position class if not enough space above', () => {
    const anchorRef = createAnchorRef();
    // Simulate anchor near the top (no space above, space below)
    anchorRef.current.getBoundingClientRect = jest.fn(() => ({
        top: 0,
        bottom: 30,
        left: 100,
        width: 100,
        height: 20,
        right: 200,
        x: 0,
        y: 0,
        toJSON: () => {}
    }));
    render(<Tooltip id="tooltip-id" text="Tooltip with position" visible={true} anchorRef={anchorRef} />);
    const tooltip = screen.getByRole('tooltip');
    Object.defineProperty(tooltip, 'offsetHeight', {
        value: 40,
        configurable: true
    });
    // Trigger reposition logic again
    window.dispatchEvent(new Event('resize'));
    expect(tooltip.className).toContain('adyen-checkout-tooltip--bottom');
});

it('hides if anchor is not intersecting', async () => {
    const anchorRef = createAnchorRef();
    render(<Tooltip id="tooltip-id" text="Tooltip intersection" visible={true} anchorRef={anchorRef} />);
    // Simulate anchor becoming not visible
    intersectionCallback([{ isIntersecting: false }]);
    const tooltip = screen.getByRole('tooltip');
    await waitFor(() => expect(tooltip).toHaveClass('adyen-checkout-tooltip--hidden'));
});

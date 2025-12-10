import { h } from 'preact';

export interface SegmentedControlRegionProps {
    id: string;
    ariaLabelledBy: string;
    className?: string;
    children: h.JSX.Element | h.JSX.Element[];
}

export const SegmentedControlRegion = ({ id, ariaLabelledBy, className, children }: SegmentedControlRegionProps) => {
    return (
        <section id={id} aria-labelledby={ariaLabelledBy} className={className}>
            {children}
        </section>
    );
};

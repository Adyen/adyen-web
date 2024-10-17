import { h } from 'preact';
import './TimelineWrapper.scss';

const TimelineWrapper = ({ children }) => {
    return <div className="adyen-checkout-timeline-wrapper">{children}</div>;
};

export { TimelineWrapper };

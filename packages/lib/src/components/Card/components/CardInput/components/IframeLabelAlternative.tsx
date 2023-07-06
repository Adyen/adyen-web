import { h } from 'preact';

export const alternativeLabelContent = (defaultWrapperProps, children) => {
    return (
        <div {...defaultWrapperProps} aria-hidden={'true'}>
            {children}
        </div>
    );
};

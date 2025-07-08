import { createContext, h, ComponentChildren } from 'preact';
import { useState, useEffect, useContext, useRef, useMemo } from 'preact/hooks';
import { Tooltip } from './Tooltip';
import { TooltipProps } from './types';
import { TooltipController } from './TooltipController';

type TooltipContextValue = {
    id: string;
    showTooltip: (state?: TooltipProps) => void;
    hideTooltip: () => void;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

const SingletonTooltipProvider = ({ children }: { children?: ComponentChildren }) => {
    const [tooltipProps, setTooltipProps] = useState<TooltipProps | null>(null);
    const tooltipId = useRef(TooltipController.tooltipId);
    /**
     * We use `useRef` instead of `useState` to avoid triggering the `useEffect` again
     * (which would happen if `isPrimary` were a state value in the `useEffect` dependency list).
     * Because we need `TooltipController.onPrimaryReset` to add an event listener ONCE, we don't want
     * to re-run `useEffect` and register it again on every state update.
     *
     * However, we do need a way to re-render, hence added `forceUpdate`.
     */
    const isPrimaryInstanceRef = useRef(false);
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const tryRegister = () => {
            if (TooltipController.canRegisterTooltipHandler()) {
                TooltipController.registerTooltipHandler(setTooltipProps);
                isPrimaryInstanceRef.current = true;
                forceUpdate(r => r + 1);
            } else {
                isPrimaryInstanceRef.current = false;
                forceUpdate(r => r + 1);
            }
        };

        tryRegister();

        const unsubscribe = TooltipController.onPrimaryReset(() => {
            tryRegister();
        });

        return () => {
            // When the primary instance is unmounted, the only tooltip component is gone.
            // So we need to notify other instances, one of the instances should
            // become the primary instance to mount the tooltip component again.
            unsubscribe();
            if (isPrimaryInstanceRef.current) {
                TooltipController.reset();
            }
        };
    }, []);

    const contextValue = useMemo(
        () => ({
            showTooltip: (state?: TooltipProps) => TooltipController.showTooltip(state),
            hideTooltip: (state?: TooltipProps) => TooltipController.hideTooltip(state),
            id: tooltipId.current
        }),
        []
    );

    return (
        <TooltipContext.Provider value={contextValue}>
            {children}
            {isPrimaryInstanceRef.current && <Tooltip id={tooltipId.current} {...tooltipProps} />}
        </TooltipContext.Provider>
    );
};

const useTooltip = () => {
    const ctx = useContext(TooltipContext);
    if (!ctx) {
        throw new Error('useTooltip must be used within a TooltipProvider');
    }
    return ctx;
};

export { SingletonTooltipProvider, useTooltip };

import { createContext, h, ComponentChildren } from 'preact';
import { useState, useEffect, useContext, useRef } from 'preact/hooks';
import { Tooltip } from './Tooltip';
import { TooltipProps } from './types';
import { TooltipController } from './TooltipController';

type TooltipContextValue = {
    id: string;
    showTooltip: (state: TooltipProps) => void;
    hideTooltip: () => void;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

const TooltipProvider = ({ children }: { children?: ComponentChildren }) => {
    const [tooltipProps, setTooltipProps] = useState<TooltipProps | null>(null);
    const showTooltip = (state: TooltipProps) => TooltipController.showTooltip(state);
    const hideTooltip = () => TooltipController.hideTooltip();
    const tooltipId = useRef(TooltipController.getTooltipId());

    useEffect(() => {
        TooltipController.registerTooltipUpdater(setTooltipProps);
        return () => {
            TooltipController.unregister();
        };
    }, []);

    return (
        <TooltipContext.Provider value={{ showTooltip, hideTooltip, id: tooltipId.current }}>
            {children}
            {TooltipController.isRegistered() && <Tooltip id={tooltipId.current} {...tooltipProps} />}
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

export { TooltipProvider, useTooltip };

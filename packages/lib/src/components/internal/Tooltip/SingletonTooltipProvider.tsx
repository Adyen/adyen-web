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

const SingletonTooltipProvider = ({ children }: { children?: ComponentChildren }) => {
    const [tooltipProps, setTooltipProps] = useState<TooltipProps | null>(null);
    const tooltipId = useRef(TooltipController.tooltipId);
    const [isPrimaryInstance, setIsPrimaryInstance] = useState(false);

    const showTooltip = (state: TooltipProps) => TooltipController.showTooltip(state);
    const hideTooltip = () => TooltipController.hideTooltip();

    useEffect(() => {
        if (TooltipController.canRegisterTooltipHandler()) {
            TooltipController.registerTooltipHandler(setTooltipProps);
            setIsPrimaryInstance(true);
        }
    }, []);

    return (
        <TooltipContext.Provider value={{ showTooltip, hideTooltip, id: tooltipId.current }}>
            {children}
            {isPrimaryInstance && <Tooltip id={tooltipId.current} {...tooltipProps} />}
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

import ClickToPayProvider, { ClickToPayProviderProps } from '../../internal/ClickToPay/context/ClickToPayProvider';
import ClickToPayHolder, { ClickToPayHolderProps } from './ClickToPayHolder';
import { h } from 'preact';

type ClickToPayWrapperProps = Omit<ClickToPayProviderProps, 'children'> & ClickToPayHolderProps;

const ClickToPayWrapper = ({ children, ...providerProps }: Readonly<ClickToPayWrapperProps>) => {
    return (
        <ClickToPayProvider {...providerProps}>
            <ClickToPayHolder>{children}</ClickToPayHolder>
        </ClickToPayProvider>
    );
};

export default ClickToPayWrapper;

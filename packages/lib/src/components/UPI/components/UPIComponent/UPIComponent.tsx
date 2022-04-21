import { h, Fragment, RefObject } from 'preact';
import { useRef } from 'preact/hooks';
import VpaInput from '../VpaInput';
import ContentSeparator from '../../../internal/ContentSeparator';
import Button from '../../../internal/Button';
import useCoreContext from '../../../../core/Context/useCoreContext';
import getImage from '../../../../utils/get-image';
import { PayButtonFunctionProps } from '../../../types';
import { VpaInputHandlers } from '../VpaInput/VpaInput';

interface UPIComponentProps {
    showPayButton?: boolean;
    payButton: (props: PayButtonFunctionProps) => h.JSX.Element;
    ref: (ref: RefObject<typeof UPIComponent>) => void;
    onChange: ({ data: VpaInputDataState, valid, errors, isValid: boolean }) => void;
    onSubmit(): void;
    onGenerateQrCodeClick(): void;
}

export default function UPIComponent({ onChange, onGenerateQrCodeClick, showPayButton, payButton }: UPIComponentProps): h.JSX.Element {
    const { i18n, loadingContext } = useCoreContext();
    const inputRef = useRef<VpaInputHandlers>(null);

    this.showValidation = () => {
        inputRef.current.validateInput();
    };

    return (
        <Fragment>
            <VpaInput ref={inputRef} onChange={onChange} />
            {showPayButton && payButton({ label: `${i18n.get('continue')}` })}
            <ContentSeparator label="or" />
            <Button
                icon={getImage({ loadingContext: loadingContext, imageFolder: 'components/' })('qr')}
                variant="secondary"
                label="Generate QR code"
                onClick={onGenerateQrCodeClick}
            />
        </Fragment>
    );
}

import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { EMIFundingSource, EMIOfferFormData } from './types';
import CardElement from '../Card';
import UPIElement from '../UPI';
import { SegmentedControl } from '../internal/SegmentedControl';
import useForm from '../../utils/useForm';

import type { PayButtonFunctionProps, ComponentMethodsRef, UIElementStatus } from '../internal/UIElement/types';
import type { ValidatorRules } from '../../utils/Validator/types';
import { useCoreContext } from '../../core/Context/CoreProvider';
import useImage from '../../core/Context/useImage';
import { PREFIX } from '../internal/Icon/constants';
import { EMIOfferForm } from './EMIOfferForm';

const schema = ['provider', 'discount', 'plan'];
const validationRules: ValidatorRules = {
    provider: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'Select a provider',
        modes: ['blur']
    },
    discount: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'Select a discount',
        modes: ['blur']
    },
    plan: {
        validate: value => !!value && value.length > 0,
        errorMessage: 'Select a plan',
        modes: ['blur']
    }
};

interface EMIComponentProps {
    defaultActiveFundingSource: EMIFundingSource;
    fundingSourceUIElements: Record<EMIFundingSource, CardElement | UPIElement>;
    onSetActiveFundingSource: (fundingSource: EMIFundingSource) => void;
    onSetOfferFormState: (data: EMIOfferFormData) => void;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    showPayButton: boolean;
    payButton: (props: PayButtonFunctionProps) => h.JSX.Element;
}

export const EMIComponent = ({
    defaultActiveFundingSource,
    fundingSourceUIElements,
    onSetActiveFundingSource,
    onSetOfferFormState,
    setComponentRef,
    showPayButton,
    payButton
}: Readonly<EMIComponentProps>) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [activeFundingSource, setActiveFundingSource] = useState<EMIFundingSource>(defaultActiveFundingSource);

    const { handleChangeFor, triggerValidation, data, errors } = useForm<EMIOfferFormData>({
        schema,
        rules: validationRules
    });

    const componentRef = useRef<ComponentMethodsRef>({
        showValidation: triggerValidation,
        setStatus
    });

    useEffect(() => {
        setComponentRef(componentRef.current);
    }, [setComponentRef]);

    useEffect(() => {
        onSetOfferFormState(data as EMIOfferFormData);
    }, [data]);

    const handleFundingSourceChange = (fundingSource: EMIFundingSource) => {
        setActiveFundingSource(fundingSource);
        onSetActiveFundingSource(fundingSource);
    };

    return (
        <div>
            <EMIOfferForm provider={data.provider} discount={data.discount} plan={data.plan} onFieldChange={handleChangeFor} errors={errors} />
            <SegmentedControl
                onChange={source => handleFundingSourceChange(source)}
                selectedValue={activeFundingSource}
                options={[
                    {
                        label: 'Card',
                        value: EMIFundingSource.CARD,
                        id: `${EMIFundingSource.CARD}-id`,
                        controls: `${EMIFundingSource.CARD}-control`
                    },
                    {
                        label: 'UPI',
                        value: EMIFundingSource.UPI,
                        id: `${EMIFundingSource.UPI}-id`,
                        controls: `${EMIFundingSource.UPI}-control`
                    }
                ]}
            />
            <div
                style={{
                    marginTop: 16
                }}
            >
                {fundingSourceUIElements[activeFundingSource].render()}
            </div>
            {showPayButton &&
                payButton({
                    label: activeFundingSource === EMIFundingSource.UPI ? i18n.get('generateQRCode') : undefined,
                    icon:
                        activeFundingSource === EMIFundingSource.UPI
                            ? getImage({ imageFolder: 'components/' })('qr')
                            : getImage({ imageFolder: 'components/' })(`${PREFIX}lock`),
                    status
                })}
        </div>
    );
};

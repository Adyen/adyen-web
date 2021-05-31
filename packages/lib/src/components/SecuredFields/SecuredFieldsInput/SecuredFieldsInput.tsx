import { h } from 'preact';
import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import Language from '../../../language/Language';
import SecuredFieldsProvider, { SFPState } from '../../internal/SecuredFields/SecuredFieldsProvider';
import { BinLookupResponse } from '../../Card/types';
import SFExtensions from '../../internal/SecuredFields/binLookup/extensions';

interface SecuredFieldsProps {
    onChange: (data) => void;
    i18n: Language;
}

const defaultProps = {
    onChange: () => {},
    onError: () => {}
};

function SecuredFieldsInput(props: SecuredFieldsProps) {
    const sfp = useRef(null);

    const [errors, setErrors] = useState({});
    const [valid, setValid] = useState({});
    const [data, setData] = useState({});

    const [isSfpValid, setIsSfpValid] = useState(false);

    const [issuingCountryCode, setIssuingCountryCode] = useState(null);

    const [dualBrandSelectElements, setDualBrandSelectElements] = useState([]);
    const [selectedBrandValue, setSelectedBrandValue] = useState('');

    const handleSecuredFieldsChange = (sfState: SFPState): void => {
        setData({ ...data, ...sfState.data });
        setErrors({ ...errors, ...sfState.errors });
        setValid({ ...valid, ...sfState.valid });

        setIsSfpValid(sfState.isSfpValid);
    };

    // Farm the handlers for binLookup related functionality out to another 'extensions' file
    const extensions = useMemo(
        () =>
            SFExtensions(
                props,
                { sfp },
                { dualBrandSelectElements, setDualBrandSelectElements, setSelectedBrandValue, issuingCountryCode, setIssuingCountryCode }
            ),
        [dualBrandSelectElements, issuingCountryCode]
    );

    /**
     * EXPECTED METHODS ON SecuredFields.this
     */
    this.processBinLookupResponse = (binLookupResponse: BinLookupResponse, isReset: boolean) => {
        extensions.processBinLookup(binLookupResponse, isReset);
    };

    this.dualBrandingChangeHandler = extensions.handleDualBrandSelection;

    /**
     * EFFECT HOOKS
     */
    useEffect(() => {
        // componentDidMount
        this.setFocusOn = sfp.current.setFocusOn;
        this.updateStyles = sfp.current.updateStyles;
        this.showValidation = sfp.current.showValidation;
        this.handleUnsupportedCard = sfp.current.handleUnsupportedCard;

        // componentWillUnmount
        return () => {
            sfp.current.destroy();
        };
    }, []);

    /**
     * Main 'componentDidUpdate' handler
     */
    useEffect(() => {
        props.onChange({
            data,
            valid,
            errors,
            isValid: isSfpValid,
            selectedBrandValue
        });
    }, [data, valid, errors, selectedBrandValue]);

    /**
     * RENDER
     */
    return <SecuredFieldsProvider ref={sfp} {...props} onChange={handleSecuredFieldsChange} render={() => null} />;
}

SecuredFieldsInput.defaultProps = defaultProps;

export default SecuredFieldsInput;

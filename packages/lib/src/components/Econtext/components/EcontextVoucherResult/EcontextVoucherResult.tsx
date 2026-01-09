import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import Voucher from '../../../internal/Voucher';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { EcontextVoucherResultProps } from '../../types';
import useImage from '../../../../core/Context/useImage';
import { extractCommonPropsForVoucher } from '../../../internal/Voucher/utils';

const EcontextVoucherResult = (props: EcontextVoucherResultProps) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const { expiresAt, maskedTelephoneNumber, instructionsUrl, collectionInstitutionNumber, alternativeReference, reference } = props;

    const hasAlternativeReference = Boolean(alternativeReference);

    const alternativeReferenceDetails = useMemo(
        () => [
            { label: i18n.get('voucher.collectionInstitutionNumber'), value: collectionInstitutionNumber },
            { label: i18n.get('econtext.customerNumber'), value: reference },
            { label: i18n.get('econtext.confirmationNumber'), value: alternativeReference },
            { label: i18n.get('econtext.useBefore'), value: i18n.date(expiresAt) }
        ],
        [i18n, collectionInstitutionNumber, reference, alternativeReference, expiresAt]
    );

    const standardVoucherDetails = useMemo(
        () => [
            { label: i18n.get('voucher.collectionInstitutionNumber'), value: collectionInstitutionNumber },
            { label: i18n.get('voucher.expirationDate'), value: i18n.dateTime(expiresAt) },
            { label: i18n.get('voucher.telephoneNumber'), value: maskedTelephoneNumber }
        ],
        [i18n, collectionInstitutionNumber, expiresAt, maskedTelephoneNumber]
    );

    const voucherDetails = hasAlternativeReference ? alternativeReferenceDetails : standardVoucherDetails;

    return (
        <Voucher
            {...extractCommonPropsForVoucher({ props, i18n, introKey: 'voucher.introduction.econtext', getImage: getImage() })}
            instructionsUrl={instructionsUrl}
            paymentReferenceLabel={hasAlternativeReference ? i18n.get('econtext.paymentInformation') : undefined}
            voucherDetails={voucherDetails}
            copyBtn={!hasAlternativeReference}
            showReferenceValue={!hasAlternativeReference}
        />
    );
};

export default EcontextVoucherResult;

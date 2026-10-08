import { useEffect, useState } from 'preact/hooks';
import { IssuerItem } from '../../../internal/IssuerList/types';
import getIssuerImageUrl from '../../../../utils/get-issuer-image';
import useImage from '../../../../core/Context/useImage';

interface UseIssuerWithLogoProps {
    txVariant: string;
    issuers: IssuerItem[];
}
export const useIssuerWithLogo = ({ issuers = [], txVariant }: UseIssuerWithLogoProps): IssuerItem[] => {
    const getImage = useImage();
    const [issuersWithLogo, setIssuersWithLogo] = useState<IssuerItem[]>(issuers);

    useEffect(() => {
        if (issuers?.length > 0) {
            const getIssuerIcon = getIssuerImageUrl({}, txVariant, getImage);
            setIssuersWithLogo(
                issuers.map(item => ({
                    ...item,
                    icon: getIssuerIcon(item.id)
                }))
            );
        }
    }, [issuers, txVariant]);

    return issuersWithLogo;
};

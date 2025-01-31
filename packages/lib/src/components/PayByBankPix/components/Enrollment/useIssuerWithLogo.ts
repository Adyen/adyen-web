import { useEffect, useState } from 'preact/hooks';
import { IssuerItem } from '../../../internal/IssuerList/types';
import getIssuerImageUrl from '../../../../utils/get-issuer-image';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

interface UseIssuerWithLogoProps {
    txVariant: string;
    issuers: IssuerItem[];
}
export const useIssuerWithLogo = ({ issuers, txVariant }: UseIssuerWithLogoProps): IssuerItem[] => {
    const { resources, loadingContext } = useCoreContext();
    const [issuersWithLogo, setIssuersWithLogo] = useState<IssuerItem[]>(issuers);

    useEffect(() => {
        const getImage = props => resources.getImage(props);

        if (issuers?.length > 0) {
            const getIssuerIcon = getIssuerImageUrl({ loadingContext }, txVariant, getImage);
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

import { h } from 'preact';
import CampaignContent, { CampaignContentProps } from './CampaignContent';

export default function CampaignContainer(props: CampaignContentProps) {
    const { nonprofitUrl } = props;

    return (
        <div className="adyen-checkout__campaign">
            {!nonprofitUrl && <CampaignContent {...props} />}

            {nonprofitUrl && (
                <a href={nonprofitUrl} className="adyen-checkout__campaign-link" target="_blank" rel="noopener noreferrer">
                    <CampaignContent {...props} />
                </a>
            )}
        </div>
    );
}

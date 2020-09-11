import { h } from 'preact';
import CampaignContent from './CampaignContent';

export default function CampaignContainer(props) {
    const { url } = props;

    return (
        <div className="adyen-checkout__campaign">
            {!url && <CampaignContent {...props} />}

            {url && (
                <a href={url} className="adyen-checkout__campaign-link" target="_blank" rel="noopener noreferrer">
                    <CampaignContent {...props} />
                </a>
            )}
        </div>
    );
}

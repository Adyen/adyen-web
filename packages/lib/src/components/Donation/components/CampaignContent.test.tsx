import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import CampaignContent from './CampaignContent';

const campaign = {
    nonprofitName: 'Test Charity',
    causeName: 'Earthquake Turkey & Syria',
    nonprofitDescription: 'Lorem ipsum...'
};

describe('CampaignContent', () => {
    test('should render the campaign as a link when nonprofitUrl is a valid https URL', () => {
        render(<CampaignContent {...campaign} nonprofitUrl="https://example.org" />);
        expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.org');
    });

    test.each([
        'javascript:alert(document.domain)',
        'JavaScript:alert(1)',
        ' javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'http://example.org',
        'example.org'
    ])('should not render a link when nonprofitUrl is %p', nonprofitUrl => {
        render(<CampaignContent {...campaign} nonprofitUrl={nonprofitUrl} />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByText('Test Charity')).toBeInTheDocument();
    });

    test('should not render a link when nonprofitUrl is missing', () => {
        render(<CampaignContent {...campaign} />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.getByText('Test Charity')).toBeInTheDocument();
    });
});

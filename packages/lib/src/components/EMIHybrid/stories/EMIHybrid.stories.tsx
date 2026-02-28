import { h } from 'preact';

import { MetaConfiguration, StoryConfiguration } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../../storybook/components/Checkout';
import EMIHybrid from '../EMIHybrid';

import type { EMIHybridConfiguration } from '../types';

type EMIHybridStory = StoryConfiguration<EMIHybridConfiguration>;

const meta: MetaConfiguration<EMIHybridConfiguration> = {
    title: 'Components/EMI Hybrid POC'
};

export const Default: EMIHybridStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new EMIHybrid(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'IN',
        componentConfiguration: {
            amount: {
                value: 300000,
                currency: 'INR'
            }
        }
    }
};

export const WithCustomCardConfiguration: EMIHybridStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new EMIHybrid(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'IN',
        componentConfiguration: {
            amount: {
                value: 500000,
                currency: 'INR'
            },
            cardConfiguration: {
                hasHolderName: true,
                holderNameRequired: true,
                billingAddressRequired: true
            }
        }
    }
};

export const WithBinLookup: EMIHybridStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new EMIHybrid(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'IN',
        componentConfiguration: {
            amount: {
                value: 250000,
                currency: 'INR'
            },
            cardConfiguration: {
                doBinLookup: true,
            }
        }
    }
};

export const WithBinLookupNoHolderName: EMIHybridStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new EMIHybrid(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'IN',
        componentConfiguration: {
            amount: {
                value: 350000,
                currency: 'INR'
            },
            cardConfiguration: {
                doBinLookup: true,
                hasHolderName: false,
                holderNameRequired: false
            }
        }
    }
};

/**
 * Enhanced HybridUIElement - Runtime Control API
 * 
 * This story demonstrates EMIHybrid's runtime control methods that merchants can call
 * AFTER instantiation. These are enabled by the Enhanced Hybrid pattern using
 * forwardToActiveChild() and forwardToChild() methods in HybridUIElement.
 * 
 * Example merchant usage:
 * ```
 * const emiHybrid = new EMIHybrid(checkout, { cardConfiguration: {...} });
 * emiHybrid.mount('#container');
 * 
 * // Later, merchant needs runtime control:
 * emiHybrid.setFocusOn('encryptedSecurityCode');  // Guide user to CVV field
 * emiHybrid.updateStyles({ base: { color: '#000' } });  // Dynamic styling (dark mode)
 * emiHybrid.processBinLookupResponse(binData);  // Custom BIN lookup
 * ```
 * 
 * The Enhanced Hybrid pattern provides:
 * - forwardToActiveChild(methodName, ...args) - Forward to whichever child is active
 * - forwardToChild(childKey, methodName, ...args) - Forward to a specific child
 */
export const WithRuntimeControl: EMIHybridStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => {
        let emiHybridInstance: any = null;
        
        return (
            <div>
                <Checkout checkoutConfig={checkoutConfig}>
                    {checkout => {
                        emiHybridInstance = new EMIHybrid(checkout, componentConfiguration);
                        return <ComponentContainer element={emiHybridInstance} />;
                    }}
                </Checkout>
                
                <div style={{ marginTop: '20px', padding: '16px', background: '#e8f4f8', borderRadius: '4px' }}>
                    <h4 style={{ marginTop: 0 }}>Enhanced Hybrid: Runtime Control Methods</h4>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        EMIHybrid <strong>NOW</strong> exposes runtime control methods via <code>forwardToActiveChild()</code>.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => emiHybridInstance?.setFocusOn('encryptedCardNumber')}
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                        >
                            Focus Card Number
                        </button>
                        <button 
                            onClick={() => emiHybridInstance?.setFocusOn('encryptedSecurityCode')}
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                        >
                            Focus CVV
                        </button>
                        <button 
                            onClick={() => emiHybridInstance?.updateStyles({ base: { color: '#0066ff', fontSize: '18px' } })}
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                        >
                            Update Styles (Blue)
                        </button>
                        <button 
                            onClick={() => emiHybridInstance?.updateStyles({ base: { color: '#000', fontSize: '16px' } })}
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                        >
                            Reset Styles
                        </button>
                        <button 
                            onClick={() => emiHybridInstance?.showValidation()}
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                        >
                            Show Validation
                        </button>
                    </div>
                    <div style={{ marginTop: '16px', padding: '12px', background: '#fff', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <strong>How it works:</strong>
                        <ul style={{ fontSize: '13px', marginBottom: 0, paddingLeft: '20px' }}>
                            <li><code>updateStyles()</code> → <code>forwardToActiveChild('updateStyles', ...)</code></li>
                            <li><code>setFocusOn()</code> → <code>forwardToActiveChild('setFocusOn', ...)</code></li>
                            <li><code>processBinLookupResponse()</code> → <code>forwardToChild('card', ...)</code></li>
                            <li>HybridUIElement provides the forwarding mechanism</li>
                            <li>EMI defines which methods to expose (explicit API)</li>
                        </ul>
                    </div>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '12px', marginBottom: 0 }}>
                        This Enhanced Hybrid pattern combines scalability with runtime control.
                    </p>
                </div>
            </div>
        );
    },
    args: {
        countryCode: 'IN',
        componentConfiguration: {
            amount: {
                value: 400000,
                currency: 'INR'
            },
            cardConfiguration: {
                hasHolderName: true,
                holderNameRequired: false,
                doBinLookup: true,
                onBinValue: (binData: any) => {
                    console.log('BIN lookup triggered via cardConfiguration.onBinValue:', binData);
                }
            }
        }
    }
};

export default meta;

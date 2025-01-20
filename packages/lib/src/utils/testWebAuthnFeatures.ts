/* todo: check webauthn features
async function checkClientFeatures() {
    if (typeof window.PublicKeyCredential !== 'undefined') {
        if (typeof window.PublicKeyCredential.getClientCapabilities === 'function') {
            updateStyle('getcc', 's');

            try {
                const capabilities = await PublicKeyCredential.getClientCapabilities();

                console.log(JSON.stringify(capabilities));

                // Passkey Platform Authenticator
                if (capabilities.hasOwnProperty('passkeyPlatformAuthenticator'))
                    capabilities.passkeyPlatformAuthenticator ? updateStyle('ppa', 'a') : updateStyle('ppa', 'na');

                // UVPAA
                if (capabilities.hasOwnProperty('userVerifyingPlatformAuthenticator'))
                    capabilities.userVerifyingPlatformAuthenticator ? updateStyle('uvpa', 'a') : updateStyle('uvpa', 'na');

                // Hybrid
                if (capabilities.hasOwnProperty('hybridTransport'))
                    capabilities.hybridTransport ? updateStyle('hybrid', 'a') : updateStyle('hybrid', 'na');

                // Conditional Get
                if (capabilities.hasOwnProperty('conditionalGet'))
                    capabilities.conditionalGet ? updateStyle('condget', 's') : updateStyle('condget', 'ns');
                if (capabilities.hasOwnProperty('conditionalMediation'))
                    capabilities.conditionalMediation ? updateStyle('condget', 's') : updateStyle('condget', 'ns');

                // Conditional Create
                if (capabilities.hasOwnProperty('conditionalCreate'))
                    capabilities.conditionalCreate ? updateStyle('condcreate', 's') : updateStyle('condcreate', 'ns');

                // Related Origins
                if (capabilities.hasOwnProperty('relatedOrigins')) capabilities.relatedOrigins ? updateStyle('ror', 's') : updateStyle('ror', 'ns');

                // RP Signals: All Accepted Credentials
                if (capabilities.hasOwnProperty('signalAllAcceptedCredentials'))
                    capabilities['signalAllAcceptedCredentials'] ? updateStyle('signalAac', 's') : updateStyle('signalAac', 'ns');

                // RP Signals: Current User Details
                if (capabilities.hasOwnProperty('signalCurrentUserDetails'))
                    capabilities['signalCurrentUserDetails'] ? updateStyle('signalCud', 's') : updateStyle('signalCud', 'ns');

                // RP Signals: All Accepted Credentials
                if (capabilities.hasOwnProperty('signalUnknownCredential'))
                    capabilities['signalUnknownCredential'] ? updateStyle('signalUc', 's') : updateStyle('signalUc', 'ns');

                // Extensions
                if (capabilities.hasOwnProperty('extension:appid'))
                    capabilities['extension:appid'] ? updateStyle('extAppId', 's') : updateStyle('extAppId', 'ns');
                if (capabilities.hasOwnProperty('extension:appidExclude'))
                    capabilities['extension:appidExclude'] ? updateStyle('extAppidExclude', 's') : updateStyle('extAppidExclude', 'ns');
                if (capabilities.hasOwnProperty('extension:hmacCreateSecret'))
                    capabilities['extension:hmacCreateSecret'] ? updateStyle('extHmacCreateSecret', 's') : updateStyle('extHmacCreateSecret', 'ns');
                if (capabilities.hasOwnProperty('extension:credentialProtectionPolicy'))
                    capabilities['extension:credentialProtectionPolicy']
                        ? updateStyle('extCredentialProtectionPolicy', 's')
                        : updateStyle('extCredentialProtectionPolicy', 'ns');
                if (capabilities.hasOwnProperty('extension:enforceCredentialProtectionPolicy'))
                    capabilities['extension:enforceCredentialProtectionPolicy']
                        ? updateStyle('extEnforceCredentialProtectionPolicy', 's')
                        : updateStyle('extEnforceCredentialProtectionPolicy', 'ns');
                if (capabilities.hasOwnProperty('extension:minPinLength'))
                    capabilities['extension:minPinLength'] ? updateStyle('extMinPinLength', 's') : updateStyle('extMinPinLength', 'ns');
                if (capabilities.hasOwnProperty('extension:credProps'))
                    capabilities['extension:credProps'] ? updateStyle('extCredProps', 's') : updateStyle('extCredProps', 'ns');
                if (capabilities.hasOwnProperty('extension:largeBlob'))
                    capabilities['extension:largeBlob'] ? updateStyle('extLargeBlob', 's') : updateStyle('extLargeBlob', 'ns');
                if (capabilities.hasOwnProperty('extension:credBlob'))
                    capabilities['extension:credBlob'] ? updateStyle('extCredBlob', 's') : updateStyle('extCredBlob', 'ns');
                if (capabilities.hasOwnProperty('extension:getCredBlob'))
                    capabilities['extension:getCredBlob'] ? updateStyle('extGetCredBlob', 's') : updateStyle('extGetCredBlob', 'ns');
                if (capabilities.hasOwnProperty('extension:payment'))
                    capabilities['extension:payment'] ? updateStyle('extPayment', 's') : updateStyle('extPayment', 'ns');
                if (capabilities.hasOwnProperty('extension:prf'))
                    capabilities['extension:prf'] ? updateStyle('extPrf', 's') : updateStyle('extPrf', 'ns');
            } catch (error) {
                console.error('Error fetching client capabilities:', error);
            }
        } else {
            // Set Get Client Capabilities to Not Supported
            updateStyle('getcc', 'ns');

            // Check isUVPAA and isConditionalMediation the old way
            try {
                const isuvpaa = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                isuvpaa ? (updateStyle('uvpa', 'a'), updateStyle('ppa', 'a')) : updateStyle('uvpa', 'na');
            } catch (error) {
                console.error('Error fetching PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable():', error);
            }

            try {
                const iscma = await PublicKeyCredential.isConditionalMediationAvailable();
                iscma ? updateStyle('condget', 's') : updateStyle('condget', 'ns');
            } catch (error) {
                console.error('Error fetching PublicKeyCredential.isConditionalMediationAvailable():', error);
            }
        }

        // JSON Helpers
        typeof window.PublicKeyCredential.parseRequestOptionsFromJSON === 'function' ? updateStyle('jsonreq', 's') : updateStyle('jsonreq', 'ns');
        typeof window.PublicKeyCredential.parseCreationOptionsFromJSON === 'function'
            ? updateStyle('jsoncreate', 's')
            : updateStyle('jsoncreate', 'ns');
        typeof window.PublicKeyCredential.prototype.toJSON === 'function' ? updateStyle('tojson', 's') : updateStyle('tojson', 'ns');

        // RP Signals
        typeof window.PublicKeyCredential.signalAllAcceptedCredentials === 'function'
            ? updateStyle('signalAac', 's')
            : updateStyle('signalAac', 'ns');
        typeof window.PublicKeyCredential.signalCurrentUserDetails === 'function' ? updateStyle('signalCud', 's') : updateStyle('signalCud', 'ns');
        typeof window.PublicKeyCredential.signalUnknownCredential === 'function' ? updateStyle('signalUc', 's') : updateStyle('signalUc', 'ns');
    } else {
        document.getElementById('list').style.display = 'none';
        document.getElementById('nowebauthn').style.display = 'block';
    }
}
*/

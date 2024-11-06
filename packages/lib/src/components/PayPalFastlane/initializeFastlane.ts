import FastlaneSDK from './FastlaneSDK';
import type { FastlaneSDKConfiguration } from './FastlaneSDK';

async function initializeFastlane(configuration: FastlaneSDKConfiguration): Promise<FastlaneSDK> {
    const fastlane = new FastlaneSDK(configuration);
    return await fastlane.initialize();
}

export default initializeFastlane;

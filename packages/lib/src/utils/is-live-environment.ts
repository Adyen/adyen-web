/**
 * @internal
 * Checks whether the given environment is a production one. Next to 'live', the regional environments
 * ('live-us', 'live-au', 'live-apse', 'live-in', 'live-nea') are production as well.
 *
 * @param environment - The environment the SDK is configured with
 */
export const isLiveEnvironment = (environment?: string): boolean => Boolean(environment?.toLowerCase().startsWith('live'));

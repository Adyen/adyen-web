// No sessionData on purpose: the SDK replaces its session data with any value returned here, which would break the real calls that follow
const zeroBalanceMockData = {
    balance: { currency: 'USD', value: 0 }
};

const serverErrorMockData = {
    status: 500,
    errorCode: '905',
    message: 'Internal server error',
    errorType: 'internal'
};

export { zeroBalanceMockData, serverErrorMockData };

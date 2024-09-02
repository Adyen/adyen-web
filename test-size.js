const { getPackageStats } = require('package-build-stats');

const func = async () => {
    const results = await getPackageStats('./packages/lib');
    console.log(results);
};
func();

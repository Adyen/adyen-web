const fs = require('fs');
const path = require('path');

module.exports = (res, req) => {
    const locale = req.params.locale;

    try {
        // use LAMBDA_TASK_ROOT when running in Netlify Functions
        const isLambda = !!process.env.LAMBDA_TASK_ROOT;
        const translationPath = isLambda
            ? path.resolve(process.env.LAMBDA_TASK_ROOT, `packages/server/translations/${locale}.json`)
            : path.resolve(__dirname, `../translations/${locale}.json`);
        
        const jsonString = fs.readFileSync(translationPath, { encoding: 'utf-8' });
        res.json(JSON.parse(jsonString));
    } catch (error) {
        console.log(`ERROR: Localhost Server /translations endpoint error - ${error.message}`);
        console.log(`Failed to load translation for locale: ${locale}`);
        console.log(`Environment: ${process.env.LAMBDA_TASK_ROOT ? 'Netlify Functions (Lambda)' : 'Local development'}`);
        console.log(`Attempted path: ${process.env.LAMBDA_TASK_ROOT 
            ? path.resolve(process.env.LAMBDA_TASK_ROOT, `packages/server/translations/${locale}.json`)
            : path.resolve(__dirname, `../translations/${locale}.json`)}`);
        res.status(500).end();
    }
};

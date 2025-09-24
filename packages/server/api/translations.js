const fs = require('fs');
const path = require('path');

module.exports = (res, req) => {
    const locale = req.params.locale;

    try {
        const translationPath = process.env.NETLIFY 
            ? path.resolve(process.cwd(), `packages/server/translations/${locale}.json`)
            : path.resolve(__dirname, `../translations/${locale}.json`);
        
        const jsonString = fs.readFileSync(translationPath, { encoding: 'utf-8' });
        res.json(JSON.parse(jsonString));
    } catch (error) {
        console.log(`ERROR: Localhost Server /translations endpoint error - ${error.message}`);
        res.status(500).end();
    }
};

const fs = require('fs');
const gzipSize = require('gzip-size').sync;
const filesize = require('filesize').filesize;
const path = require('path');

const filePath = path.join(__dirname, '..', '/dist/adyen.js');

try {
    const fileContents = fs.readFileSync(filePath);
    const size = gzipSize(fileContents);

    console.log(`Measuring size of ${filePath}`);
    console.log(filesize(size));
} catch (e) {
    console.log(e);
}

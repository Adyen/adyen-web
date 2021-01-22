const path = require('path');
const fs = require('fs');
const { ElementProperty } = require('./models/ElementProperty');

const outputPath = path.resolve(__dirname, '../dist/docs');
const outputFormat = 'md';

// create output folder
fs.mkdirSync(outputPath, { recursive: true });

function parseDocs(jsonDefinition) {
    const interfaces = jsonDefinition.children;

    if (!interfaces) {
        console.error('⚠️ No definitions found');
        return;
    }

    interfaces.forEach(element => {
        if (element.children.length > 0) {
            const fileName = element.name;
            const filePath = path.resolve(outputPath, `${fileName}.${outputFormat}`);
            const fileContents = getElementContents(element).join('\n');

            writeFile(filePath, fileContents, fileName);
        }
    });
}

function getElementContents(element) {
    let elementFileContent = [];

    // table header
    elementFileContent.push(`| Property | Description |`);
    elementFileContent.push(`| -------- | ----------- |`);

    // interface properties
    element.children.forEach(elementProperty => {
        const property = new ElementProperty(elementProperty);
        elementFileContent.push(`| ${property.name} ${property?.type?.name ? `*${property.type.name}*` : ``} | ${property.description} |`);
    });

    return elementFileContent;
}

function writeFile(path, content, name = '') {
    console.log(`Writting ${name} into ${path}`);

    fs.writeFile(path, content, error => {
        if (error) console.error(error);
    });
}

exports.parseDocs = parseDocs;

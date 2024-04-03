const fs = require('fs');
const path = require('path');

function convertEntries(inputFilePath, outputFilePath) {
    // Read the input file
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading input file:', err);
            return;
        }

        // Define the replacement pattern
        const pattern = /<a href="([^"]+)">([^<]+)<\/a>/g;

        // Replace href attributes with the desired format
        const output = data.replace(pattern, (match, href, text) => {
            const clickHandler = `@click.prevent="loadPage('${href}')"`;
            return `<a href="${href}" ${clickHandler}>${text}</a>`;
        });

        // Save the output to the output file
        fs.writeFile(outputFilePath, output, 'utf8', (err) => {
            if (err) {
                console.error('Error writing output file:', err);
                return;
            }
            console.log('Output saved to', outputFilePath);
        });
    });
}

// Example usage
const inputFilePath = path.join(__dirname, 'input.html');
const outputFilePath = path.join(__dirname, 'output.html');
convertEntries(inputFilePath, outputFilePath);

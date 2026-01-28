const { parse } = require('csv-parse');
const fs = require('fs');

/**
 * Parse CSV File
 * @param {string} filePath - Absolute path to the CSV file
 * @returns {Promise<Array>} - Array of objects from CSV
 */
const parseCsv = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(parse({
                columns: true,
                trim: true,
                skip_empty_lines: true
            }))
            .on('data', (data) => results.push(data))
            .on('error', (error) => reject(error))
            .on('end', () => resolve(results));
    });
};

module.exports = { parseCsv };

/**
 * Stretch goal - Validate all the emails in this files and output the report
 *
 * @param {string[]} inputPath An array of csv files to read
 * @param {string} outputFile The path where to output the report
 */
import fs from 'fs';
import { handleReadStreamDataValidation } from './helper';

async function validateEmailAddresses(
  inputPaths: string[],
  outputFile: string,
) {
  const readStream = fs.createReadStream(inputPaths[0]);
  const writeStream = fs.createWriteStream(outputFile);

  writeStream.write('Emails');
  writeStream.write('\n');
  for await (const chunk of readStream) {
    handleReadStreamDataValidation(chunk, writeStream);
  }
}

export default validateEmailAddresses;

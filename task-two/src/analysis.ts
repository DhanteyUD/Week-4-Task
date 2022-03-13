/**
 * First task - Read the csv files in the inputPath and analyse them
 *
 * @param {string[]} inputPaths An array of csv files to read
 * @param {string} outputPath The path to output the analysis
 */
import fs from 'fs';
import {
  DomainCategories,
  Result,
  handleReadStreamDataAnalysis,
} from './helper';

async function analyseFiles(inputPaths: string[], outputPath: string) {
  const readStream = fs.createReadStream(inputPaths[0]);
  const writeStream = fs.createWriteStream(outputPath);

  //user -1 for totalEmailsParsed so the emails header in csv
  //does not add to the count
  const result: Result = {
    'valid-domains': [],
    totalEmailsParsed: -1,
    totalValidEmails: 0,
    categories: {},
  };

  const categories: DomainCategories = {};

  //for await syntax can be used to process readable streams
  //in place of the event driven syntax
  //i.e readStream.on('data', ...)
  for await (const chunk of readStream) {
    handleReadStreamDataAnalysis(chunk, categories, result);
  }

  //at this point the stream is done processing
  //equivalent to readStream.on('end', ...)
  writeStream.write(JSON.stringify({ ...result, categories }, null, 3));
}

export default analyseFiles;

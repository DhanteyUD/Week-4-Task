/* eslint-disable node/no-unsupported-features/es-builtins */
/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable @typescript-eslint/no-empty-function */
import validator from 'validator';
import { WriteStream } from 'fs';
import { MxRecord, promises as dns } from 'dns';

export interface Result {
  'valid-domains': string[];
  totalEmailsParsed: number;
  totalValidEmails: number;
  categories: Record<string, number>;
}

//Record<string, number> is just a fancy way for
//an object type with keys as strings and values as numbers
export type DomainCategories = Record<string, number>;

export const handleReadStreamDataAnalysis = (
  chunk: Buffer,
  categories: DomainCategories,
  result: Result,
) => {
  //convert Buffer to string
  const data = chunk.toString();

  //split by new line to get array of emails
  const emails = data.trim().split('\n');
  let totalValidEmails = 0;

  //filter out emails that dont have a valid email pattern
  const validArray = emails.filter((email: string) => validator.isEmail(email));

  const domainArray: string[] = [];

  //use array of valid emails to create add domains to our categories object
  //or increase the count of existing domains in the object
  validArray.forEach((input) => {
    totalValidEmails++;
    const domain = input.split('@')[1];

    if (!categories[domain]) {
      categories[domain] = 1;
      domainArray.push(domain);
    } else {
      categories[domain]++;
    }
  });

  result['valid-domains'].push(...domainArray);
  result.totalEmailsParsed += emails.length;
  result.totalValidEmails += totalValidEmails;
};

export const handleReadStreamDataValidation = (
  chunk: Buffer,
  writeStream: WriteStream,
) => {
  //convert Buffer to string
  const data = chunk.toString();

  //get all emails with valid pattern in an array
  const emails = data
    .trim()
    .split('\n')
    .filter((email) => validator.isEmail(email));

  const promisedDnsRecords: Array<Promise<MxRecord[]>> = [];

  emails.forEach((email) => {
    const domain = email.split('@')[1];
    promisedDnsRecords.push(dns.resolveMx(domain));
  });

  Promise.allSettled(promisedDnsRecords).then((result) => {
    result.forEach((record, index) => {
      if (record.status === 'fulfilled') {
        writeStream.write(emails[index]);
        writeStream.write('\n');
      }
    });
  });
};

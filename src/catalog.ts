import { writeFileSync } from 'fs';
import { join } from 'path';
import { Inspection, Test } from './inspection';

export function catalog(inspection: Inspection) {
    // Save to data folder
    const filename = join('data', `${encodeURIComponent(inspection.name)}.json`);
    writeFileSync(filename, JSON.stringify(inspection, null, 2));
    console.log(`Write to ${filename}`);
    console.log(inspection);
}

export function writeErrorLog(name: string, version: string, test: Test, error: string) {
    console.log(error);
    const filename = join('data', `${encodeURIComponent(name)}-${test}.txt`);
    writeFileSync(filename, error);

}
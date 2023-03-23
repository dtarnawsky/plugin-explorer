import { writeFileSync } from 'fs';
import { join } from 'path';
import { Inspection, Platform } from './inspection';

export function catalog(inspection: Inspection) {
    // Save to data folder
    
    const filename = join('data', `${encodeURIComponent(inspection.name)}.json`);
    writeFileSync(filename, JSON.stringify(inspection, null, 2));
    console.log(`Write to ${filename}`);
    console.log(inspection);
}
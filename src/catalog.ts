import { existsSync, readFileSync, writeFileSync } from 'fs';
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

export function writePluginList(name: string) {
    const filename = join('data', `plugins.txt`);
    let lines: string[] = [];
    if (existsSync(filename)) {
        lines = readFileSync(filename, 'utf-8').split('\n');
    }
    if (!lines.includes(name)) {
       lines.push(name);
    }
    lines.sort();
    writeFileSync(filename, lines.join('\n'));
}

export function readPluginList(): string[] {
    const filename = join('data', `plugins.txt`);
    let lines: string[] = [];
    if (existsSync(filename)) {
        lines = readFileSync(filename, 'utf-8').split('\n');
    }
    return lines;
}
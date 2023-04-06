import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Failure } from "./failures.js";

export enum Test {
    capacitorIos5 = 'capacitor-ios-5',
    capacitorAndroid5 = 'capacitor-android-5',
    capacitorIos4 = 'capacitor-ios-4',
    capacitorAndroid4 = 'capacitor-android-4',    
    capacitorIos3 = 'capacitor-ios-3',
    capacitorAndroid3 = 'capacitor-android-3',
    cordovaIos6 = 'cordova-ios-6',
    cordovaAndroid11 = 'cordova-android-11',
    failedInNPM = 'failed-in-npm',
    noOp = 'noop'
}
export interface TestHistorySummary {
   name: string;
   tests: TestHistory[]
}

export function setTestHistory(plugin: string, history: TestHistory) {
    const historySummary = readTestHistorySummary(plugin);
    historySummary.tests = historySummary.tests.filter((h) => !(h.test == history.test && h.version == history.version));
    historySummary.tests.push(history);
    historySummary.tests.sort( compare );
    saveTestHistory(historySummary);
}

function compare( a: TestHistory, b: TestHistory ) {
    if ( a.test < b.test ){
      return -1;
    }
    if ( a.test > b.test ){
      return 1;
    }
    return 0;
  }

export function readTestHistorySummary(plugin: string): TestHistorySummary {
   if (existsSync(testHistoryFilename(plugin))) {
       const data = readFileSync(testHistoryFilename(plugin),'utf-8');
       return JSON.parse(data);
   } else {
    return { tests: [], name: plugin};
   }
}

function saveTestHistory(testHistory: TestHistorySummary) {
    writeFileSync(testHistoryFilename(testHistory.name), JSON.stringify(testHistory,undefined, 2));
}

function testHistoryFilename(plugin: string) {
    return join('data', 'history', `${encodeURIComponent(plugin)}.json`);
}

export interface TestHistory {
    test: Test;
    version: string;
    failure: Failure,
    success: boolean
}

export interface TestInfo {
    ios: Test;
    android: Test;
    folder: string; // Folder to store the repo
    git: string; // URL for the test project
}
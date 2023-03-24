export interface Inspection {
    name: string,
    version: string,
    keywords: string[],
    repo: string,
    success: Test[],
    fails: Test[]
}

export enum Test {
    capacitorIos4 = 'capacitor-ios-4',
    capacitorAndroid4 = 'capacitor-android-4',
    failedInNPM = 'failed-in-npm'
}
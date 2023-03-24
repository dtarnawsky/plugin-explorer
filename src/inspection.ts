export interface Inspection {
    name: string,
    version: string,
    keywords: string[],
    repo: string,
    success: Test[],
    fails: Test[],
    stars?: number, // Github stars
    image?: string, // Github author url
    description?: string, // Github description
    quality?: number, // Calculation
    updated?: string // Github date last updated 
}

export enum Test {
    capacitorIos4 = 'capacitor-ios-4',
    capacitorAndroid4 = 'capacitor-android-4',
    failedInNPM = 'failed-in-npm'
}
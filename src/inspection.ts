export interface Inspection {
    name: string,
    author: string,
    published: string, // Date Time published to npm
    version: string,
    versions: string[],
    keywords: string[],
    repo: string,
    success: Test[],
    fails: Test[],
    bugs?: string, // URL for bugs
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
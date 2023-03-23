export interface Inspection {
    name: string,
    version: string,
    success: Test[],
    fails: Test[]
}

export enum Test {
    capacitorIos4 = 'capacitor-ios-4',
    capacitorAndroid4 = 'capacitor-android-4'
}
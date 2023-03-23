export interface Inspection {
    name: string,
    version: string,
    platforms: Platform[]
}

export enum Platform {
    capacitorIos4 = 'capacitor-ios-4',
    capacitorAndroid4 = 'capacitor-android-4'
}
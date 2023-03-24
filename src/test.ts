export enum Test {
    capacitorIos4 = 'capacitor-ios-4',
    capacitorAndroid4 = 'capacitor-android-4',
    capacitorIos3 = 'capacitor-ios-3',
    capacitorAndroid3 = 'capacitor-android-3',
    failedInNPM = 'failed-in-npm'
}

export interface TestInfo {
    ios: Test;
    android: Test;
    folder: string; // Folder to store the repo
    git: string; // URL for the test project
}
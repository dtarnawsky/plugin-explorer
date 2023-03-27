export enum Test {
    capacitorIos4 = 'capacitor-ios-4',
    capacitorAndroid4 = 'capacitor-android-4',
    capacitorIos3 = 'capacitor-ios-3',
    capacitorAndroid3 = 'capacitor-android-3',
    cordovaIos6 = 'cordova-ios-6',
    cordovaAndroid11 = 'cordova-android-11',
    failedInNPM = 'failed-in-npm',
    noOp = 'noop'
}

export interface TestInfo {
    ios: Test;
    android: Test;
    folder: string; // Folder to store the repo
    git: string; // URL for the test project
}
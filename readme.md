# Plugin Explorer

## Concept
Catalog a list of npm modules:
- Keep the list as text
- Iterate through each item or a particular one
- Capture name, versions, author, link to npm
- Capture github url and github star count, deprecation status, last release
- Capture source code readme.md as `plugin-name.md`
- Annotate with optional example (ie authors can provide guides for usage)
- Build into a Cordova project and if it builds on ios/android then add `cordova-ios`, `cordova-android` with version of Cordova
- Build into a Capacitor project and if it builds on ios/android then add `capacitor-ios`, `capacitor-android` with version of Capacitor
- Keep a folder for each package
- Folder contains `latest.json`, and `version-x.x.x.json`

## Plugin JSON Format
`{plugin}/latest.json`
```json
{
    "name": "cordova-plugin-blar",
    "version": "1.0.0",
    "description": "short description of what the plugin does (one line)",
    "tags": ["biometrics","geolocation"],
    "platforms": ["capacitor-ios-4","cordova-ios-6"],
    "git": "url to github",
    "stars": 15
}
```
The `platforms` property is for tested platforms that it will compile with. If a platform fails to compile it will have a `errors.json` with the error log file.
```json
 {
    "capacitor-ios-3": {
        "log": "capacitor-ios-3.txt",
        "status": "compile-failed"
    }
 }
```
It could fail with status `compile-failed` for native errors, `peer-dep-failed` for failures with peer dependencies.

## Categories
To make it easier to build a site containing categorized plugins we can have a `categories.json`
```json
{
    "categories": [
        { 
            "name": "Biometrics", 
            "tags": ["biometrics", "secure-storage"]
        }
    ]
}
```

## Combining
All plugin folders `latest.json` are rolled up into 2 files:

- `index-short.json` contains only `name`, `tags` fields. 
- `index-full.json` contains all fields.

These are deployed to an static url.
plugins are also documented with `plugin-name.html` which is the readme.md rendered as basic html (using h1,h2,p tags). `plugin-name.md` is also available if markdown can be rendered.

## Usage
A separate project can provide a web app to search and use the index:
- Search input - will find matches for tags or names of projects
- Main page can show categories like Biometrics, Authentication etc
- Under a category you can see a list of plugins sorted by quality (platforms + stars)
- You can choose if your project is Capacitor or Cordova
- Should a count of plugins compatible with Cordova/Capacitor

# Progress

This will now test plugins for iOS and Android.

To run the test on all plugins listed in `data/plugins.txt`:
```shell
npm run inspect-all
```

It will test again a sample project for:
- [Capacitor 4](https://github.com/dtarnawsky/plugin-test-capacitor-4)
- TBA

# Roadmap
- Combine into index.json files
- Have a known list of exceptions: eg cordova-plugin-ionic-webview should not be used with Capacitor
- Known list of tags to add to a plugin
- 
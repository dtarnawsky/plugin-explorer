import { inspect } from './inspect.js';
import { catalog, readPluginList, removeFromPluginList, writePluginList } from './catalog.js';
import { hasArg } from './utils.js';
import { filter, FilterType } from './filter.js';
import { Test, TestInfo } from './test.js';
import { prepare } from './prepare.js';

const args = process.argv;
const dep = args[2];

debugger;
if (hasArg('all', args)) {
    console.log('Inspecting all plugins...');
    go(readPluginList(), FilterType.all);
} else if (hasArg('failed', args)) {
    console.log('Inspecting failed plugins...');
    go(filter(readPluginList(), FilterType.failed), FilterType.failed);
} else if (hasArg('new', args)) {
    console.log('Inspecting new plugins...');
    go(filter(readPluginList(), FilterType.new), FilterType.new);
} else if (hasArg('missing', args)) {
    console.log('Inspecting plugins with missing tests...');
    go(filter(readPluginList(), FilterType.missing), FilterType.missing);    
} else if (hasArg('prepare', args)) {
    prepare();
} else {
    console.log(`Inspecting ${dep}...`);
    go([dep], FilterType.all);
}

async function go(plugins: string[], filterType: FilterType) {
    let count = 0;
    for (const plugin of plugins) {
        count++;
        console.log(`Inspecting ${count} of ${plugins.length}: ${plugin}`);
        // Capacitor 5 test
        const capacitor5: TestInfo = {
            ios: Test.capacitorIos5,
            android: Test.capacitorAndroid5,
            folder: 'capacitor-5',
            git: 'https://github.com/dtarnawsky/plugin-test-capacitor-5.git'
        }

        // Capacitor 4 test
        const capacitor4: TestInfo = {
            ios: Test.capacitorIos4,
            android: Test.capacitorAndroid4,
            folder: 'capacitor-4',
            git: 'https://github.com/dtarnawsky/plugin-test-capacitor-4.git'
        }

        // Capacitor 3 test
        const capacitor3: TestInfo = {
            ios: Test.capacitorIos3,
            android: Test.capacitorAndroid3,
            folder: 'capacitor-3',
            git: 'https://github.com/dtarnawsky/plugin-test-capacitor-3.git'
        }

        const cordova: TestInfo = {
            ios: Test.cordovaIos6,
            android: Test.cordovaAndroid11,
            folder: 'cordova',
            git: 'https://github.com/dtarnawsky/plugin-test-cordova-6-11.git'
        }

        for (const test of [capacitor5, cordova, capacitor4, capacitor3]) {            
            const inspection = await inspect(plugin, test, filterType);
            catalog(inspection);
            const removePlugin = inspection.fails.includes(Test.failedInNPM);
            if (removePlugin) {
                removeFromPluginList(inspection.name);
            } else {
                writePluginList(inspection.name);
            }
        }
    }
}
import { runAll } from './utils';

console.log('hi')

runAll(
    [
        'npm i',
        'npx ionic build --prod',
        'npx cap build ios'
    ],
    'apps/capacitor-4');
import { runAll, run } from './utils';
import { Inspection, Platform } from './inspection';

export async function inspect(dep: string): Promise<Inspection> {
    const result: Inspection =
    {
        name: dep,
        version: '',
        platforms: []
    }
    try {
        const folder = 'apps/capacitor-4';
        const v = await run(`npm view ${dep} version`, folder);
        result.version = v.replace('\n','');
        console.log(`Testing ${dep}@${v}`);
        await runAll(
            [
                'npm i',
                `npm i ${dep}@${v}`,
                'npx ionic build --prod',
                'npx cap build ios'
            ],
            folder);
        result.platforms.push(Platform.capacitorIos4);
    } catch (error) {
        console.error(`Failed ios build for ${dep}`);
    }
    return result;
}
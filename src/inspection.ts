import { Test } from './test.js';

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
    downloads?: number, // NPM Downloads in last month
    updated?: string // Github date last updated 
}


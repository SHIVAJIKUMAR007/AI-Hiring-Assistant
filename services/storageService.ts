
import { type Analysis } from '../types';

const STORAGE_KEY = 'hiringAnalyses';

export const getAnalyses = (): Analysis[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to parse analyses from localStorage", error);
        return [];
    }
};

export const saveAnalyses = (analyses: Analysis[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses, null, 2));
    } catch (error) {
        console.error("Failed to save analyses to localStorage", error);
    }
};

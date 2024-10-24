export type CalorieResponse<T> = T extends 'success' ? { data: Document[] } : { error: string };


export function KeyOf<T>(obj: T, value: any): keyof T | string {
    for (var key in obj) {
        if (obj[key] == value) {
            return key as keyof T;
        }
    }
    return '';
}
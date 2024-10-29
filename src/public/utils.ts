// Validate if string is JSON
const isValidJson = (str: string): boolean => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};

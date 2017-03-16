/**
 * Generates a random string of characters both upper and lowercase with numbers.
 *
 * @param {number} size Length of the string.  Can not be null.
 * @param {string} charset Optionally a subset of characters to pull from.
 */
export function randomString(size: number): string {
    if (size < 0) {
        throw Error("Random string can not have a negative length.");
    }
    let useChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    let full: string = "";
    for (let i = 0; i < size; ++i) {
        full += useChars.charAt(Math.floor(Math.random() * useChars.length));
    }
    return full;
}

export function uuid(): string {
    let d = new Date().getTime();
    let uuid = "xxxxxxxx-xxxx-63xx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
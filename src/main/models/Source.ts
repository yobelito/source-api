const sourceRegex: RegExp = /^[a-zA-Z0-9-][a-zA-Z0-9- ]+[a-zA-Z0-9-]$/;

export interface SourceObj {
    /**
     * ID of the source
     */
    id: string;
    /**
     * Secret key of the source.
     */
    secretKey: string;
    /**
    * ISO formatted string of created date.
    */
    created?: string;
    /**
     * The members that are contained in the source.
     */
    members?: Members;
    /**
     * Real name of the source.
     */
    name?: string;
    /**
     * flag to know whether the source come from bst or dashboard.
     */
    liveDebug?: boolean;
}

export interface Members {
    [userId: string]: "owner" | "member";
}

export class MemberInfo {
    readonly email: string;
    constructor(email: string) {
        this.email = email;
    }
}

export interface FirebaseSourceObj extends SourceObj {
    /**
     * ISO formatted string of created date.
     */
    created: string;
    /**
     * The members that are contained in the source.
     */
    members: Members;
    /**
     * The member's information.
     */
    membersInfo?: MemberInfo[];
    /**
     * Real name of the source.
     */
    name: string;
    /**
     * URL where the source is hosted.
     */
    url?: string;
    /**
     * flag for monitoring the source.
     */
    monitoring_enabled: boolean;
    /**
     * flag for using proxy on the source.
     */
    proxy_enabled: boolean;
    /**
     * flag for locally debugging the source.
     */
    debug_enabled: boolean;
    /**
     * arn for the lambda of the source.
     */
    lambda_arn?: string;
}

/**
 * Validates the name to ensure it matches the criteria.
 */
export function validateName(name: string = ""): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (sourceRegex.test(name)) {
            resolve(name);
        } else {
            reject(new Error("The name must have three letters and contain no special characters except hyphen."))
        }
    });
}

/**
 * Morphs the source name down to a level that can be used for slugging.
 */
export function morph(name: string): Promise<string> {
    return Promise.resolve(stringToSlug(name));
}

/**
 * Converts a string to a slug for use in a URL path.
 *
 * From: http://stackoverflow.com/a/5782563/1349766
 *
 * @export
 * @param {string} str
 * @returns {string} A slug fit for a path
 */
function stringToSlug(str: string): string {

    str = str.replace(/^\s+|\s+$/g, ""); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    let from = "ãàáäâẽèéëêìíïîõòóöôùúüûñçß·/_,:;";
    let to = "aaaaaeeeeeiiiiooooouuuuncs------";
    for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, "") // remove invalid chars
        .replace(/\s+/g, "-") // collapse whitespace and replace by -
        .replace(/-+/g, "-"); // collapse dashes

    return str;
}

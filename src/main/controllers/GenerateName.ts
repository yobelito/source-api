import * as Config from "../config";

const DEFAULT_LIMIT = Config.GENERATION_FAIL_LIMIT;

/**
 * A function that will return "true" if the name exists or return "false" if it does not exist.
 *
 * @param name: The name to check whether it exists or not.
 */
export type NameChecker = (name: string) => boolean | Promise<boolean>;

/**
 * A function that will return a new name to be checked upon.  The name returned should be different than the name
 * passed in.
 *
 * @param name: The name that was previously checked.
 * @param attemptsLeft: The number of attempts that are left before the function gives up.
 */
export type NameGenerator = (name: string, attemptsLeft: number) => string | Promise<string>;

/**
 * A name generator that will contantly check if a name exists and then generate a new name if it does not.
 *
 * @param original: The original name to start with.
 * @param checkNameExists: A function that will check if a generated name exists.
 * @param generator: A function that will be used to generate a new name if the previous does not exist.
 *
 * @return A Promise that will create a unique name or throw a catch if the limit has been reached.
 *
 */
export default function generateName(original: string, checkNameExists: NameChecker, generator: NameGenerator, limit: number = DEFAULT_LIMIT): Promise<String> {
    if (limit <= 0) {
        return Promise.reject(new Error("The name check limit has been reached."));
    }

    return Promise.resolve(original)
        .then(checkNameExists)
        .then(function(checked: boolean): Promise<string> | string {
            if (checked) {
                return Promise.resolve(generator(original, limit))
                    .then(function(newName: string): Promise<string> {
                        return generateName(newName, checkNameExists, generator, --limit);
                    });
            } else {
                // We're unique according to the rules of the function.  Go on.
                return original;
            }
        });
}
/**
 * Class to check whether a name exists or not.
 */
// export interface NameChecker {
//     doesNameExist(name: string): boolean;
// };

/**
 * Class which will generate a new name if the original already exists.
 */
// export interface Generator {
//     /**
//      * Generates the name.
//      *
//      * @param: The original name that was passed to the NameGenerator.
//      */
//     generate(original: string): string;
// }

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
 */
export type NameGenerator = (name: string) => string | Promise<string>;

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
export function generateName(original: string, checkNameExists: NameChecker, generator: NameGenerator, limit: number = 10): Promise<String> {
    if (limit <= 0) {
        return Promise.reject(new Error("The name check limit has been reached."));
    }

    return Promise.resolve(original)
        .then(checkNameExists)
        .then(function(checked: boolean): Promise<string> | string {
            console.info(checked);
            if (checked) {
                return Promise.resolve(generator(original))
                    .then(function(newName: string): Promise<string> {
                        console.info("newName = " + newName);
                        return generateName(newName, checkNameExists, generator, --limit);
                    });
            } else {
                console.info("returning " + original);
                // We're unique.  Go on.
                return original;
            }
        });
}

// export default class NameGenerator {

//     limit: 10;
//     nameChecker: NameChecker;
//     nameGenerator: Generator;

//     constructor() {
//         this.nameChecker = { doesNameExist(name: string): boolean { return false; }}
//         this.nameGenerator = { generate(original: string): string { return name; }}
//         this.generateName = this.generateName.bind(this);
//         this.renameAndCheck = this.renameAndCheck.bind(this);
//     }

//     /**
//      * Will generate a unique name based on the nameChecker and the nameGenerator provided to the class.
//      *
//      * @param originalName: The name to start with. It will return this if it happens to already be unique.
//      */
//     generateName(originalName: string): Promise<string> {
//         return Promise.resolve(originalName)
//             .then(this.renameAndCheck);
//     }

//     renameAndCheck(name: string, limit: number = 0): Promise<string> {
//         console.info("RENAMING ");
//         console.log(this.nameChecker);
//         const doesNameExist = this.nameChecker.doesNameExist;
//         const renameAndTryAgain = this.renameAndCheck;
//         const classLimit = this.limit;

//         return Promise.resolve(name)
//         .then(function(name: string): boolean {
//             return doesNameExist(name);
//         }).then(function(checked: boolean): Promise<string> {
//             console.info("checked " + checked + " " + limit);
//             if (checked) {
//                 if (limit === classLimit) {
//                     return Promise.reject(new Error("Too many attempts."));
//                 } else {
//                     return renameAndTryAgain(name, ++limit);
//                 }
//             } else {
//                 return Promise.resolve(name);
//             }
//         });
//     }
// }


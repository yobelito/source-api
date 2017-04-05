export interface UserObj {
    userId: string;
}

export interface FirebaseUserObj extends UserObj {
    sources: {
        [sourceId: string]: string
    }
}
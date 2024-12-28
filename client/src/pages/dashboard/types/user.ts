export type UserProfile = {
    id: string;
    profileUrl: string;
    about: string;
    userId: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
};

export type User = {
    id: string;
    username: string;
    email: string;
    createdAt: string; // ISO date string
    userProfile: UserProfile;
    updatedAt: string; // ISO date string
};

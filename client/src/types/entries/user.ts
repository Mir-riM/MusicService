export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

export interface IUser {
  _id: string;
  login: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

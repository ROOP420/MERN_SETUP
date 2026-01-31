import { IUser } from './user.types.js';

declare global {
    namespace Express {
        interface User extends IUser { }
        interface Request {
            user?: IUser;
        }
    }
}

export { };

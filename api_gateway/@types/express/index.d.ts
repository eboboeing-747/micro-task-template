import { UserAuth } from "@local/types";

declare global {
    namespace Express {
        interface Request {
            carry: UserAuth | null;
        }
    }
}

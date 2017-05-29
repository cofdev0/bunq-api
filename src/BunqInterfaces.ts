

import {BunqKey} from "./BunqKey";

export interface BunqServerConnection {
    request(options:any):Promise<any>;
}

export interface SessionCreator {
    createSessionServer() : Promise<any>;
}

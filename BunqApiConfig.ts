import fs = require('fs');

export class BunqApiConfig {

    constructor(configFilename:string="./bunq.json") {
        let buffer = fs.readFileSync(configFilename);
        let jsonString:string = buffer.toString();
        this.json = JSON.parse(jsonString);
    }

    static read(filename:string) : string {
        const buffer = fs.readFileSync(filename);
        return buffer.toString();
    }

    static readJson(filename:string) : any {
        const jsonString:string = this.read(filename);
        return JSON.parse(jsonString);
    }



    readonly json : any;

}
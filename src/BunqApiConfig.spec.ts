import {} from 'jest';
import {BunqApiConfig} from "./BunqApiConfig";
import * as fs from "fs-extra";

describe("BunqApiConfig", () => {

    it("can read default bunq.json", () => {
        const config:BunqApiConfig = new BunqApiConfig();
        expectConfigToBeComplete(config);
    });

    it("can read bunqSpecs.json", () => {
        const config:BunqApiConfig = BunqApiConfig.createForSpecs();
        expectConfigToBeComplete(config);
        expectConfigFilesToExist(config)
    });

    function expectConfigToBeComplete(config:BunqApiConfig):void {
        expect(config.json.secretsPath.length).toBeGreaterThan(0);
        expect(config.json.secretsFile.length).toBeGreaterThan(0);
        expect(config.json.publicKeyFile.length).toBeGreaterThan(0);
        expect(config.json.publicKeyFile.length).toBeGreaterThan(0);
        expect(config.json.privateKeyFile.length).toBeGreaterThan(0);
        expect(config.json.installationTokenFile.length).toBeGreaterThan(0);
        expect(config.json.bunqSessionFile.length).toBeGreaterThan(0);
        expect(config.json.bunqSessionHistoryPath.length).toBeGreaterThan(0);

    }

    function expectConfigFilesToExist(config:BunqApiConfig):void {
        Object.keys(config.json).forEach(function(key){
            expect(fs.exists(config.json[key])).toBeTruthy();
        });
    }

});

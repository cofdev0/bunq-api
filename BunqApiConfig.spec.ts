import {} from 'jest';
import {BunqApiConfig} from "./BunqApiConfig";

describe("BunqApiConfig", () => {

    it("can read default bunq.json", () => {
        let config:BunqApiConfig = new BunqApiConfig();

        expect(config.json.publicKeyFile.length).toBeGreaterThan(0);
        expect(config.json.privateKeyFile.length).toBeGreaterThan(0);
        expect(config.json.installationTokenFile.length).toBeGreaterThan(0);
        expect(config.json.deviceServerConfigFile.length).toBeGreaterThan(0);
    });


});

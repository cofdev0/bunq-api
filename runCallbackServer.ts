import {BunqApiConfig} from "./BunqApiConfig";
var restify = require('restify');
var fs = require('fs');

// create certificates example in bunqSecrets directory
// openssl genrsa -out server.key 2048 && openssl req -new -key server.key -out server.csr && openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

const config:BunqApiConfig=new BunqApiConfig();

// Setup https server options
var https_options = {
    key: fs.readFileSync(config.json.secretsPath+'/server.key'),
    certificate: fs.readFileSync(config.json.secretsPath+'/server.crt')
};

// Instantiate our two servers
//var server = restify.createServer();
var https_server = restify.createServer(https_options);

// Put any routing, response, etc. logic here. This allows us to define these functions
// only once, and it will be re-used on both the HTTP and HTTPs servers
var setup_server = function(app) {
    function respond(req, res, next) {
        res.send('I see you ' + req.params.name);
    }

    // Routes
    app.get('/test/:name', respond);
}

// Now, setup both servers in one step
// setup_server(server);
setup_server(https_server);

// Start our servers to listen on the appropriate ports
// server.listen(80, function() {
//     console.log('%s listening at %s', server.name, server.url);
// });

https_server.listen(44444, function() {
    console.log('%s listening at %s', https_server.name, https_server.url);
});


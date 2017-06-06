# bunq-api

A wrapper for part of the bunq API v1 in Type-/JavaScript forked from Simon Schraeders https://github.com/c0dr/bunq


## intended functionality

- [authentication procedure](https://doc.bunq.com/api/1/page/authentication) with bunq server consisting of
    - key creation and installation
    - device server registration with API key
    - session server registration to get session auth token
  
    
    
- [information request](https://doc.bunq.com/api/1/call/monetary-account)
    - user
    - balance
    - payments
      
- [payment to IBAN](https://doc.bunq.com/api/1/call/payment)


- [install a notification filter](https://doc.bunq.com/api/1/page/callbacks)
    
    

## install prerequisites (as root or with sudo)
 
- node.js 
    - ```apt-get install nodejs```
    - ```npm install -g npm@latest```
- typescript 
    - ```npm install -g typescript```
- jest
    - ```npm install -g jest```


## clone, compile, test
```
git clone https://github.com/cofdev0/bunq-api.git bunq
cd bunq
npm install
tsc
npm run test
```

## setup and initial authentication with bunq server
- create a public/private key pair
    - change secretsPath in bunq.json to point to an existing directory for your secret data
    - ```npm run createKey```
    - change file names of created key files
    - change publicKeyFile and privateKeyFile in bunq.json to point to newly created key files
- install public key with bunq server
    - ```npm run installKey```
    - rename newly created JSON file with installationToken in your secretPath
    - have installationTokenFile in bunq.json point to this installationToken file in your secretPath
- create device server with bunq
    - have secretsFile in bunq.json point to your secret configuration JSON file
    - the secret configuration file must contain the secret API key you receive from bunq and a description of your server
    - like so: { 'secret' : 'nWmbY4QqXra...', 'description':'my bunq dev server' }
    - ```npm run createDeviceServer```
- create first session with bunq server
    - have bunqSessionFile in bunq.json point to the JSON file where to store the current session
    - have bunqSessionHistoryPath in bunq.json point to a directory where to store history of sessions
    - ```npm run createSession```
- find your user id
    - ```npm run requestUser```
    - find your user id in the JSON output and enter it into your secret config file with key userId
    - add "accountId" : "" in your secret config file
- find your account id
    - ```npm run showAccount```
    - find your account id in the JSON output and update your secret config file accordingly

## payments
- show all payments on your account
    - ```npm run requestPayments```
- send payment to IBAN
    - ```npm run sendPayment -- --iban NL09BUNQ2290519588 --amount 10 --description donation --name StichtingChainsOfFreedom --sendPayment```
    - well done! thanks!

## notification on payment
- install notification filter to receive notification on payment
    - create server certificate to allow https connection (below)
    - have notificationKeyFile and notificationCertFile in secret configuration file point to certificate files
    - ```npm run installNotification -- https://my.domain.com/callback```
    
- example server to receive notification on payments    
    - execute on server of notified domain: 
    - ```npm run runCallbackServer```

## create server certificate for notification filters
- selfsigned certificate
    - ```openssl genrsa -out server.key 2048``` 
    - ```openssl req -new -key server.key -out server.csr``` 
    - ```openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt```
- certificate from letsencrypt.org using certbot.eff.org
    - ```certbot certonly --standalone -d your-domain-name.com```
    - renew certificate twice per day with a crontab job: 
    - ```11 0,12 * * * /usr/bin/certbot certonly --quiet --standalone --renew-by-default -d your-domain-name.com```
    
## use in your own projects
```
import { 
BunqKey, BunqApi, BunqApiConfig, BunqApiSetup, 
BunqConnection, BunqServerConnection, SessionCreator 
} from 'bunq-api/dist/index';
```
- for some examples check e.g.
    - [request user](https://github.com/cofdev0/bunq-api/blob/master/src/requestUser.ts)
    - [show account](https://github.com/cofdev0/bunq-api/blob/master/src/showAccount.ts)
    - [request payments](https://github.com/cofdev0/bunq-api/blob/master/src/requestPayments.ts)
    - [send payment](https://github.com/cofdev0/bunq-api/blob/master/src/requestPayments.ts)

## publish to npm repository
- install dts-generator
    - ```npm install -g dts-generator```
    - create types with: 
    - ```npm run createTypes```
- create package for testing
    - ```npm pack```
- publish to npmjs.com
    - ```npm login```
    - ```npm publish```
    
    
    
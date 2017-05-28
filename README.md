# bunq

A wrapper for part of the bunq API v1 in Type-/JavaScript forked from Simon Schraeders https://github.com/c0dr/bunq


intended functionality

- authentication procedure with bunq server consisting of
    - key creation and installation
    - device server registration with API key
    - session server registration to get session auth token
    - https://doc.bunq.com/api/1/page/authentication
    
    
- information request
    - user
    - balance
    - payments
    - https://doc.bunq.com/api/1/call/monetary-account
    
    
- payment to IBAN
    - https://doc.bunq.com/api/1/call/payment


- install a notification filter
    - https://doc.bunq.com/api/1/page/callbacks
    

install prerequisites (as root or with sudo)
 
- node.js 
    - apt-get install nodejs
    - npm install npm@latest -g
- typescript 
    - npm install -g typescript
- jest
    - npm install -g jest

clone, compile, test

- git clone https://github.com/cofdev0/bunq.git bunq
- cd bunq
- npm init
- npm install
- tsc
- npm test

setup and authentication with bunq server
- create a public/private key pair
    - change secretsPath in bunq.json to point to an existing directory for your secret data
    - execute: node createKey.js
    - change file names of created key files
    - change publicKeyFile and privateKeyFile in bunq.json to point to newly created key files
- install public key with bunq server
    - execute: node installKey.js
    - rename file name of installationToken JSON file in your secretPath
    - have installationTokenFile in bunq.json point to the installationToken file in your secretPath
- create device server with bunq
    - have secretsFile in bunq.json point to your secret configuration JSON file
    - the secret configuration file must contain the secret API key you receive from bunq and a description of your server
    - like so: { 'secret' : 'nWmbY4QqXra...', 'description':'my bunq dev server' }
    - execute: node createDeviceServer.js
- create first session with bunq server
    - have bunqSessionFile in bunq.json point to the JSON file where to store the current session
    - have bunqSessionHistoryPath in bunq.json point to a directory where to store history of sessions
    - execute: node createSession.js
- find your user id
    - execute: node requestUser.js
    - find your user id in the json output and enter it in your secret config file with key userId
    - add "accountId" : "" in your secret config file
- find your account id
    - execute: node showAccount.js
    - find your account id in the json output and update your secret config file with key accountId

payments
- show all payments on your account
    - execute: node requestPayments.js
- send payment to IBAN
    - execute: node sendPayment.js --iban NL09BUNQ2290519588 --amount 10 --description donation --name StichtingChainsOfFreedom
    - well done! thanks!

notification on payment
- install notification filter to receive notification on payment
    - create server certificate to allow https connection (below)
    - have notificationKeyFile and notificationCertFile in secret configuration file point to certificate files
    - execute: node installNotification.js https://my.domain.com/callback
    
- example server to receive notification on payments    
    - execute on server of notified domain: node runCallbackServer.js

create server certificate for notification filters
- selfsigned certificate
    - openssl genrsa -out server.key 2048 
    - openssl req -new -key server.key -out server.csr 
    - openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
- certificate from letsencrypt.org using certbot.eff.org
    - certbot certonly --standalone -d your-domain-name.com
    - renew with crontab: 11 0,12 * * * /usr/bin/certbot certonly --quiet --standalone --renew-by-default -d your-domain-name.com
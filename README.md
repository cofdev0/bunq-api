# bunq

A wrapper for part of the Bunq API v1 in Type-/JavaScript forked from Simon Schraeders https://github.com/c0dr/bunq


intended functionality

- authentication procedure with Bunq server consisting of
    - key creation and installation
    - device server registration with API key
    - session server registration to get session auth token
    - https://doc.bunq.com/api/1/page/authentication
    
    
- information request
    - user
    - balance
    - transactions
    - https://doc.bunq.com/api/1/call/monetary-account
    
    
- payment to IBAN
    - https://doc.bunq.com/api/1/call/payment


- install callback to an URL
    - https://doc.bunq.com/api/1/page/callbacks
    

prerequisites (as root or with sudo)
 
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
- jest --coverage
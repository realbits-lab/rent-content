# Rent content

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

## Install npm

```sh
foo@bar:~$ npm i
```

## Create .env

```sh
foo@bar:~$ cp .env.example .env
```

## Add alchemy api key in .env

```sh
foo@bar:~$ echo NEXT_PUBLIC_ALCHEMY_KEY={alchemy_api_key} >> .env
```

## Run server

```sh
foo@bar:~$ npm run dev
```

## Build server

```sh
foo@bar:~$ npm run build
```

## Install heroku crontogo addon

```sh
heroku addons:create crontogo
```

## Open crontogo addon

```sh
heroku addons:open crontogo
```

## Request settle-rent-data API

- curl -d '{"auth_key":AUTH_KEY_VALUE}' -H "Content-Type: application/json" -X POST http://API_SERVER_URL/api/settle-rent-data

## ethers npm version

- Use ethers@^5.7.2

```
npm ERR! peer ethers@">=5.5.1 <6" from @wagmi/core@0.10.9
npm ERR! node_modules/@wagmi/core
npm ERR!   peer @wagmi/core@">=0.10" from @web3modal/ethereum@2.3.0
npm ERR!   node_modules/@web3modal/ethereum
npm ERR!     @web3modal/ethereum@"^2.3.0" from the root project
```

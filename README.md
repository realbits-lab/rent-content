# Rent content

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
<a href="http://www.repostatus.org/#active"><img src="http://www.repostatus.org/badges/latest/active.svg" /></a>

## Getting Started

## Install npm

```bash
foo@bar:~$ npm i
```

## Create .env

```bash
foo@bar:~$ cp .env.example .env
```

## Add alchemy api key in .env

```bash
foo@bar:~$ echo NEXT_PUBLIC_ALCHEMY_KEY={alchemy_api_key} >> .env
```

## Run server

```bash
foo@bar:~$ npm run dev
```

## Build server

```bash
foo@bar:~$ npm run build
```

## Install heroku crontogo addon

```bash
heroku addons:create crontogo
```

## Open crontogo addon

```bash
heroku addons:open crontogo
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

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

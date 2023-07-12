# Install npm

```console
foo@bar:~$ npm i
```

# Create .env

```console
foo@bar:~$ cp .env.example .env
```

# Add alchemy api key in .env

```console
foo@bar:~$ echo NEXT_PUBLIC_ALCHEMY_KEY={alchemy_api_key} >> .env
```

# Run

```console
foo@bar:~$ npm run dev
```

# Build

```console
foo@bar:~$ npm run build
```

# ethers npm version

- Use ethers@^5.7.2

```
npm ERR! peer ethers@">=5.5.1 <6" from @wagmi/core@0.10.9
npm ERR! node_modules/@wagmi/core
npm ERR!   peer @wagmi/core@">=0.10" from @web3modal/ethereum@2.3.0
npm ERR!   node_modules/@web3modal/ethereum
npm ERR!     @web3modal/ethereum@"^2.3.0" from the root project
```

## Request settle-rent-data API

- curl -d '{"auth_key":AUTH_KEY_VALUE}' -H "Content-Type: application/json" -X POST http://API_SERVER_URL/api/settle-rent-data

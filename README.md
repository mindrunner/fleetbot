<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<div align="center">
<h3 align="center">fleetbot</h3>
  <p align="center">
    Fleet refill Service for Star Atlas SCORE
    <br />
    <br />
    <a href="https://t.me/fl33tbot">Use Fleetbot</a>
    ·
    <a href="https://github.com/mindrunner/fleetbot/issues">Report Bug</a>
    ·
    <a href="https://github.com/mindrunner/fleetbot/issues">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#compile-and-run">Compile and Run</a></li>
        <li><a href="#prebuild-docker-image">Prebuild docker image</a></li>
        <li><a href="#officially-hosted-fleetbot">Officially hosted fleetbot</a></li>
      </ul>
    </li>
    <li><a href="#telegram">Telegram</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#disclaimer">Disclaimer</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#donations">Donations</a></li>
  </ol>
</details>

<!-- ABOUT -->
## About The Project

fleetbot is an automatic fleet refill service bot for <a href='https://play.staratlas.com/fleet/'>Star Atlas SCORE</a>,
an early stage mini-game in the Star Atlas universe.
`fleetbot` contains of four core components:

### resource manager
The resource manager makes sure that `fleetbot` always has enough `R4`. (FOOD, TOOL, FUEL and AMMO). Basically it
calculates how much is needed for a given time period based on users and their burn. As soon as `fleetbot` runs low on a
particular resource, it uses the official Star Atlas marketplace to restock them.

### bookkeeper
The bookkeeper manages user's accounts, handles deposits and withdrawals and keeps track of individual balances. Since
all user's funds are kept in one wallet, this needs to be baked by a persistence layer to store additional information
which can not efficiently be read from the blockchain itself.

### refill service
The most crucial part for `fleetbot` users. Checks your fleets and refills them as soon as they run out of resources.
Ships aren't getting full refills by default, but only what is really needed. This leaves the option for the user to
manually add resources as well.

### telegram bot
To interact with `fleetbot`, telegram can be used. See telegram section further down for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![Node][node.js]][Node-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

`fleetbot` can be used in several ways, depending on user's preference. To be fully aware of what the bot is actually doing
it is recommended to study the source code and compile/run it on own infrastructure. Since that's not an option for
everyone, there are more convenient solutions available as well.

### Compile and run

To compile and run the source code, the following prerequisites are needed:

* node environment
* empty postgres database
* telegram bot
* unused solana wallet

See `.env.example` for required information. Create a copy (`.env.`) and configure the environment.

1. clone repo
   ```sh
   git clone https://github.com/mindrunner/fleetbot.git
   ```

2. install dependencies
    ```sh
    npm install
    ```

3. run database migrations
    ```sh
    npm run typeorm migration:run
    ```

4. start fleetbot
    ```sh
    npm run start:fleetbot
    ```

### Prebuild docker image

An official docker image is available and automatically build from `main` branch. To easily get started, it is recommended
to use `docker-compose`.

Example compose file:
```
version: '3.5'

services:

  fleetbot:
    restart: always
    image: runmymind/fleetbot:latest
    depends_on:
      - postgres
    env_file:
      - .env
    command: [ "fleetbot.sh" ]

  postgres:
    restart: always
    image: postgres:14.5-alpine
    environment:
      TZ: Europe/Berlin
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD:
      POSTGRES_DB: postgres
    volumes:
      - $PWD/data/postgres:/var/lib/postgresql/data
```

### Officially Hosted fleetbot

For convenience, there is an officially hosted `fleetbot` available at `https://t.me/fl33tbot`.
See the following section on how to interact with the bot on telegram.

<!-- TELEGRAM -->
## Telegram
Interaction with `fleetbot` is possible with telegram. The bot has a `/help` command which explains all important
commands. Usage should be pretty straight forward as follows:

```
Welcome to fleetbot!
I can automatically refill your Star Atlas enlisted fleets.

Prerequisites:
- Your wallet has enlisted Ships to the Faction Fleet. You can do that on https://play.staratlas.com (https://play.staratlas.com/)
- You have refilled your ships at least once. This creates escrow accounts for the supplies. Unfortunately, I cannot do that for you.

Last but not least, you have to send me some ATLAS which I will use as your credits for the supplies.

You can send it to one of the following addresses:
- fleetbot.sol
- ANDqa82T21G1RXwxpbf9v7jZXXfFSeezaUf7MJGTH6BZ

As soon as I receive the ATLAS, I will start refilling your ships in regular intervals. I use an optimized refilling strategy, so that you are always covered.
However, to save you on commission, I will not fully load the ship. You can always refill your fleet by yourself. I will only jump in if you are running low.

For the hard work of refilling all the fleets, I keep 15% of the ATLAS I spend for myself.
You can change the commission at any time to any value.

Bare in mind that I check the ledger in 10 minute intervals. So your deposits will be recognized by me a little bit delayed. Dont' panic. :)
If something does not work as expected, you can always use the /support command to get a human fixing the issues.

Commands:

/help Prints this message
/support Talk to a human
/verify {publicKey} Connect your Telegram Account to a wallet

Commands for verified users:

/enable Enable automatic fleet refilling
/disable Disable automatic fleet refilling
/refill Trigger an immediate refill
/stats Query some stats
/transactions Query transactions associated to your wallet
/refills Query refill activity
/withdraw {amount} Withdraw ATLAS back to your wallet
/logout Disconnects Telegram Account from wallet
/tip Set or query tip setting (default 15%)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ROADMAP -->
## Roadmap

- [] Migrate to SPL-Token 0.3.x interface

See the [open issues](https://github.com/mindrunner/fleetbot/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DISCLAIMER -->
## Disclaimer

Before using this service or code, do your own research about crypto-world, metaverses, wallets and all the potential
danger in this universe.

- `fleetbot` is not responsible for any loss of funds
- `fleetbot` will never DM you
- `fleetbot` will never ask you for seed phrases or private keys

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License
Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DONATIONS -->
## Donations
`fleetbot` accepts donations in `SOL`, `POLIS` or `USDC` at the same addresses it operates:
* fleetbot.sol
* ANDqa82T21G1RXwxpbf9v7jZXXfFSeezaUf7MJGTH6BZ

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/mindrunner/fleetbot.svg?style=for-the-badge
[contributors-url]: https://github.com/mindrunner/fleetbot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/mindrunner/fleetbot.svg?style=for-the-badge
[forks-url]: https://github.com/mindrunner/fleetbot/network/members
[stars-shield]: https://img.shields.io/github/stars/mindrunner/fleetbot.svg?style=for-the-badge
[stars-url]: https://github.com/mindrunner/fleetbot/stargazers
[issues-shield]: https://img.shields.io/github/issues/mindrunner/fleetbot.svg?style=for-the-badge
[issues-url]: https://github.com/mindrunner/fleetbot/issues
[license-shield]: https://img.shields.io/github/license/mindrunner/fleetbot.svg?style=for-the-badge
[license-url]: https://github.com/mindrunner/fleetbot/blob/master/LICENSE

[node.js]: https://img.shields.io/badge/node.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Node-url]: https://nodejs.org


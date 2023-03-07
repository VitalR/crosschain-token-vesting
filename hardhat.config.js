require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("dotenv").config()

const { PRIVATE_KEY, ETHERSCAN_API_KEY, ALCHEMY_API_KEY, FUJI_API_KEY } = process.env;

module.exports = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    fuji: {
      url: `https://avalanche-fuji.infura.io/v3/${FUJI_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
    ftm: {
      url: `https://fantom-testnet.public.blastapi.io/`,
      accounts: [PRIVATE_KEY]
    },
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500
      }
    }
  },
  gas: "auto",
  gasReporter: {
    gasPrice: 39,
    enabled: true,
    showTimeSpent: true,
    currency: "USD"
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
}
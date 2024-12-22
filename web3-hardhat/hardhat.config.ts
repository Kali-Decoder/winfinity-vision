import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
const ACCOUNTS = process.env.DEPLOYER_ACCOUNT_PRIV_KEY
  ? [`${process.env.DEPLOYER_ACCOUNT_PRIV_KEY}`]
  : [];
module.exports = {
  defaultNetwork: "hardhat",
  gasReporter: {
    enabled: false,
  },
  networks: {
    hardhat: { chainId: 31337 },
    neox_testnet:{
      url: "https://public-node.testnet.rsk.co/",
      chainId: 31,
      accounts: ACCOUNTS,
    },
    neox_mainnet:{
      url: "https://public-node.rsk.co/",
      chainId: 30,
      accounts: ACCOUNTS,
    }
  },
  etherscan: {
    apiKey: {
      neox_testnet: "3227102f-dd06-4329-b1e2-ab1e2f127d6e",
      neox_mainnet: "3227102f-dd06-4329-b1e2-ab1e2f127d6e",
    },
    customChains: [
      {
        network: "iotaEvmMainnet",
        chainId: 8822,
        urls: {
          apiURL: "https://explorer.evm.iota.org/api",
          browserURL: "https://explorer.evm.iota.org",
        },
      }
    ],
  },
  sourcify: {
    enabled: false,
  },
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
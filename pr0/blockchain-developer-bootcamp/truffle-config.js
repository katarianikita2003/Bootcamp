// require('babel-register');
// require('babel-polyfill');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "*",
    gas: 8000000, // Increase gas limit
    gasPrice: 20000000000,
    }
  },
  contracts_directory: './src/contracts/',    // Ensure this path is correct
  contracts_build_directory: './src/abis',   // Ensure this path is correct
  compilers: {
    solc: {
      version: "0.7.1",  // Solidity version; change if needed
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,  // Optimization setting
        },
      },
    },
  },
};

const Web3 = require('web3');
const Token = require('./src/abis/Token.json'); // Use 'require' instead of 'import'

// Replace with your RPC URL (e.g., Ganache, Infura, or Alchemy)
const web3 = new Web3('HTTP://127.0.0.1:7545');

const abi = Token.abi; // Extract the ABI
const contractAddress = '0x076603BE4e6790A8fDFf6cdF8513D2f0689c4A44';

const tokenContract = new web3.eth.Contract(abi, contractAddress);

async function checkTotalSupply() {
  try {
    const totalSupply = await tokenContract.methods.totalSupply().call();
    console.log("Total Supply:", totalSupply);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkTotalSupply();

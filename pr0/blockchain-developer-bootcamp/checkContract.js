const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:7545'); // Replace with your network RPC URL
const contractAddress = '0xbA86be8eAED83AA6322bDFdD08f9978306c65ebC'; // Replace with your contract address
const contractABI = require('./src/abis/Token.json').abi; // Adjust path and contract name

const contract = new web3.eth.Contract(contractABI, contractAddress);

(async () => {
  const isDeployed = await web3.eth.getCode(contractAddress);
  if (isDeployed !== '0x') {
    console.log('Contract is deployed at:', contractAddress);
  } else {
    console.log('Contract is not deployed at this address.');
  }
})();

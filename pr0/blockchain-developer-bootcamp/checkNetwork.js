const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:7545'); // Replace with your RPC URL

(async () => {
  const networkId = await web3.eth.net.getId();
  console.log('Network ID:', networkId);

  const networkType = await web3.eth.net.getNetworkType();
  console.log('Network Type:', networkType);
})();

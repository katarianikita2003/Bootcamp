export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'; // Representing Ether address
export const EVM_REVERT = 'VM Exception while processing transaction: revert';

// Tokens helper for converting token amounts
export const tokens = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether') // Assuming token decimal places are 18
    );
};

// Ether helper for converting Ether amounts
export const ether = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    );
};

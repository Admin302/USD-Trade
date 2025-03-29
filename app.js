// Import Web3.js
const Web3 = require('web3');
const axios = require('axios');
const { abi, contractAddress } = require('./contractData');  // Smart contract ABI and address

// Initialize Web3
const web3 = new Web3(window.ethereum);
let contract;

// Pinata API
const pinataApiKey = '135cb22a26ac22e68a75';
const pinataApiSecret = '39f92e9a8a04c27ebb8529d436366f69a2fdb3ec6bdb637ff0efccb99587debe';
const pinataBaseUrl = 'https://gateway.pinata.cloud/ipfs/bafkreidckjcuyxaypmdkqojq7v2qn7wgc6q5xthatdtapk36aut2kd55eq';

// Contract setup
const initContract = () => {
    contract = new web3.eth.Contract(abi, contractAddress);
};

// Connect to wallet
const connectWallet = async () => {
    try {
        await window.ethereum.enable();
        console.log('Wallet connected');
        fetchLiveData();
    } catch (error) {
        console.log('User denied account access');
    }
};

// Fetch live USD value from Chainlink Price Feed
const fetchLiveUSDValue = async () => {
    const price = await contract.methods.getLatestUSDTPrice().call();
    const usdValue = Web3.utils.fromWei(price, 'ether');
    document.getElementById('usd-value').innerText = `$${usdValue}`;
};

// Fetch live trade data (Trade History)
const fetchTradeHistory = async () => {
    const trades = await contract.methods.tradeHistory().call();
    const tradeHistoryElement = document.getElementById('trade-history');
    tradeHistoryElement.innerHTML = '';

    trades.forEach(trade => {
        const tradeItem = document.createElement('li');
        tradeItem.innerText = `Trader: ${trade.trader}, Buy/Sell: ${trade.isBuy ? 'Buy' : 'Sell'}, Amount: ${Web3.utils.fromWei(trade.amount, 'ether')}, Price: ${Web3.utils.fromWei(trade.price, 'ether')} USD`;
        tradeHistoryElement.appendChild(tradeItem);
    });
};

// Fetch data from IPFS (Pinata)
const fetchIPFSData = async () => {
    const ipfsCid = 'bafkreidckjcuyxaypmdkqojq7v2qn7wgc6q5xthatdtapk36aut2kd55eq';  // Example CID from contract
    const response = await axios.get(`${pinataBaseUrl}/pinning/pinList?status=pinned&hash=${ipfsCid}`, {
        headers: {
            'Authorization': `Bearer ${pinataApiKey}`
        }
    });

    const ipfsData = response.data;
    document.getElementById('ipfs-data').innerText = JSON.stringify(ipfsData, null, 2);
};

// Fetch live data
const fetchLiveData = () => {
    fetchLiveUSDValue();
    fetchTradeHistory();
    fetchIPFSData();
};

// Initialize
document.getElementById('connect-btn').addEventListener('click', connectWallet);

// Initialize Contract when Web3 is ready
if (window.ethereum) {
    initContract();
}

import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import {abi} from "./utils/abi.json";

// Constants
const TWITTER_HANDLE = '@queso';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  // Render Methods
  const [currentAccount, setCurrentAccount] = useState("");
  const [minting, setMinting] = useState(false);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
        return
      }
      const accounts = await ethereum.request({method: 'eth_accounts'});

      if(accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
      } else {
        console.log('no account connected');
      }

      console.log("We have the ethereum object", ethereum);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  },[])

  const connectWallet = async () => {
    try{
      const {ethereum} = window;
      if (!ethereum) {
        console.log('not connected');
      }

      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      setCurrentAccount(accounts[0]);

    } catch (e) {
      console.log(e)
    }
  }

  const askContractToMintNft = async () => {
    const CONTRACT_ADDRESS = "0xB93c94f4920f065bCC64bC88f7f180be2072Db5e"

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

        console.log(parseInt(await connectedContract.getMintedNft()), 'here');

        let nftTxn = await connectedContract.makeAnEpicNFT();
        setMinting(true);
        nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        let mintedSupply = parseInt(await connectedContract.getMintedNft());
        let totalSupply = parseInt(await connectedContract.getTotalSupply());

        connectedContract.on("JustMinted", (from, tokenId) => {
          setMinting(false);
          console.log(from, tokenId.toNumber())
          alert(`supply: ${mintedSupply} / ${totalSupply} <br/> link to minted nft <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`)
        })
      } else {
        console.log("no eth")
      }
    } catch (e) {
      console.log(e)
    }
  }
  const renderNotConnectedContainer = () => (
      <>
        {currentAccount === "" ? (
          <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
          </button>
      ) : (
          <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            {minting ? "Minting..." : "Mint NFT" }
          </button>
      )}
      </>

  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;

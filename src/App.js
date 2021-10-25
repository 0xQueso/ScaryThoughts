import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import {abi} from "./utils/abi.json";


const TWITTER_HANDLE = '@queso';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x322B58984ee05f982d95B1C2FeF64D3C85692Cf5"

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [minting, setMinting] = useState(false);
  const [svgContent, setSvgContent] = useState();
  const [openseaLink, setOpenseaLink] = useState();

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
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

        console.log(parseInt(await connectedContract.getMintedNft()), 'here');
        // console.log('bal',provider.getBalance(CONTRACT_ADDRESS).then(b => console.log(parseInt(b))));
        let nftTxn = await connectedContract.makeAnEpicNFT({value: 0.005 * 10**18});
        setMinting(true);
        nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        let mintedSupply = parseInt(await connectedContract.getMintedNft());
        let totalSupply = parseInt(await connectedContract.getTotalSupply());

        connectedContract.on("JustMinted", async (from, tokenId) => {
          setMinting(false);
          let nftTxn = await connectedContract.tokenURI(tokenId.toNumber());
          let obj = (atob(nftTxn.replace("data:application/json;base64,","")));
          setSvgContent(JSON.parse(obj).image);
          setOpenseaLink(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
          console.log(from, tokenId.toNumber());
          alert(`current nft supply: ${mintedSupply + 1} / ${totalSupply}`)
        })
      } else {
        console.log("no eth")
      }
    } catch (e) {
      console.log(e)
    }
  }

  const withdraw = async () => {

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

        let nftTxn = await connectedContract.withdraw();
        nftTxn.wait();
      } else {
        console.log("no eth")
      }
    } catch (e) {
      console.log(e)
    }
  }
  const renderNotConnectedContainer = (msg) => (
      <>
        {currentAccount === "" ? (
          <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
          </button>
      ) : (
          <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            {minting ? "Minting..." : msg }
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
            { svgContent ? "Succesfully minted" : "Each unique. Each beautiful. Discover your NFT today."}
          </p>
          { svgContent &&
          <a
              className="footer-text"
              href={openseaLink}
              target="_blank"
              rel="noreferrer"
          >Opensea link here</a>
          }
          <div>
            {svgContent &&  <img width={350} src={svgContent}/>}

          </div>
          <div>
            {svgContent ? renderNotConnectedContainer("Mint Again") : renderNotConnectedContainer("Mint NFT")}

          </div>


        </div>
        <div className="footer-container">
          { false &&
            <button onClick={withdraw} className="cta-button connect-wallet-button">
              withdraw
            </button>
          }

          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by ${TWITTER_HANDLE}`}</a>

        </div>
      </div>
    </div>
  );
};

export default App;

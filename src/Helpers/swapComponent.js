import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { RangoClient } from "rango-sdk-basic";
import {
  checkApprovalSync,
  checkTransactionStatusSync,
  prepareEvmTransaction,
} from "./utilityFunctions";
import dotenv from "dotenv";
import textStyle from "@/Components/DashboardComponents/SameChain/Type/textify.module.css";
import { fetchFeesFromQuote } from "./fetchFeesFromQuote";
import { useAccount } from "wagmi";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import swapStyle from "@/Components/DashboardComponents/SameChain/swap/swap.module.css";
dotenv.config();

const rangoAPI = process.env.RANGO_API_KEY;
const rangoClient = new RangoClient("95ef894a-f8f0-4eb4-90f7-f8559896474a");

const SwapComponent = ({ selectedFromToken, selectedToToken, formData }) => {
  const [tronAddressInputValue, setTronAddressInputValue] = useState("");
  const {
    isConnected,
    address,
    isDisconnected,
    status,
    isConnecting,
    isReconnecting,
  } = useAccount();
  const { address: TronAddress, connected, wallet } = useWallet();

  const [quote, setQuote] = useState(null);
  console.log(quote);
  console.log(selectedFromToken);
  console.log(selectedToToken);
  console.log(address, isConnected);
  console.log(TronAddress, connected);

  // console.log("from amount:",formData.fromTokenAmount);
  useEffect(() => {
    console.log("fetching quote");
    let toAddressValue = isConnected ? address : TronAddress;
    const fetchQuote = async () => {
      if (!selectedFromToken || !selectedToToken) {
        console.error("Selected tokens are not available.");
        return;
      }
      console.log(selectedFromToken, selectedToToken);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const swapRequest = {
        from: {
          blockchain: selectedFromToken.blockchain,
          symbol: selectedFromToken.symbol,
          address: selectedFromToken.address,
        },
        to: {
          blockchain: selectedToToken.blockchain,
          symbol: selectedToToken.symbol,
          address: selectedToToken.address,
        },
        // from: selectedFromToken,
        // to: selectedToToken,
        amount: "100000",
        fromAddress: connected ? TronAddress : address,
        // toAddress: "0x5428DAc9103799F18eb6562eD85e48E0790D4643",
        toAddress: toAddressValue,
        slippage: "1.0",
        disableEstimate: false,
        referrerAddress: null,
        referrerFee: null,
      };

      console.log("swap", swapRequest.amount);
      const swap = await rangoClient.swap(swapRequest);
      if (!!swap.error || swap.resultType !== "OK") {
        console.log("ifffffff");
        const msg = `Error swapping, message: ${swap.error}, status: ${swap.resultType}`;
        throw new Error(msg);
      }

      setQuote(swap);
      console.log("Swap quote: ", quote);
    };

    const fetchFeesFromQuote = () => {
      console.log("fetch fees.... : ");
      if (!quote || !quote.route || !quote.route.feeUsd) {
        // throw new Error("Quote is not available or fees are missing.");
        console.error("Quote is not available or fees are missin.");
        return;
      }
      
      const feeusd = quote.route.feeUsd;
      console.log("Feeusd in swap componenet:", feeusd);
      setFeeUsd(feeusd);
    };
    
    
    fetchQuote();
    fetchFeesFromQuote();

  }, [selectedFromToken, selectedToToken]);

  const handleSwap = async () => {
    console.log("swap btn clicked");
    if (!quote) return;
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const evmTransaction = quote.tx;
      console.log("1");
      // needs approving the tx
      if (quote.approveTo && quote.approveData) {
        const approveTx = prepareEvmTransaction(evmTransaction, true);
        const approveTxHash = (await signer.sendTransaction(approveTx)).hash;
        await checkApprovalSync(quote.requestId, approveTxHash, rangoClient);
      }
      console.log("12");

      // main transaction
      const mainTx = prepareEvmTransaction(evmTransaction, false);
      const mainTxHash = (await signer.sendTransaction(mainTx)).hash;
      const txStatus = await checkTransactionStatusSync(
        quote.requestId,
        mainTxHash,
        rangoClient
      );
      console.log("txstatus: ", txStatus);
    }
  };

  return (
    <div>
      <div className={swapStyle.inputswapbtndiv}>
      {selectedToToken && selectedToToken.blockchain === "TRON" && (
        <input
          type="text"
          value={tronAddressInputValue}
          onChange={(e) => setTronAddressInputValue(e.target.value)}
          placeholder="Enter TRON address"
          className={swapStyle.inputtronaddress}
        />
      )}
      <button
        style={{ margin: "10px" }}
        className={textStyle.sendbutton}
        onClick={handleSwap}
      >
        Swap Token
      </button>
      </div>
    </div>
  );
};

export default SwapComponent;

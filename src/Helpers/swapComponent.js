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
// import { fetchFeesFromQuote } from "./fetchFeesFromQuote";
import { useAccount } from "wagmi";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import swapStyle from "@/Components/DashboardComponents/SameChain/swap/swap.module.css";
dotenv.config();

const rangoAPI = process.env.RANGO_API_KEY;
const rangoClient = new RangoClient("95ef894a-f8f0-4eb4-90f7-f8559896474a");

const SwapComponent = ({
  selectedFromToken,
  selectedToToken,
  setusdfee,
  fromTokenAmount,
  setestimatetime,
  setoutputusd,
  formData,
  setfromusdvalue,
  setFormData,
}) => {
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

  // console.log("from amount:",formData.fromTokenAmount);
  useEffect(() => {
    console.log("from token value", formData.fromTokenAmount);
    console.log(quote, "🚀");
    let fromAmt = 0;
    if (formData.fromTokenAmount && selectedFromToken && selectedToToken) {
      if (formData.fromTokenAmount) {
        fromAmt = ethers.utils
          .parseUnits(formData.fromTokenAmount, 6)
          .toString();
      }
      console.log(fromAmt);

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
          amount: fromAmt,
          fromAddress: connected ? TronAddress : address,
          toAddress: "0x5428DAc9103799F18eb6562eD85e48E0790D4643",
          // toAddress: toAddressValue,
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
        const feeUsd = swap.route.feeUsd;
        const outputAmount = swap.route.outputAmount;
        var outputAmountFormatted = 0;
        if(selectedToToken.symbol === 'ETH') outputAmountFormatted = ethers.utils.formatUnits(outputAmount, 18);
        else outputAmountFormatted = ethers.utils.formatUnits(outputAmount, 6);
        console.log(outputAmountFormatted,outputAmount,"👁️👁️")
        // ----------------------------
        var outputAmountFormatted = 0;
        if(selectedToToken.symbol === 'ETH') outputAmountFormatted = ethers.utils.formatUnits(outputAmount, 18);
        else outputAmountFormatted = ethers.utils.formatUnits(outputAmount, 6);
        console.log(outputAmountFormatted,outputAmount,"👁️👁️")
        setFormData((prevData) => ({
          ...prevData,
          ["toTokenAmount"]: outputAmountFormatted,
        }));
        const outputAmountMin = swap.route.outputAmountMin;
        const outputAmountUsd = swap.route.outputAmountUsd;
        const formatTime = (totalSeconds) => {
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };
        
        const estimatedTimeInSeconds = swap.route.estimatedTimeInSeconds;
        const formattedTime = formatTime(estimatedTimeInSeconds);
        const usdprice = swap.route.path[0].from.usdPrice;
        setfromusdvalue(usdprice);
        console.log(usdprice)
        console.log(formattedTime);        
        setestimatetime(formattedTime);
        console.log("Fees in USD:", feeUsd);
        setusdfee(feeUsd);
        console.log("Output Amount:", outputAmount);
        console.log("Minimum Output Amount:", outputAmountMin);
        console.log("Output Amount in USD:", outputAmountUsd);
        setoutputusd(outputAmountUsd);
        console.log("Estimated Time (seconds):", estimatedTimeInSeconds);
        console.log("Swap quote: ", swap);
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
        // setFeeUsd(feeusd);
      };

      fetchQuote();
      fetchFeesFromQuote();
    }
  }, [selectedFromToken, selectedToToken, formData.fromTokenAmount]);

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

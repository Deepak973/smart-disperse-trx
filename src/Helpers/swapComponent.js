import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { RangoClient, TransactionStatus } from "rango-sdk-basic";
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
import { ToastContainer, toast } from "react-toastify";
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
  const [toTokenInputValue, setToTokenInputValue] = useState("");
  const {
    isConnected,
    address,
    isDisconnected,
    status,
    isConnecting,
    isReconnecting,
  } = useAccount();
  const { address: TronAddress, connected, wallet } = useWallet();
  const [swapstatus, setswapstatus] = useState("Begin payment");
  const [quote, setQuote] = useState(null);

  // console.log("from amount:",formData.fromTokenAmount);
  useEffect(() => {
    console.log("from token value", formData.fromTokenAmount);
    console.log(quote, "🚀");
    var fromAmt = 0;
    if (formData.fromTokenAmount && selectedFromToken && selectedToToken) {
      if (formData.fromTokenAmount) {
        fromAmt = formData.fromTokenAmount;
        let decimalIndex = fromAmt.indexOf(".");
        console.log(decimalIndex, "deciamalsindex");
        // console.log(fromAmt.substring(decimalIndex + 1).length, "1234");
        // Check if there is a decimal point and if the length of the decimal part is greater than six
        if (
          decimalIndex === -1 ||
          fromAmt.substring(decimalIndex + 1).length <= 6
        ) {
          fromAmt = ethers.utils.parseUnits(fromAmt, 6).toString();
          console.log(fromAmt);
        } else {
          toast.error("Please Enter amount greater than 6 decimals");
        }
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
          toAddress: toTokenInputValue,
          // toAddress: toAddressValue,
          slippage: "1.0",
          disableEstimate: false,
          referrerAddress: null,
          referrerFee: null,
        };

        console.log("swap", swapRequest);
        const swap = await rangoClient.swap(swapRequest);
        if (!!swap.error || swap.resultType !== "OK") {
          const msg = `Error swapping, message: ${swap.error}, status: ${swap.resultType}`;

          console.log(swap.error);
          if (swap.error.substring(0, 5) === "Rango") {
            toast.error(
              "Price Impact is very high, Smart Disperse prohibits you from performing this swap!"
            );
          } else toast.error(swap.error);
        }

        setQuote(swap);
        const feeUsd = swap.route.feeUsd;
        const outputAmount = swap.route.outputAmount;
        var outputAmountFormatted = 0;
        if (selectedToToken.symbol === "ETH")
          outputAmountFormatted = ethers.utils.formatUnits(outputAmount, 18);
        else outputAmountFormatted = ethers.utils.formatUnits(outputAmount, 6);
        console.log(outputAmountFormatted, outputAmount, "👁️👁️");
        // ----------------------------
        var outputAmountFormatted = 0;
        if (selectedToToken.symbol === "ETH")
          outputAmountFormatted = ethers.utils.formatUnits(outputAmount, 18);
        else outputAmountFormatted = ethers.utils.formatUnits(outputAmount, 6);
        console.log(outputAmountFormatted, outputAmount, "👁️👁️");
        setFormData((prevData) => ({
          ...prevData,
          ["toTokenAmount"]: outputAmountFormatted,
        }));
        const outputAmountMin = swap.route.outputAmountMin;
        const outputAmountUsd = swap.route.outputAmountUsd;
        const formatTime = (totalSeconds) => {
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          return `${minutes < 10 ? "0" : ""}${minutes}:${
            seconds < 10 ? "0" : ""
          }${seconds}`;
        };

        const estimatedTimeInSeconds = swap.route.estimatedTimeInSeconds;
        const formattedTime = formatTime(estimatedTimeInSeconds);
        const usdprice = swap.route.path[0].from.usdPrice;
        setfromusdvalue(usdprice);
        console.log(usdprice);
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

  const getToAddress = () => {
    if (
      selectedFromToken &&
      selectedToToken &&
      selectedFromToken.blockchain === "TRON" &&
      selectedToToken.blockchain === "TRON"
    ) {
      return TronAddress;
    } else {
      return address;
    }
  };

 const handleSwap = async () => {
  console.log("swap btn clicked");
  try {
    if (!quote) return;
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const evmTransaction = quote.tx;
      console.log("1");
      // Set toAddress based on selected tokens' blockchains
      let toAddress;
      if (
        selectedFromToken &&
        selectedToToken &&
        selectedFromToken.blockchain === "TRON" &&
        selectedToToken.blockchain === "TRON"
      ) {
        toAddress = TronAddress;
      } else {
        toAddress = address;
      }
      
      // Update swap request object with the correct toAddress
      evmTransaction.toAddress = toAddress;

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
      while (true) {
        const txStatus = await checkTransactionStatusSync(
          quote.requestId,
          mainTxHash,
          rangoClient
        );
        console.log("txstatus: ", txStatus.status);
        setswapstatus(txStatus.status);
        if (
          !!txStatus.status &&
          [TransactionStatus.FAILED, TransactionStatus.SUCCESS].includes(
            txStatus.status
          )
        ) {
          console.log(txStatus.status);
          setswapstatus(txStatus.status);
          break;
        }
      }
    }
  } catch (error) {
    console.log("error", error);
    toast.error(error);
  }
};

  return (
    <div>
      <div className={swapStyle.inputswapbtndiv}>
      {selectedToToken &&
          selectedToToken.blockchain === "TRON" &&
          selectedFromToken &&
          selectedFromToken.blockchain !== "TRON" && (
            <div className={swapStyle.inputswapbtndiv}>
              <input
                type="text"
                value={toTokenInputValue}
                onChange={(e) => setToTokenInputValue(e.target.value)}
                placeholder="Enter TRON address"
                className={swapStyle.inputtronaddress}
              />
            </div>
          )}
        {selectedToToken &&
          selectedToToken.blockchain !== "TRON" &&
          selectedFromToken &&
          selectedFromToken.blockchain === "TRON" && (
            <div className={swapStyle.inputswapbtndiv}>
              <input
                type="text"
                value={toTokenInputValue}
                onChange={(e) => setToTokenInputValue(e.target.value)}
                placeholder="Enter EVM address"
                className={swapStyle.inputtronaddress}
              />
            </div>
          )}

        <button
          style={{ margin: "10px" }}
          className={textStyle.sendbutton}
          onClick={handleSwap}
        >
          {swapstatus }
        </button>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default SwapComponent;

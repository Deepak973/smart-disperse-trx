import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { RangoClient } from 'rango-sdk-basic';
import textStyle from "@/Components/DashboardComponents/SameChain/Type/textify.module.css";
import { checkApprovalSync, checkTransactionStatusSync, prepareEvmTransaction } from './utilityFunctions';
import dotenv from 'dotenv';
dotenv.config();

const rangoAPI = process.env.RANGO_API_KEY;
const rangoClient = new RangoClient("95ef894a-f8f0-4eb4-90f7-f8559896474a");


const SwapComponent = ({selectedFromToken,selectedToToken}) => {
  const [quote, setQuote] = useState(null);
  console.log(quote);
  console.log(selectedFromToken);
  console.log(selectedToToken)
  useEffect(() => {
    const fetchQuote = async () => {
      console.log(selectedFromToken,selectedToToken);
      console.log("in fetchquote..")
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const swapRequest = {
        // from: {
        //   "blockchain": "BSC",
        //   "symbol": "BNB",
        //   "address": null
        // },
        // to: {
        //   "blockchain": "AVAX_CCHAIN",
        //   "symbol": "USDT.E",
        //   "address": "0xc7198437980c041c805a1edcba50c1ce5db95118"
        // },
        from: selectedFromToken,
        to: selectedToToken,
        amount: "100000000000000000",
        fromAddress: "0x2131A6c0b66bE63E38558dC5fbe4C0ab65b9906e",
        toAddress: "0x5428DAc9103799F18eb6562eD85e48E0790D4643",
        slippage: '1.0',
        disableEstimate: false,
        referrerAddress: null,
        referrerFee: null,
      };
      console.log("swaprequest", swapRequest);
      const swap = await rangoClient.swap(swapRequest);
      console.log("swaprequest", swap);

      if (!!swap.error || swap.resultType !== 'OK') {
        const msg = `Error swapping, message: ${swap.error}, status: ${swap.resultType}`;
        throw new Error(msg);
      }

      setQuote(swap);
      console.log("Swap quote: ", quote);
    };

    fetchQuote();
  }, [selectedFromToken,selectedToToken]);

  const handleSwap = async () => {
    console.log("swap btn clicked")
    if (!quote) return;
    const {ethereum} =window;
    if(ethereum){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const evmTransaction = quote.tx;
        console.log("1")
    // needs approving the tx
    if (quote.approveTo && quote.approveData) {
      const approveTx = prepareEvmTransaction(evmTransaction, true);
      const approveTxHash = (await signer.sendTransaction(approveTx)).hash;
      await checkApprovalSync(quote.requestId, approveTxHash, rangoClient);
    }
    console.log("12")

    // main transaction
    const mainTx = prepareEvmTransaction(evmTransaction, false);
    const mainTxHash = (await signer.sendTransaction(mainTx)).hash;
    const txStatus = await checkTransactionStatusSync(quote.requestId, mainTxHash, rangoClient);
    console.log(txStatus);
  };}

  return (
    <div>
      <button style={{margin:"10px"}} className={textStyle.sendbutton} onClick={handleSwap}>Swap Token</button>
    </div>
  );
};

export default SwapComponent;

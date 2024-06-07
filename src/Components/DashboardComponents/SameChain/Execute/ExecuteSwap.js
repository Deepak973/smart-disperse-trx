"use client";
import React, { useEffect, useState } from "react";
import { smartDisperseInstance } from "@/Helpers/ContractInstance";
import textStyle from "../Type/textify.module.css";
import contracts from "@/Helpers/ContractAddresses.js";
import { ethers } from "ethers";
import Modal from "react-modal";
import { approveToken, tronapprovetoken } from "@/Helpers/ApproveToken";
import Image from "next/image";
import oopsimage from "@/Assets/oops.webp";
import bggif from "@/Assets/bp.gif";
import completegif from "@/Assets/complete.gif";
import confetti from "canvas-confetti";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faPaperPlane,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import {
  useWallet,
  WalletProvider,
} from "@tronweb3/tronwallet-adapter-react-hooks";
import { useAccount, useChainId, useNetwork } from "wagmi";
import { TronContractInstance } from "@/Helpers/troncontractinstance";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";

const ConfettiScript = () => (
  <Head>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.0.1/confetti.min.js"></script>
  </Head>
);

function ExecuteSwap(props) {
  const [message, setMessage] = useState(""); //manage message to display in popup
  const [isModalIsOpen, setModalIsOpen] = useState(false); //Control modal visibility state
  const [success, setSuccess] = useState(false); //If transaction was successful or not
  const [paymentmodal, setPaymentmodal] = useState(false);
  const [limitexceed, setLimitexceed] = useState(null);
  const chainId = useChainId();
  const { address: TronAddress, connected, wallet } = useWallet();
  const [aprrovetoken, setAprrovetoken] = useState(false);
  const [getTronnetwork, settronNetwork] = useState();
  const [loading, setLoading] = useState(false); //indicate whether a request is being processed or not
  const [balancenosame, setBalancenotsame] = useState(false);
  const sendTweet = () => {
    console.log("tweeting");
    const tweetContent = `Just used @SmartDisperse to transfer to multiple accounts simultaneously across the same chain! Transferring to multiple accounts simultaneously has never been easier. Check out Smart Disperse at https://smartdisperse.xyz/ and simplify your crypto transfers today!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetContent
    )}`;
    window.open(twitterUrl, "_blank");
  };

  useEffect(() => {
    console.log("chainid....");
    const getChainId = async () => {
      if (typeof window !== "undefined") {
        const { tronWeb } = window;
        const adapter = new TronLinkAdapter();
        let net = await adapter.network();
        console.log(net);
        console.log(net.networkType);
        const tronnetwork = net.networkType;
        settronNetwork(tronnetwork);
      }
    };
    getChainId();
  }, []);

  const execute = async () => {
    setPaymentmodal(true);

    setLoading(true);

    if (props.TRC20Balance.eq(props.totalTRC20)) {
      console.log(props.totalTRC20, props.TRC20Balance);
      console.log(props.TRC20Balance.eq(props.totalTRC20));
      setBalancenotsame(false);

      var recipients = [];
      var values = [];
      for (let i = 0; i < props.listData.length; i++) {
        recipients.push(props.listData[i]["address"]);
        values.push(props.listData[i]["value"]);
        console.log(props.listData[i]["value"]);
      }
      try {
        if (TronAddress) {
          console.log(props.maximumSold);
          const isTokenApproved = await tronapprovetoken(
            props.maximumSold,
            props.selectedFromToken.address,
            getTronnetwork
          );
          // const isTokenApproved = true;
          if (isTokenApproved) {
            const con = await TronContractInstance(getTronnetwork);
            try {
              console.log(recipients, values);
              let path = [
                props.selectedFromToken.address,
                props.selectedToToken.address,
              ];
              let toTokenValue = ethers.utils.parseUnits(
                props.toTokenAmount,
                6
              );
              console.log("toTokenValue", toTokenValue);
              console.log("path", path);
              console.log("maximumSold", props.maximumSold);
              console.log("recipients", recipients);
              console.log("values", values);

              let tx = await con
                .swapAndDisperseTokenToToken(
                  toTokenValue,
                  path,
                  props.maximumSold,
                  recipients,
                  values
                )
                .send({ feeLimit: 15000000000 });
              setLoading(false);
              const link = `https://${getTronnetwork}.tronscan.org/#/transaction/${tx}`;
              setMessage(
                <div
                  className={textStyle.Link}
                  dangerouslySetInnerHTML={{
                    __html: `Your Transaction was successful. Visit <a href="https://${getTronnetwork}.tronscan.org/#/transaction/${tx}" target="_blank">here</a> for details.`,
                  }}
                />
              );
              setModalIsOpen(true);
              setSuccess(true);
            } catch (e) {
              console.log("error", e);
            }
          } else {
            setLoading(false);
            setMessage("Approval Rejected");
            setModalIsOpen(true);
            return;
          }
        }
      } catch (e) {
        setLoading(false);
        console.log("error", e);
        setMessage("Transaction Rejected");
        setModalIsOpen(true);
        return;
      }
    } else {
      setLoading(false);
      console.log("bal not same");
      console.log(
        props.totalTRC20,
        props.TRC20Balance,
        props.tokenDetails.decimals
      );
      setBalancenotsame(true);
      setMessage(
        `Swap balance and total sending balance do not match .Your Total Sending Amount is ${(+ethers.utils.formatUnits(
          props.totalTRC20,
          props.tokenDetails.decimals
        )).toFixed(4)} ${
          props.tokenDetails.symbol
        }   and your Swap Balance amount is ${(+ethers.utils.formatUnits(
          props.TRC20Balance,
          props.tokenDetails.decimals
        )).toFixed(4)} ${props.tokenDetails.symbol} `
      );
      setModalIsOpen(true);
      return;
    }
  };

  // Function to get explorer URL based on chain
  const getExplorer = async () => {
    return contracts[chainId]["block-explorer"];
  };
  useEffect(() => {
    if (success) {
      const count = 500,
        defaults = {
          origin: { y: 0.7 },
        };

      function fire(particleRatio, opts) {
        confetti(
          Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
          })
        );
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [success]); // Trigger confetti effect when success state changes

  return (
    <div>
      {" "}
      <button
        id={textStyle.greenbackground}
        className={textStyle.sendbutton}
        onClick={() => {
          execute();
        }}
        disabled={loading}
      >
        {loading ? (
          <div>
            <Modal
              className={textStyle.popupforpayment}
              isOpen={paymentmodal}
              onRequestClose={() => setPaymentmodal(false)}
              contentLabel="Error Modal"
            >
              <h2>Please wait...</h2>
              <Image src={bggif.src} alt="not found" width={150} height={150} />
              <p>We are securely processing your payment.</p>
            </Modal>
          </div>
        ) : (
          "Begin Payment"
        )}
      </button>
      <Modal
        className={textStyle.popupforpayment}
        isOpen={isModalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Error Modal"
      >
        {message ? (
          <>
            <h2>
              {success
                ? "Woo-hoo! All your transactions have been successfully completed with just one click! 🚀"
                : "Something went Wrong..."}
            </h2>
            <div>
              {success ? (
                <div>
                  <Image
                    src={completegif}
                    alt="not found"
                    width={150}
                    height={150}
                  />
                  <p>{message}</p>
                  <div>
                    Why not extend the excitement? Invite your friends and
                    followers on Twitter to join in the joy. Broadcast your
                    seamless experience to the world. Click the tweet button
                    below and spread the cheer instantly! 🌐✨
                  </div>
                </div>
              ) : (
                <div>
                  <Image
                    src={oopsimage}
                    alt="not found"
                    width={150}
                    height={150}
                  />
                </div>
              )}
            </div>
            <p>{success ? "" : "Please Try again"}</p>
            {balancenosame ? (
              <div className={textStyle.errormessagep}>{message}</div>
            ) : null}
            <p className={textStyle.errormessagep}>{limitexceed}</p>
            <div className={textStyle.divtocenter}>
              <button style={{ margin: "0px 5px" }} onClick={sendTweet}>
                Tweet Now &nbsp; <FontAwesomeIcon icon={faPaperPlane} />
              </button>
              <button
                style={{ margin: "0px 5px" }}
                onClick={() => {
                  setModalIsOpen(false);
                  props.setListData([]);
                }}
              >
                Close &nbsp; <FontAwesomeIcon icon={faX} />
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Notice</h2>
            {/* <p>{alertMessage}</p> */}
            <div className={textStyle.divtocenter}>
              <button onClick={() => setModalIsOpen(false)}>Close</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default ExecuteSwap;

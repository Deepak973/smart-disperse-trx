import React, { useState, useEffect } from "react";
import textStyle from "../Type/textify.module.css";
import swapStyle from "./swap.module.css";
import text from "../../../../Assets/text-editor.png";
import Image from "next/image";
import down from "../../../../Assets/down.png";

function Swap() {
  const [isModalIsOpen, setModalIsOpen] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [tokenlogourl, setTokenurl] = useState([]);

  useEffect(() => {
    console.log("fetching...");
    // Fetch token list from the API
    const fetchTokenList = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json"
        );
        const data = await response.json();
        console.log("token api data:", data);
        const names = data.tokens.map((token) => token.name);
        const logourl = data.tokens.map((tokenn) => tokenn.logoURI);
        setTokenList(names);
        setTokenurl(logourl);
      } catch (error) {
        console.error("Error fetching token list:", error);
      }
    };

    const getAmountIn = () => {};

    fetchTokenList();
  }, []);

  const handletokens = () => {
    console.log("handle token clicked");
    setModalIsOpen(true);
  };
  return (
    <div>
      <div className={textStyle.titlesametexttextarea}>
        <h2
          style={{
            padding: "10px",
            letterSpacing: "1px",
            fontSize: "20px",
            margin: "0px",
            fontWeight: "700",
          }}
        >
          Swapping
        </h2>
      </div>
      <div
        id="seend-eth"
        style={{
          padding: "30px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className={textStyle.sametextmain}
      >
        <div className={swapStyle.maindivofswap}>
          <div className={swapStyle.swapMain}>
            <div className={swapStyle.FromToMain}>
              <div className={swapStyle.swapCurrencyInput}>
                <div className={swapStyle.FromMain}>
                  <div className={swapStyle.FromBal}>
                    <div className={swapStyle.FromBalFlex}>
                      <div className={swapStyle.From}>From</div>
                      <div className={swapStyle.Balance}>Balance: 0.0</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={swapStyle.FromInputMain}>
              <input
                type="text"
                autoCorrect="off"
                minLength={1}
                maxLength={79}
                placeholder="Enter Amount"
                className={swapStyle.swapInput}
              />
              <button id={swapStyle.swapMaxbtn}>Max</button>
              <button className={swapStyle.TokenMain}>
                <span className={swapStyle.TokenSpanMain}>
                  <Image src={text} />
                  <span className={swapStyle.tokenName}>Eth</span>
                  <Image src={down} />
                </span>
              </button>
            </div>
            <div
              style={{
                color: "white",
                textAlign: "left",
                padding: "0 0.75rem 0.75rem 1rem",
                fontSize: "14px",
              }}
            >
              price
            </div>
            <div
              style={{
                borderBottom: "1px solid white",
                width: "95%",
                margin: "0 auto",
              }}
            ></div>
            <div className={swapStyle.FromToMain}>
              <div className={swapStyle.swapCurrencyInput}>
                <div className={swapStyle.FromMain}>
                  <div className={swapStyle.FromBal}>
                    <div className={swapStyle.FromBalFlex}>
                      <div className={swapStyle.From}>To</div>
                      <div className={swapStyle.Balance}>Balance:</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={swapStyle.FromInputMain}>
              <input
                type="text"
                autoCorrect="off"
                minLength={1}
                maxLength={79}
                placeholder="0.0"
                className={swapStyle.swapInput}
              />
              <button id={swapStyle.swapMaxbtn}>Max</button>
              <button className={swapStyle.TokenMain}>
                <span className={swapStyle.TokenSpanMain}>
                  <Image src={text} />
                  <span className={swapStyle.tokenName}>Eth</span>
                  <Image src={down} />
                </span>
              </button>
            </div>
            <div
              style={{
                color: "white",
                textAlign: "left",
                padding: "0 0.75rem 0 1rem",
                fontSize: "14px",
              }}
            >
              price
            </div>
            <div className={swapStyle.SwapBtnMain}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Swap;

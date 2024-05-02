import React, { useState, useEffect } from "react";
import textStyle from "../CrossChain/Type/textify.module.css";
import CrossChain from './CrossChain';
import swapStyle from "@/Components/DashboardComponents/SameChain/swap/swap.module.css";
import { FetchMeta } from "@/Helpers/FetchMeta";
import { RangoClient } from "rango-sdk-basic";


function Crossswap({activeTab,setErrorModalIsOpen,errorModalIsOpen}) {


  // State variables for showing Drop Down of Tokens and Chains
  const [chainList, setChainList] = useState([]);
  const [tokenList, setTokenList] = useState([]);

  
  useEffect(()=>{
    const handleFetchMeta = async () => {
          const meta = await FetchMeta(); // Calling RangoClient MetaData functio
          
        // }
        // catch(error){
        //   console.log("catch block")
        //   console.error("Error Fetching MetaData...", error);
        // }
    }
    console.log("calling")
    handleFetchMeta();
  },[]);

  return (
    <div className={textStyle.divtocoversametextdv}>
      <div>
        <div className={textStyle.divforwholetoken}>
          <div className={textStyle.titleloadtokensametext}>
            <h2
              style={{
                padding: "10px",
                letterSpacing: "1px",
                fontSize: "20px",
                margin: "0px",
                fontWeight: "700",
              }}
            >
              Cross Swapping
            </h2>
          </div>
          <div>
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
              <button className={swapStyle.swapMax}>Max</button>
              
              <div className={swapStyle.TokenMain}>
                {/* TOKEN LIST DROPDOWN */}
              <select className={swapStyle.dropdown}>
                {tokenList.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
              {/* CHAINLIST DROPDOWN */}
              <select className={swapStyle.dropdown}>
                {tokenList.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
              </div>
            </div>
            <div
              style={{
                color: "#8A8F9D",
                textAlign: "left",
                padding: "0 0.75rem 0 1rem",
                fontSize: "14px",
              }}
            >
              price
            </div>
            <div className={swapStyle.FromToMain}>
              <div className={swapStyle.swapCurrencyInput}>
                <div className={swapStyle.FromMain}>
                  <div className={swapStyle.FromBal}>
                    <div className={swapStyle.FromBalFlex}>
                      <div className={swapStyle.From}>To(estimated)</div>
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
                placeholder="0.0"
                className={swapStyle.swapInput}
              />
              <button className={swapStyle.swapMax}>Max</button>
              <div  className={swapStyle.TokenMain}>
              <select className={swapStyle.dropdown}>
    <option value="token1">Token 1</option>
    <option value="token2">Token 2</option>
  </select>
  <select className={swapStyle.dropdown}>
    <option value="chain1">Chain 1</option>
    <option value="chain2">Chain 2</option>
  </select>
              </div>
            </div>
            <div
              style={{
                color: "#8A8F9D",
                textAlign: "left",
                padding: "0 0.75rem 0 1rem",
                fontSize: "14px",
              }}
            >
              price
            </div>

            <div className={swapStyle.SwapBtnMain}>
            </div>
          </div>
        </div>
      </div>
    </div>
          </div>
          </div>
          <CrossChain
          activeTab={activeTab}
          />
    </div>
  )
}

export default Crossswap

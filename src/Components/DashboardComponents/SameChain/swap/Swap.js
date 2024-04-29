"use client";
import React, { useState, useEffect } from "react";
import textStyle from "../Type/textify.module.css";
import swapStyle from "./swap.module.css";
import text from "../../../../Assets/text-editor.png";
import Image from "next/image";
import down from "../../../../Assets/down.png";
import Modal from "react-modal";
import samechainStyle from "@/Components/Dashboard/samechaindashboard.module.css";
import TronWeb from "tronweb";
import {
  useWallet,
  WalletProvider,
} from "@tronweb3/tronwallet-adapter-react-hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRetweet, faXmark } from "@fortawesome/free-solid-svg-icons";
import nodata from "@/Assets/nodata.png";
import { formatUnits } from "ethers/lib/utils";
function Swap() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFromToken, setSelectedFromToken] = useState(null);
  const [selectedToToken, setSelectedToToken] = useState(null);
  const [tokenBalances, setTokenBalances] = useState({});
  const [fromTokenAmount, setFromTokenAmount] = useState("");
  const [toTokenAmount, setToTokenAmount] = useState("");
  const { address: Tronaddress, connected } = useWallet();
  const [currentSection, setCurrentSection] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);
  const tokenList = [
    { name: "USDC", address: "TEMVynQpntMqkPxP6wXTW2K7e4sM3cRmWz" },
    { name: "USDT", address: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf" },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const handleMaxFromAmount = () => {
    if (selectedFromToken) {
      setFromTokenAmount(
        parseInt(tokenBalances[selectedFromToken.address]),
        16
      );
      console.log(tokenBalances[selectedFromToken.address]);
    }
  };

  // Function to filter tokens based on search query
  const filteredTokenList = tokenList.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMaxToAmount = () => {
    if (selectedToToken) {
      setToTokenAmount(
        parseInt(tokenBalances[selectedToToken.address]._hex, 16)
      );
    }
  };

  const fetchTronTokenBalance = async (tokenAddress) => {
    console.log("fetching");
    if (typeof window !== "undefined") {
      const { tronWeb } = window;
      try {
        console.log(Tronaddress);
        const tronTokenContractInstance = await tronWeb
          .contract()
          .at(tokenAddress);
        console.log(tronTokenContractInstance);
        const balance = await tronTokenContractInstance
          .balanceOf(Tronaddress)
          .call();
        console.log(balance);
        console.log(parseInt(balance, 10));

        setTokenBalances((prevBalances) => ({
          ...prevBalances,
          [tokenAddress]: balance,
        }));
      } catch (error) {
        console.error("Error fetching Tron token balance:", error);
      }
    }
  };

  const handleOpenModal = (section) => {
    setCurrentSection(section); // Set the current section when opening the modal
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // const handleTokenSelection = async(token) => {
  //   if (currentSection === "from") {
  //     setSelectedFromToken(token);
  //     await fetchTronTokenBalance(token.address);
  //   } else if (currentSection === "to") {
  //    await  setSelectedToToken(token);
  //   }
  //   setModalOpen(false);
  // };

  const handleTokenSelection = (token) => {
    if (currentSection === "from") {
      setSelectedFromToken(token);
    } else if (currentSection === "to") {
      setSelectedToToken(token);
    }
    setModalOpen(false);
  };

  useEffect(() => {
    console.log(".......");
    if (isModalOpen && selectedFromToken) {
      console.log("fffff");
      fetchTronTokenBalance(selectedFromToken.address);
      console.log(selectedFromToken.address);
    } else if (isModalOpen && currentSection === "to" && selectedToToken) {
      console.log("toooooo");
      fetchTronTokenBalance(selectedToToken.address);
      console.log(selectedToToken.address);
    }
  }, [isModalOpen, currentSection, selectedFromToken, selectedToToken]);

  const handleSwap = () => {
    const tempSelectedToken = selectedFromToken;
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(tempSelectedToken);

    setFromTokenAmount(toTokenAmount);
    setToTokenAmount(fromTokenAmount);
    setIsSwapped(!isSwapped);
  };

  // Helper function to check if a token is selected in the "from" section
  const isTokenSelectedInFrom = (token) => {
    return selectedFromToken && token.address === selectedFromToken.address;
  };

  // Helper function to check if a token is selected in the "to" section
  const isTokenSelectedInTo = (token) => {
    return selectedToToken && token.address === selectedToToken.address;
  };

  // Helper function to check if a token is selected in either "from" or "to" section
  const isTokenSelected = (token) => {
    return isTokenSelectedInFrom(token) || isTokenSelectedInTo(token);
  };

  const handleClearSelection = () => {
    if (currentSection === "from") {
      setSelectedFromToken(null);
    } else if (currentSection === "to") {
      setSelectedToToken(null);
    }
    handleCloseModal();
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
            {/* "from" section start here */}
            <div className={swapStyle.tofromdiv}>
              <div className={swapStyle.FromToMain}>
                <div className={swapStyle.swapCurrencyInput}>
                  <div className={swapStyle.FromMain}>
                    <div className={swapStyle.FromBal}>
                      <div className={swapStyle.FromBalFlex}>
                        <div className={swapStyle.From}>From</div>
                        <div className={swapStyle.Balance}>
                          {selectedFromToken &&
                          tokenBalances[selectedFromToken.address] !==
                            undefined ? (
                            <div>
                              Balance:{" "}
                              {parseFloat(
                                formatUnits(
                                  tokenBalances[selectedFromToken.address],
                                  6
                                )
                              ).toFixed(6)}
                            </div>
                          ) : (
                            <div>Balance: Loading...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={swapStyle.FromInputMain}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter Amount"
                  className={swapStyle.swapInput}
                  value={fromTokenAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d+$/.test(value) || value === "") {
                      setFromTokenAmount(value);
                    }
                  }}
                />

                <button id={swapStyle.swapMaxbtn} onClick={handleMaxFromAmount}>
                  Max
                </button>
                <button
                  className={swapStyle.TokenMain}
                  onClick={() => handleOpenModal("from")}
                >
                  <span className={swapStyle.TokenSpanMain}>
                    {/* Display selected token name or placeholder in the button */}
                    <span className={swapStyle.tokenName}>
                      {selectedFromToken
                        ? selectedFromToken.name
                        : "Select Token"}
                    </span>
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
            </div>
            {/* "from" section end here */}

            <div
              className={`${swapStyle.swaButton} ${
                isSwapped ? swapStyle.rotate : ""
              }`}
            >
              <button className={swapStyle.swapButton} onClick={handleSwap}>
                <FontAwesomeIcon icon={faRetweet} />
              </button>
            </div>

            {/* "to" section start here */}

            <div className={swapStyle.tofromdiv}>
              <div className={swapStyle.FromToMain}>
                <div className={swapStyle.swapCurrencyInput}>
                  <div className={swapStyle.FromMain}>
                    <div className={swapStyle.FromBal}>
                      <div className={swapStyle.FromBalFlex}>
                        <div className={swapStyle.From}>To</div>
                        <div className={swapStyle.Balance}>
                          {selectedToToken &&
                          tokenBalances[selectedToToken.address] !==
                            undefined ? (
                            <div>
                              Balance:{" "}
                              {parseFloat(
                                formatUnits(
                                  tokenBalances[selectedToToken.address],
                                  6
                                )
                              ).toFixed(6)}
                            </div>
                          ) : (
                            <div>Balance: Loading...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={swapStyle.FromInputMain}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.0"
                  className={swapStyle.swapInput}
                  value={toTokenAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Ensure only numeric input is accepted
                    if (/^\d*\.?\d+$/.test(value) || value === "") {
                      setToTokenAmount(value);
                    }
                  }}
                />

                {/* <button id={swapStyle.swapMaxbtn} onClick={handleMaxToAmount}>
                  Max
                </button> */}
                <button
                  className={swapStyle.TokenMain}
                  onClick={() => handleOpenModal("to")}
                >
                  <span className={swapStyle.TokenSpanMain}>
                    {/* Display selected token name or placeholder in the button */}
                    <span className={swapStyle.tokenName}>
                      {selectedToToken ? selectedToToken.name : "Select Token"}
                    </span>
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
            {/* "to" section end here */}
          </div>
        </div>
      </div>
      {/* Modal */}
      <Modal
        className={swapStyle.modalouterdiv}
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Token Selection"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            textAlign: "center",
          }}
        >
          <h2>Select a token</h2>
          <h2 onClick={handleCloseModal} className={swapStyle.closemodalbtn}>
            <FontAwesomeIcon icon={faXmark} />
          </h2>
        </div>
        {/* Search bar */}
        <div className={samechainStyle.searchBar}>
          <input
            id={swapStyle.srchbar}
            style={{ width: "100%" }}
            type="text"
            name="query"
            placeholder="Search by name or paste address here"
            className={samechainStyle.inputSearch}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Token list */}
        <div className={swapStyle.maindivoftokenname}>
          <div className={swapStyle.divtokenheadclear}>
            <h3 style={{ textAlign: "left" }}>Token name</h3>
            <button
              onClick={handleClearSelection}
              className={swapStyle.clearbtn}
            >
              Clear
            </button>
          </div>

          <div className={swapStyle.dropdownouter}>
            <div className={swapStyle.dropdown}>
              {/* Conditional rendering based on the length of the filtered token list */}
              {filteredTokenList.length === 0 ? (
                <div className={swapStyle.divimagemsgnotfound}>
                  <div className={swapStyle.divimage}>
                    <Image src={nodata} alt="none" width={200} />
                  </div>
                  <h2>No token found</h2>
                </div>
              ) : (
                // Mapping through filtered token list
                filteredTokenList.map((token) => (
                  <div
                    className={`${swapStyle.alldatatokendiv} ${
                      isTokenSelected(token) ? swapStyle.disabledToken : ""
                    }`}
                    key={token.address}
                    onClick={() =>
                      !isTokenSelected(token) && handleTokenSelection(token)
                    }
                  >
                    <div className={swapStyle.tokennameinmodal}>
                      {token.name}{" "}
                      {isTokenSelectedInFrom(token)
                        ? "(input)"
                        : isTokenSelectedInTo(token)
                        ? "(output)"
                        : ""}
                    </div>
                    <div className={swapStyle.balanceaddressdiv}>
                      {tokenBalances[token.address] !== undefined ? (
                        <div className={swapStyle.tokenbalanceinmodal}>
                          {/* Balance:{" "}
                          {formatUnits(tokenBalances[token.address], 18)}{" "} */}
                          Balance:{" "}
                          {parseFloat(
                            formatUnits(tokenBalances[token.address], 6)
                          ).toFixed(6)}
                        </div>
                      ) : (
                        <div className={swapStyle.tokenbalanceinmodal}>
                          Loading...
                        </div>
                      )}
                      <div className={swapStyle.tokenaddressinmodal}>
                        {token.address}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
      ;
    </div>
  );
}

export default Swap;

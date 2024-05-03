import React, { useState, useEffect } from "react";
import textStyle from "../CrossChain/Type/textify.module.css";
import CrossChain from "./CrossChain";
import swapStyle from "@/Components/DashboardComponents/SameChain/swap/swap.module.css";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import samechainStyle from "@/Components/Dashboard/samechaindashboard.module.css";
import {
  faCoins,
  faQuestion,
  faQuestionCircle,
  faRetweet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import down from "@/Assets/down.png";
import { FetchMeta } from "@/Helpers/FetchMeta";
import SwapComponent from "@/Helpers/swapComponent";
import { useAccount } from "wagmi";


function Crossswap({ activeTab }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFromToken, setSelectedFromToken] = useState(null);
  const [selectedToToken, setSelectedToToken] = useState(null);
  const [tokenBalances, setTokenBalances] = useState({});
  const [fromBalance, setFromBalance] = useState();
  const [toBalance, setToBalance] = useState();
  const [render, setIsRender] = useState(false);
  const [labels, setLabels] = useState([]);
  const { address: TronAddress, connected } = useWallet();
  const [currentSection, setCurrentSection] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);
  const [allNames, setAllNames] = useState([]);
  const [allAddresses, setAllAddresses] = useState([]);
  const {address} = useAccount();
  const [listData, setListData] = useState([]);
  const [maximumSold, setMaximumSold] = useState();
  const [transactionFees, setTransactionFees] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(null);  


  useEffect(()=>{
    const handleFetchMeta = async () => {
      console.log("fetch meta");
          const meta = await FetchMeta(); // Calling RangoClient MetaData function
          console.log("MetaData:   ", meta);
    }
    console.log("calling")
    handleFetchMeta();
  },[]);

  // Event handler for network selection
  const handleNetworkSelection = (network) => {
    setSelectedNetwork(network);
    setModalOpen(true); // Open the modal when a network is selected
  };


  const defaultTokenDetails = {
    name: null,
    symbol: null,
    balance: null,
    decimals: null,
  };
  const [tokenDetails, setTokenDetails] = useState(defaultTokenDetails);

  // const tokenList = [
  //   { name: "USDC", address: "TEMVynQpntMqkPxP6wXTW2K7e4sM3cRmWz" },
  //   { name: "USDT", address: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf" },
  // ];

  // const networks = [
  //   ModeTestnet, Mumbai,Polygon, PolygonTestnet,
  // ]
  // Dummy network and token list arrays
  const tokenList = [
    {
      name: "Ethereum",
      tokens: [
        {
          "blockchain": "ETH",
          "address": null,
          "symbol": "ETH",
        },
        {
          "blockchain": "ETH",
          "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
          "symbol": "USDT",
        },
        {
          "blockchain": "ETH",
          "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "symbol": "USDC",
        },
      ],
    },
    {
  name: "Optimism",
        tokens: [
        {
          "blockchain": "OPTIMISM",
          "address": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
          "symbol": "USDT",
        },
        {
          "blockchain": "OPTIMISM",
          "address": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
          "symbol": "USDC",
        },
      ],
    },
    {
    name: "Polygon",
        tokens: [
        {
          "blockchain": "POLYGON",
          "address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
          "symbol": "USDT",
        },
        {
          "blockchain": "POLYGON",
          "address": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
          "symbol": "USDC",
        },
      ],
    },
    {
      name: "Tron",
          tokens: [
          {
            "blockchain": "TRON",
            "address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
            "symbol": "USDT"
          },
          {
            "blockchain": "TRON",
            "address": "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
            "symbol": "USDC"
          },
        ],
      },
    ]

  const [searchQuery, setSearchQuery] = useState("");
  const [totalTRC20, setTotalTRC20] = useState(null); /* Total ERC20 tokens in wallet */
  const [remaining, setRemaining] = useState(null); // store remaining amount after deducting already sent value
  const [TRC20Balance, setTRC20Balance] = useState(null);
  const [formData, setFormData] = useState({
    fromTokenAmount: "",
    toTokenAmount: "",
  });

  const handleswap = () => {
    // Swap selected tokens
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(selectedFromToken);

    // Swap token balances
    setFromBalance(toBalance);
    setToBalance(fromBalance);

    // Swap form data
    setFormData((prevData) => ({
      ...prevData,
      fromTokenAmount: formData.toTokenAmount,
      toTokenAmount: formData.fromTokenAmount,
    }));

    // Toggle the isSwapped state
    setIsSwapped(!isSwapped);
  };

  const handleOpenModal = (section) => {
    setCurrentSection(section); // Set the current section when opening the modal
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleTokenSelection = (token) => {
    console.log("clicked");
    if (currentSection === "from") {
      console.log("from....");
      setSelectedFromToken(token);
      // Update token details for "from" section
      setTokenDetails({
        blockchain: token.blockchain,
        symbol: token.symbol,
        address: token.address,
      });
      console.log("Selected token in 'from' section:", token);
  
      // Infer the network based on the token's blockchain
      if (token.blockchain === "TRON") {
        console.log("Selected token is on the Tron network");
      } else if (token.blockchain === "Ethereum") {
        console.log("Selected token is on the Ethereum network");
      } else {
        console.log("Selected token is on an unknown network");
      }
    } else if (currentSection === "to") {
      console.log("to....");
      setSelectedToToken(token);
      // Update token details for "to" section
      setTokenDetails({
        blockchain: token.blockchain,
        symbol: token.symbol,
        address: token.address,
      });
      console.log("Selected token in 'to' section:", token);
    }
    setModalOpen(false);
  };
  
  
  
  const filteredTokenList = tokenList.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleFromInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleToInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
      setFromBalance(null);
    } else if (currentSection === "to") {
      setSelectedToToken(null);
      setToBalance(null);
    }
    handleCloseModal();
  };

  useEffect(() => {
    console.log("Selected token in 'from' section:", selectedFromToken);
    console.log("Selected token in 'to' section:", selectedToToken);
  }, [selectedFromToken, selectedToToken]);
  
  const fetchTronTokenBalance = async (tokenAddress) => {
    console.log("fetching");
    if (typeof window !== "undefined") {
      const { tronWeb } = window;
      try {
        console.log(TronAddress);
        const tronTokenContractInstance = await tronWeb
          .contract()
          .at(tokenAddress);
        const balance = await tronTokenContractInstance
          .balanceOf(TronAddress)
          .call();
        console.log(balance);
        return balance;
      } catch (error) {
        console.error("Error fetching Tron token balance:", error);
        return null;
      }
    }
  };

  useEffect(() => {
    const fetchbalance = async () => {
      console.log(".......");
      if (selectedFromToken) {
        let fromBalance = await fetchTronTokenBalance(
          selectedFromToken.address
        );
        setFromBalance(fromBalance);
      }
    };
    fetchbalance();
  }, [selectedFromToken]);

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
                flexDirection:"column",
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
                              <div className={swapStyle.From}>
                                From (estimated)
                              </div>
                              <div className={swapStyle.Balance}>Balance:</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={swapStyle.FromInputMain}>
                      <input
                        type="text"
                        min="0"
                        step="0.01"
                        placeholder="Enter Amount"
                        className={swapStyle.swapInput}
                        name="fromTokenAmount"
                        value={formData.fromTokenAmount}
                        onChange={handleFromInputChange} // Attach handleFromInputChange here
                      />

                      {/* <button id={swapStyle.swapMaxbtn} onClick={handleMaxFromAmount}>
                  Max
                </button> */}
                      <div id="second">
                        <button
                          className={swapStyle.TokenMain}
                          onClick={() => handleOpenModal("from")}
                        >
                          <span className={swapStyle.TokenSpanMain}>
                            {/* Display selected token name or placeholder in the button */}
                            <span className={swapStyle.tokenName}>
                              {selectedFromToken
                                ? selectedFromToken.symbol
                                : "Select Token"}
                            </span>
                            <Image src={down} />
                          </span>
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        color: "white",
                        textAlign: "left",
                        padding: "0 0.75rem 0.75rem 1rem",
                        fontSize: "14px",
                      }}
                    ></div>
                  </div>
                  {/* "from" section end here */}
                  <div
                    className={`${swapStyle.swaButton} ${
                      isSwapped ? swapStyle.rotate : ""
                    }`}
                  >
                    <button className={swapStyle.swapButton}>
                      <FontAwesomeIcon icon={faRetweet} onClick={handleswap} />
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
                                <div>Balance:</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div></div>
                    <div className={swapStyle.FromInputMain}>
                      <input
                        type="text"
                        min="0"
                        step="0.01"
                        placeholder="0.0"
                        className={swapStyle.swapInput}
                        name="toTokenAmount"
                        value={formData.toTokenAmount}
                        onChange={handleToInputChange} // Attach handleToInputChange here
                      />

                      {/* <button id={swapStyle.swapMaxbtn} onClick={handleMaxToAmount}>
                  Max
                  
                </button> */}
                      <div id="first">
                        <button
                          className={swapStyle.TokenMain}
                          onClick={() => handleOpenModal("to")}
                        >
                          <span className={swapStyle.TokenSpanMain}>
                            {/* Display selected token name or placeholder in the button */}
                            <span className={swapStyle.tokenName}>
                              {selectedToToken
                                ? selectedToToken.symbol
                                : "Select Token"}
                            </span>
                            <Image src={down} />
                          </span>
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        color: "white",
                        textAlign: "left",
                        padding: "0 0.75rem 0 1rem",
                        fontSize: "14px",
                      }}
                    ></div>
                    <div className={swapStyle.SwapBtnMain}></div>
                  </div>
                  {/* "to" section end here */}
                </div>
              </div>
              <div> 
                </div>
                <SwapComponent 
                selectedFromToken={selectedFromToken}
                selectedToToken={selectedToToken}/>
                {/* <button></button> */}
            </div>
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
                <h2
                  onClick={handleCloseModal}
                  className={swapStyle.closemodalbtn}
                >
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
                    <div className={swapStyle.networkandtoken}>
                      <div className={swapStyle.divnetwokr}>
                        <h2>Select a Network</h2>
                        {tokenList.map((network, index) => (
                          <div
                            className={swapStyle.networkdiv}
                            key={index}
                            onClick={() => handleNetworkSelection(network)}
                          >
                            {network.name}
                          </div>
                        ))}
                      </div>
                      <div className={swapStyle.tokendiv}>
                        {selectedNetwork && (
                          <>
                            <h2>Select Tokens</h2>
                            <h3>{selectedNetwork.name}</h3>
                            {selectedNetwork.tokens.map((token, index) => (
                              <div
                                className={`${swapStyle.tokenaddressname} ${
                                  (isTokenSelectedInTo(token) &&
                                    currentSection === "to") ||
                                  (isTokenSelectedInFrom(token) &&
                                    currentSection === "from")
                                    ? swapStyle.disabledToken
                                    : ""
                                }`}
                                key={index}
                                onClick={() =>
                                  !(
                                    (isTokenSelectedInTo(token) &&
                                      currentSection === "to") ||
                                    (isTokenSelectedInFrom(token) &&
                                      currentSection === "from")
                                  ) && handleTokenSelection(token)
                                }
                              >
                                <div>
                                  {token.symbol}{" "}
                                  {(isTokenSelectedInTo(token) &&
                                    currentSection === "to") ||
                                  (isTokenSelectedInFrom(token) &&
                                    currentSection === "from")
                                    ? isTokenSelectedInTo(token)
                                      ? "(output)"
                                      : "(input)"
                                    : ""}
                                </div>
                                <div>
                                  {"("}
                                  {token.address}
                                  {")"}
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    
      <CrossChain activeTab={activeTab} />
    </div>
  );
}

export default Crossswap;

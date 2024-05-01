"use client";
import React, { useState, useEffect } from "react";
import textStyle from "../Type/textify.module.css";
import swapStyle from "./swap.module.css";
import Textify from "../Type/Textify";
import Listify from "../Type/Listify";
import Uploadify from "../Type/Uploadify";
import text from "../../../../Assets/text-editor.png";
import Image from "next/image";
import down from "../../../../Assets/down.png";
import Modal from "react-modal";
import samechainStyle from "@/Components/Dashboard/samechaindashboard.module.css";
import { ethers } from "ethers";
import { SunSwapInstance } from "@/Helpers/SunSwapInstance";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRetweet, faXmark } from "@fortawesome/free-solid-svg-icons";
import nodata from "@/Assets/nodata.png";
import { formatUnits } from "ethers/lib/utils";
import { TronIsValidValue } from "@/Helpers/ValidateInput";
import { TronLoadToken } from "@/Helpers/LoadToken";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import ExecuteSwap from "../Execute/ExecuteSwap";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";


function Swap({ activeTab }) {
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
  const [listData, setListData] = useState([]);
  const [maximumSold, setMaximumSold] = useState();
  const [transactionFees, setTransactionFees] = useState();

  const defaultTokenDetails = {
    name: null,
    symbol: null,
    balance: null,
    decimals: null,
  };
  const [tokenDetails, setTokenDetails] = useState(defaultTokenDetails);

  const tokenList = [
    { name: "USDC", address: "TEMVynQpntMqkPxP6wXTW2K7e4sM3cRmWz" },
    { name: "USDT", address: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf" },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [totalTRC20, setTotalTRC20] =
    useState(null); /* Total ERC20 tokens in wallet */
  const [remaining, setRemaining] = useState(null); // store remaining amount after deducting already sent value
  const [TRC20Balance, setTRC20Balance] = useState(null);
  const [formData, setFormData] = useState({
    fromTokenAmount: "",
    toTokenAmount: "",
  });

  useEffect(() => {
    const hasVisitedhereBefore = document.cookie.includes("visitedd=true"); //Checks if user has visited the page
    if (!hasVisitedhereBefore) {
      document.cookie = "visited=true; max-age=31536000"; 
      const driverObj = driver({
        overlayColor: "#00000094",
        popoverClass: ` ${samechainStyle.driverpopover01}`,
        showProgress: true,
        steps: [
          {
            element: "#first",
            popover: {
              title: "Select token",
              description: "select the token you want in swapping",
              side: "right",
              align: "start",
            },
          },
          {
            element: "#second",
            popover: {
              title: "Select token",
              description: "select token you want to swap",
              side: "right",
              align: "start",
            },
          },
          {
            element: "#third",
            popover: {
              title: "Enter token here",
              description: "Enter  token amount you want",
              side: "right",
              align: "start",
            },
          },
        ],
      });
      driverObj.drive();
    }

  }, []);
  // const handleMaxFromAmount = () => {
  //   if (selectedFromToken) {
  //     console.log(fromBalance);
  //     let value = ethers.utils.formatUnits(fromBalance, 6);
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       ["fromTokenAmount"]: value,
  //     }));
  //   }
  // };

  // Function to filter tokens based on search query
  const filteredTokenList = tokenList.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleOpenModal = (section) => {
    setCurrentSection(section); // Set the current section when opening the modal
    setModalOpen(true);
  };
  const handleDeleteRow = (index) => {
    const updatedList = [...listData];
    updatedList.splice(index, 1);
    setListData(updatedList);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const fetchUserDetails = async () => {
    try {
      const result = await fetch(`api/all-user-data?address=${TronAddress}`);
      const response = await result.json();
      const usersData = response.result;
      const names = usersData.map((user) => (user.name ? user.name : ""));
      const addresses = usersData.map((user) =>
        user.address ? user.address : ""
      );
      setAllNames(names);

      setAllAddresses(addresses);

      setLabels([]);
      return { names, addresses };
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

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

  useEffect(() => {
    console.log(TronAddress);
    if (TronAddress) {
      fetchUserDetails();
    }
  }, [TronAddress]);

  useEffect(() => {
    const fetchbalance = async () => {
      console.log("calling");
      if (selectedToToken) {
        let toBalance = await fetchTronTokenBalance(selectedToToken.address);
        setToBalance(toBalance);
      }
    };
    fetchbalance();
  }, [selectedToToken]);

  useEffect(() => {
    const calculateTotal = () => {
      let totalTRC20 = ethers.BigNumber.from(0);
      if (listData.length > 0) {
        listData.forEach((data) => {
          console.log(data);
          totalTRC20 = totalTRC20.add(data.value);
        });
      }
      // console.log(totalTRC20);

      setTotalTRC20(totalTRC20);
    };

    calculateTotal();
  }, [listData]);

  useEffect(() => {
    calculateRemaining();
  }, [totalTRC20]);

  const calculateRemaining = () => {
    console.log(TRC20Balance, totalTRC20);
    if (TRC20Balance && totalTRC20) {
      const remaining = TRC20Balance.sub(totalTRC20);
      setRemaining(remaining);
    } else {
      setRemaining(null);
    }
  };

  const getAmountIn = async (value) => {
    const con = await SunSwapInstance();
    const amountIn = ethers.utils.parseUnits(value, 6);
    console.log(amountIn);
    if (selectedToToken?.address && selectedFromToken?.address) {
      const outputAmount = await con
        .getAmountsIn(amountIn, [
          selectedFromToken.address,
          selectedToToken.address,
        ])
        .call();
      console.log(outputAmount["amounts"][0]);
      const amountInFrom = ethers.utils.formatUnits(
        outputAmount["amounts"][0],
        6
      );
      console.log(amountInFrom);
      setFormData((prevData) => ({
        ...prevData,
        ["fromTokenAmount"]: amountInFrom,
      }));
      const increasePercentage = 0.5 / 100;
      const increaseAmount = parseFloat(amountInFrom) * increasePercentage;
      const newAmount = parseFloat(amountInFrom) + increaseAmount;
      const newAmountfixed = newAmount.toFixed(6);
      console.log(newAmountfixed);
      const maxSold = ethers.utils.parseUnits(newAmountfixed.toString(), 6);
      console.log(maxSold);
      setMaximumSold(maxSold);
      const percentageToCalculate = 3;
      const calculatedPercentage = (
        (parseFloat(amountInFrom) * percentageToCalculate) /
        100
      ).toFixed(6);
      const calculatedPercentageInSmallestUnit = ethers.utils.parseUnits(
        calculatedPercentage.toString(),
        6
      );
      console.log(calculatedPercentageInSmallestUnit);
      setTransactionFees(calculatedPercentageInSmallestUnit);
    }
  };

  //   const { name, value } = e.target;

  //   console.log(name, value);
  //   if (value == "") {
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       [name]: "",
  //     }));
  //   }
  //   if (TronIsValidValue(value)) {
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       [name]: value,
  //     }));
  //     getAmountOut(value);
  //   }
  // };

  const handleToInputChange = async (e) => {
    const { name, value } = e.target;

    console.log(name, value);
    if (value == "") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: "",
      }));
    }
    if (TronIsValidValue(value)) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      getAmountIn(value);
    }
  };

  const handleSwap = () => {
    const tempSelectedToken = selectedFromToken;
    const tempBalance = toBalance;
    setSelectedFromToken(selectedToToken);
    setSelectedToToken(tempSelectedToken);
    setToBalance(fromBalance);
    setFromBalance(tempBalance);

    const e = {
      target: {
        name: "toTokenAmount",
        value: formData.fromTokenAmount,
      },
    };
    handleToInputChange(e);

    setIsSwapped(!isSwapped);
  };

  const renderComponent = (tab) => {
    switch (tab) {
      case "text":
        return (
          <Textify
            listData={listData}
            setListData={setListData}
            allNames={allNames}
            allAddresses={allAddresses}
          />
        );
      case "list":
        return (
          <Listify
            listData={listData}
            setListData={setListData}
            allNames={allNames}
            allAddresses={allAddresses}
          />
        );
      case "csv":
        return (
          <Uploadify
            listData={listData}
            setListData={setListData}
            allNames={allNames}
            allAddresses={allAddresses}
          />
        );
      default:
        return (
          <Textify
            listData={listData}
            setListData={setListData}
            allNames={allNames}
            allAddresses={allAddresses}
          />
        );
    }
  };

  const loadToken = async () => {
    console.log("loading");
    console.log(selectedToToken);
    setRemaining(null);
    setTotalTRC20(null);
    setListData([]);
    // if (selectedToToken === "") {
    //   setErrorMessage("Please add token address");
    //   setErrorModalIsOpen(true);
    //   return;
    // }

    setTokenDetails(defaultTokenDetails);

    try {
      var tokenDetails = {
        name: null,
        symbol: null,
        balance: null,
        decimals: null,
      };

      if (TronAddress) {
        tokenDetails = await TronLoadToken(
          selectedToToken.address,
          TronAddress
        );
      }
      console.log(tokenDetails);
      if (tokenDetails) {
        setTokenDetails(tokenDetails);
        const swapBalance = ethers.utils.parseUnits(
          formData.toTokenAmount,
          tokenDetails.decimals
        );
        setTRC20Balance(swapBalance);
        console.log(swapBalance);
      } else {
        throw new Error("Token details not found"); // Throw error if token details are not found
      }
    } catch (error) {
      console.log(error);
      // setErrorMessage("Invalid Token Address"); // Set error message
      // setErrorModalIsOpen(true); // Open modal
    }
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
      setFromBalance(null);
    } else if (currentSection === "to") {
      setSelectedToToken(null);
      setToBalance(null);
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
                        <div className={swapStyle.From}>From (estimated)</div>
                        <div className={swapStyle.Balance}>
                          {fromBalance && (
                            <div>
                              Balance:
                              {`${(+ethers.utils.formatUnits(
                                fromBalance,
                                6
                              )).toFixed(6)} `}
                              {selectedFromToken?.name
                                ? selectedFromToken.name
                                : null}
                            </div>
                          )}
                        </div>
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
                  readOnly
                />

                {/* <button id={swapStyle.swapMaxbtn} onClick={handleMaxFromAmount}>
                  Max
                </button> */}
                <div id="second" >
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
                          {toBalance && (
                            <div>
                              Balance:
                              {`${(+ethers.utils.formatUnits(
                                toBalance,
                                6
                              )).toFixed(6)} `}{" "}
                              {selectedToToken?.name
                                ? selectedToToken.name
                                : null}
                            </div>
                          )}
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
                  id="third"
                  placeholder="0.0"
                  className={swapStyle.swapInput}
                  name="toTokenAmount"
                  value={formData.toTokenAmount}
                  onChange={handleToInputChange}
                />

                {/* <button id={swapStyle.swapMaxbtn} onClick={handleMaxToAmount}>
                  Max
                  
                </button> */}
                <div id="first" >
                <button
                  className={swapStyle.TokenMain}
                  onClick={() => handleOpenModal("to")}
                >
                  <span className={swapStyle.TokenSpanMain}
                  >
                    {/* Display selected token name or placeholder in the button */}
                    <span className={swapStyle.tokenName}>
                      {selectedToToken ? selectedToToken.name : "Select Token"}
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
      </div>
      {maximumSold > 0 && (
  <div className={swapStyle.maxsoldtnxfeesdiv}>
    <div className={swapStyle.maxtnxdiv}>
      <div className={swapStyle.lableinswap}>Max Sold</div>
      <div className={swapStyle.valueinswap}>
        {maximumSold
          ? `${ethers.utils.formatUnits(maximumSold, 6)} ${
              selectedFromToken.name
            }`
          : null}
      </div>
    </div>
    <div className={swapStyle.maxtnxdiv}>
      <div className={swapStyle.lableinswap}>Transaction Fees</div>
      <div className={swapStyle.valueinswap}>
        {transactionFees
          ? `${ethers.utils.formatUnits(transactionFees, 6)} ${
              selectedFromToken.name
            }`
          : null}
      </div>
    </div>
  </div>
)}
      {maximumSold > 0 && (

      <button
        id={textStyle.greenbackground}
        className={textStyle.sendbutton}
        onClick={() => {
          setIsRender(true);
          loadToken();
        }}
      >
        {" "}
        Add Recipients
      </button>
)}

      {render ? renderComponent(activeTab) : null}
      {listData.length > 0 ? (
        <div>
          <div className={textStyle.tablecontainer}>
            <div
              className={textStyle.titleforlinupsametext}
              style={{ padding: "5px 0px" }}
            >
              <h2
                style={{
                  padding: "10px",
                  letterSpacing: "1px",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                Your Transaction Lineup
              </h2>
            </div>
            <div className={textStyle.scrollabletablecontainer}>
              <table
                className={textStyle.tabletextlist}
                style={{ padding: "30px 20px" }}
              >
                <thead className={textStyle.tableheadertextlist}>
                  <tr>
                    <th
                      className={textStyle.fontsize12px}
                      style={{ letterSpacing: "1px", padding: "8px" }}
                    >
                      Receiver Address
                    </th>
                    <th
                      className={textStyle.fontsize12px}
                      style={{ letterSpacing: "1px", padding: "8px" }}
                    >
                      Label
                    </th>
                    <th
                      className={textStyle.fontsize12px}
                      style={{ letterSpacing: "1px", padding: "8px" }}
                    >
                      Amount({tokenDetails.symbol})
                    </th>
                    {/* <th
                      className={textStyle.fontsize12px}
                      style={{ letterSpacing: "1px", padding: "8px" }}
                    >
                      Amount(USD)
                    </th> */}
                    <th
                      className={textStyle.fontsize12px}
                      style={{ letterSpacing: "1px", padding: "8px" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listData.length > 0
                    ? listData.map((data, index) => (
                        <tr key={index}>
                          <td
                            id={textStyle.fontsize10px}
                            style={{ letterSpacing: "1px", padding: "8px" }}
                          >
                            {data.address}
                          </td>
                          <td
                            id={textStyle.fontsize10px}
                            style={{ letterSpacing: "1px", padding: "8px" }}
                          >
                            {data.label ? (
                              data.label
                            ) : (
                              <>
                                <input
                                  type="text"
                                  value={labels[index] ? labels[index] : ""}
                                  style={{
                                    borderRadius: "8px",
                                    padding: "10px",
                                    color: "white",
                                    border: "none",
                                    background:
                                      "linear-gradient(90deg, rgba(97, 39, 193, .58) .06%, rgba(63, 47, 110, .58) 98.57%)",
                                  }}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    // Regular expression to allow only alphanumeric characters without spaces
                                    const regex = /^[a-zA-Z0-9]*$/;
                                    if (
                                      regex.test(inputValue) &&
                                      inputValue.length <= 10
                                    ) {
                                      setLabelValues(index, inputValue);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      onAddLabel(index, data.address);
                                    }
                                  }}
                                />
                                {/* <input
                                    type="button"
                                    onClick={(e) => {
                                      onAddLabel(index, data.address);
                                    }}
                                  /> */}
                              </>
                            )}
                          </td>
                          <td
                            id={textStyle.fontsize10px}
                            style={{ padding: "8px" }}
                          >
                            <div
                              id={textStyle.fontsize10px}
                              style={{
                                width: "fit-content",
                                margin: "0 auto",
                                background:
                                  "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                                color: "black",
                                borderRadius: "10px",
                                padding: "10px 10px",
                                fontSize: "12px",
                                letterSpacing: "1px",
                              }}
                            >
                              {(+ethers.utils.formatUnits(
                                data.value,
                                tokenDetails.decimals
                              )).toFixed(4)}{" "}
                              {tokenDetails.symbol}
                            </div>
                          </td>
                          {/* <td id="font-size-10px" style={{ padding: "8px" }}>
                            <div
                              id="font-size-10px"
                              style={{
                                width: "fit-content",
                                margin: "0 auto",
                                background:
                                  "linear-gradient(90deg, #00d2ff 0%, #3a47d5 100%)",
                                color: "white",
                                borderRadius: "10px",
                                padding: "10px 10px",
                                fontSize: "12px",
                                letterSpacing: "1px",
                              }}
                            >
                              {`${(
                                ethers.utils.formatUnits(data.value, 18) *
                                ethToUsdExchangeRate
                              ).toFixed(2)} $`}
                            </div>
                          </td> */}

                          <td style={{ letterSpacing: "1px", padding: "8px" }}>
                            <button
                              className={textStyle.deletebutton}
                              onClick={() => handleDeleteRow(index)}
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
      {listData.length > 0 ? (
        <div style={{ paddingBottom: "30px" }}>
          <div className={textStyle.titleforaccountsummarytextsame}>
            <h2
              style={{
                padding: "10px",
                letterSpacing: "1px",
                fontSize: "20px",
                fontWeight: "700",
              }}
            >
              Account Summary
            </h2>
          </div>
          <div id={textStyle.tableresponsive}>
            <table
              className={`${textStyle["showtokentablesametext"]} ${textStyle["tabletextlist"]}`}
            >
              <thead className={textStyle.tableheadertextlist}>
                <tr style={{ width: "100%", margin: "0 auto" }}>
                  <th className={textStyle.accountsummaryth}>
                    Total Amount({tokenDetails.symbol})
                  </th>
                  {/* <th className={textStyle.accountsummaryth}>
                    Total Amount(USD)
                  </th> */}
                  <th className={textStyle.accountsummaryth}>Swap Balance</th>
                  <th className={textStyle.accountsummaryth}>
                    Remaining Balance
                  </th>
                </tr>
              </thead>
              <tbody className={textStyle.tbodytextifyaccsum}>
                <tr>
                  <td id={textStyle.fontsize10px}>
                    <div id="font-size-10px" className={textStyle.textAccSum}>
                      {totalTRC20
                        ? (+ethers.utils.formatUnits(
                            totalTRC20,
                            tokenDetails.decimals
                          )).toFixed(4)
                        : null}{" "}
                    </div>
                  </td>

                  <td id={textStyle.fontsize10px}>
                    <div
                      id="font-size-10px"
                      style={{
                        width: "fit-content",
                        margin: "0 auto",
                        color: "white",
                        borderRadius: "10px",

                        letterSpacing: "1px",
                      }}
                    >
                      {TRC20Balance
                        ? (+ethers.utils.formatUnits(
                            TRC20Balance,
                            tokenDetails.decimals
                          )).toFixed(4) +
                          " " +
                          tokenDetails.symbol
                        : null}
                    </div>
                  </td>
                  <td
                    id={textStyle.fontsize10px}
                    className={`showtoken-remaining-balance ${
                      remaining < 0 ? "showtoken-remaining-negative" : ""
                    }`}
                  >
                    <div
                      id={textStyle.fontsize10px}
                      className="font-size-12px"
                      style={{
                        width: "fit-content",
                        margin: "0 auto",
                        background:
                          remaining < 0
                            ? "red"
                            : "linear-gradient(269deg, #0FF 2.32%, #1BFF76 98.21%)",
                        color: remaining < 0 ? "white" : "black",
                        borderRadius: "10px",
                        padding: "10px 10px",
                        fontSize: "12px",
                      }}
                    >
                      {remaining === null
                        ? null
                        : (+ethers.utils.formatUnits(
                            remaining,
                            tokenDetails.decimals
                          )).toFixed(4) +
                          " " +
                          tokenDetails.symbol}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <div>
        {/* {listData.length > 0 ? (
          <ExecuteSwap
            listData={listData}
            setListData={setListData}
            TRC20Balance={TRC20Balance}
            totalTRC20={totalTRC20}
            loading={loading}
            setLoading={setLoading}
            tokenDetails={tokenDetails}
            selectedFromToken={selectedFromToken}
            selectedToToken={selectedToToken}
            fromTokenAmount={formData.fromTokenAmount}
            toTokenAmount={formData.toTokenAmount}
            maximumSold={maximumSold}
          />
        ) : null} */}
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
                        <div className={swapStyle.tokenbalanceinmodal}></div>
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
    </div>
  );
}

export default Swap;

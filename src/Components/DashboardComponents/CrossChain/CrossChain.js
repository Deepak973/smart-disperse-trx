"use client";
import React, { useState, useEffect } from "react";
import "driver.js/dist/driver.css";
import SendEth from "./Send/SendEth";
import textStyle from "@/Components/DashboardComponents/CrossChain/Type/textify.module.css";
import SendToken from "./Send/SendToken";

/*
Main Component : the prop is use to get which of the three from textify, listify or uplaodify should ne loaded
It will be handled further by sendEth or sendToken component
*/
function CrossChain({ activeTab }) {
  const [isSendingEth, setIsSendingEth] = useState(true);
  const [isSendingToken, setIsSendingToken] = useState(false);
  const [listData, setListData] = useState([]);

  /*
  Funtion : To load SendEth component
  */
  // const handleSendEthbuttonClick = () => {
  //   setIsSendingEth(true);
  //   setIsSendingToken(false);
  // };

  // /*
  // Funtion : To load SendToken component
  // */

  // const handleImporttokenbuttonClick = () => {
  //   // console.log("import token");
  //   setIsSendingToken(true);
  //   setListData([]);
  //   setIsSendingEth(false);
  // };

  return (
    
    <>
      <div className={textStyle.divtocoversameetextdiv}>
        <div className={textStyle.divforwholetoken}>

          {isSendingEth ? (
            <SendEth
              activeTab={activeTab}
              listData={listData}
              setListData={setListData}
            />
          ) : null}

          {isSendingToken ? (
            <SendToken
              activeTab={activeTab}
              listData={listData}
              setListData={setListData}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

export default CrossChain;

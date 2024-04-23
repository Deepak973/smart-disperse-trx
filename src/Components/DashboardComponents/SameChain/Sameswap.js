import React, { useState } from "react";
import textStyle from "./Type/textify.module.css";
import Swap from "./swap/Swap";
import SameChain from "./SameChain";
import { TronContractInstance } from "@/Helpers/troncontractinstance";
import {
  useWallet,
  WalletProvider,
} from "@tronweb3/tronwallet-adapter-react-hooks";

function Sameswap({ activeTab, listData, setListData }) {
  const [issimpledisperse, setSimpledisperse] = useState(true);
  const { address: Tronaddress, connected } = useWallet();
  const [isswapdisperse, setSwapdisperse] = useState(false);

  const handlesimpledisperse = () => {
    console.log("simple disperse clicked");
    setSimpledisperse(true);
    setSwapdisperse(false);
  };

  const handleswapdisperse = () => {
    console.log("swap disperse clicked");
    setSimpledisperse(false);
    setSwapdisperse(true);
  };

  return (
    <div className={textStyle.divtocoversametextdiv}>
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
            Select or Import Token you want to Disperse
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
          <div id="send-eth" className={textStyle.sendethdiv}>
            <button
              id={issimpledisperse ? textStyle.truee : textStyle.falsee}
              className={textStyle.buttontoaddformdata}
              onClick={handlesimpledisperse}
            >
              Simple Disperse
            </button>
          </div>

          <div className={textStyle.importtokendiv}>
            <div style={{ margin: "10px 0px" }}>OR</div>
            <button
              style={{
                backgroundColor: issimpledisperse ? "" : "white",
                color: issimpledisperse ? "" : "#924afc",
              }}
              className={textStyle.buttontoaddformdataunload}
              onClick={() => handleswapdisperse()}
            >
              Swap Disperse
            </button>
          </div>
        </div>

        {issimpledisperse ? (
          <SameChain
            activeTab={activeTab}
            // listData={listData}
            // setListData={setListData}
            issimpledisperse={issimpledisperse}
            isswapdisperse={isswapdisperse}
          />
        ) : null}

        {isswapdisperse ? (
          <Swap
            issimpledisperse={issimpledisperse}
            isswapdisperse={isswapdisperse}
          />
        ) : null}
      </div>
    </div>
  );
}

export default Sameswap;

import React from 'react'
import textStyle from "../Type/textify.module.css";
import swapStyle from "./swap.module.css";

function Swap() {
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
          </div>
          </div>
    </div>
  )
}

export default Swap

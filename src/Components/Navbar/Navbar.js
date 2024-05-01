"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import navStyle from "../Navbar/navbar.module.css";
import smartlogo from "../../Assets/logo.png";
import Image from "next/image";
import { useTheme } from "next-themes";
import Cookies from "universal-cookie";
// import { useAccount } from "wagmi";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import TronWallet from "../TronWallet/TronConnect";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { usePathname } from "next/navigation";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";

function Navbar() {
  const { theme, setTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [TronNetowork, setTronNetwortk] = useState("Wrong Network");
  const dropdownRef = useRef(null);
  const cookie = new Cookies();
  const [isMainnet, setIsMainnet] = useState(true);
  const path = usePathname();
  const isHome = path === "/";

  const { address: Tronaddress, connected: TronConnected } = useWallet();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handelMainnet = () => {
    console.log(!isMainnet);

    setIsMainnet(!isMainnet);
    cookie.set("isMainnet", !isMainnet);
  };

  const storeToken = async (token) => {
    try {
      // Calculate expiration time 1 minute from now
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 2); // 1 hour * 60 minutes * 60 seconds * 1000 milliseconds

      // Set the JWT token in a cookie with expiration time
      cookie.set("jwt_token", token, { expires: expiryDate });
      return true;
    } catch (e) {
      console.error("Error storing token:", e);
      return false;
    }
  };
  // const createSign = async () => {
  //   try {
  //     const { ethereum } = window;
  //     if (!ethereum) {
  //       throw new Error("Metamask is not installed, please install!");
  //     }

  //     const provider = new ethers.providers.Web3Provider(ethereum);
  //     const signer = provider.getSigner();
  //     const message =
  //       "sign this message to verify the ownership of your address";

  //     // Sign the message using MetaMask
  //     const signature = await signer.signMessage(message);

  //     const jwtToken = await decodeSignature(signature, message);
  //     if (jwtToken === null) {
  //       console.log("Error while decoding signature");
  //     } else {
  //       const storetoken = await storeToken(jwtToken);
  //       console.log(storetoken);
  //       if (storetoken) {
  //         window.location.reload();
  //       }
  //     }
  //   } catch (e) {
  //     console.log("error", e);
  //   }
  // };

  const TroncreateSign = async () => {
    try {
      if (typeof window !== "undefined") {
        const { tronWeb } = window;

        async function signMessage(tronWeb, message) {
          try {
            const signature = await tronWeb.trx.signMessageV2(message);
            console.log("Signature:", signature);
            return signature;
          } catch (error) {
            console.error("Error signing message:", error);
          }
        }
        const message =
          "sign this message to verify the ownership of your address";

        const signature = await signMessage(tronWeb, message);

        const jwtToken = await decodeSignature(signature, message);
        if (jwtToken === null) {
          console.log("Error while decoding signature");
        } else {
          const storetoken = await storeToken(jwtToken);
          if (storetoken) {
            window.location.reload();
          }
        }
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const decodeSignature = async (signature, message) => {
    if (TronConnected) {
      try {
        // Decode the signature to get the signer's address
        const base58Address = await tronWeb.trx.verifyMessageV2(
          message,
          signature
        );
        console.log("Signer's address:", base58Address, Tronaddress);

        if (base58Address === Tronaddress) {
          const jwtToken = generateJWTToken(signature, message);
          return jwtToken;
        }
        return null;
      } catch (e) {
        console.error("Error decoding signature:", e);
        return null;
      }
    }
  };

  const generateJWTToken = (signature, message) => {
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 2;

    const tokenPayload = {
      signature: signature,
      message: message,
      exp: expirationTime, // Add expiration time claim
      // Add more claims as needed
      // For example, issuer, subject, etc.
    };

    console.log(tokenPayload);
    const token = jwt.sign(tokenPayload, "This is the msg for Jwt Token");
    return token;
  };

  useEffect(() => {
    // Function to retrieve the value of isMainnet from cookies when the component mounts
    const getIsMainnetFromCookies = () => {
      const isMainnetCookie = cookie.get("isMainnet");
      console.log(isMainnetCookie);
      if (isMainnetCookie !== undefined) {
        // If the cookie exists, set the value of isMainnet accordingly
        setIsMainnet(isMainnetCookie);
      }
    };

    // Call the function when the component mounts
    getIsMainnetFromCookies();
    console.log(isMainnet, "isMainnet");
    // Clean up function to avoid memory leaks
    return () => {};
  }, []);

  useEffect(() => {
    if (TronConnected && !isHome) {
      const jwtToken = cookie.get("jwt_token");
      console.log(jwtToken);
      if (jwtToken === undefined || jwtToken === null) {
        TroncreateSign();
      }
    }
  }, [TronConnected]);

  useEffect(() => {
    const getChainId = async () => {
      if (typeof window !== "undefined") {
        const { tronWeb } = window;
        const adapter = new TronLinkAdapter();
        let net = await adapter.network();
        console.log(net);
        const tronNetwork = net.networkType;
        console.log(tronNetwork);
        setTronNetwortk(tronNetwork);
  
        if (tronNetwork !== "Nile") {
          setTronNetwortk("Wrong Network");
          alert("Please connect to the Nile testnet, which we currently support. We will soon be launching Smart Disperse on the mainnet🚀");
        }
      }
    };
  
    getChainId();
  }, [Tronaddress]);
  
  return (
    <div className={navStyle.navbarMain}>
      <div className={navStyle.divtoflexlogoconnectwallet}>
        <div>
          <Link href="/">
            <Image
              className={navStyle.smartlogportal}
              src={smartlogo}
              alt="not foundd"
            />
          </Link>
        </div>
        {isHome ? (
          <></>
        ) : (
          <div className={navStyle.connectwalletbuttondiv}>
            {Tronaddress ? (
              <div className={navStyle.outerdivtronnetwork}>
                <div className={navStyle.displaytronnetwork}>
                  {TronNetowork}
                </div>
              </div>
            ) : null}
            <span>
              <TronWallet />
            </span>

            {theme === "light" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => setTheme("dark")}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="moon"
                width="50px"
                id={navStyle.changeMode}
              >
                {/* Dark mode moon SVG path */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                onClick={() => setTheme("light")}
                strokeWidth="1.5"
                stroke="currentColor"
                className="sun "
                id={navStyle.changeMode}
              >
                {/* Light mode sun SVG path */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;

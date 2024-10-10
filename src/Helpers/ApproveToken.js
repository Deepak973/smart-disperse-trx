"use client";
import { ethers } from "ethers";
import ERC20ABI from "@/artifacts/contracts/ERC20.sol/ERC20.json";
import contracts from "@/Helpers/ContractAddresses.js";
import {
  useWallet,
  WalletProvider,
} from "@tronweb3/tronwallet-adapter-react-hooks";

export const approveToken = async (amount, tokenContractAddress, chainId) => {
  const { ethereum } = window; // Grab the global ethereum object so we can interact with it

  // Make sure that the user has MetaMask installed and is connected to our network.
  if (ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(
        tokenContractAddress,
        ERC20ABI.abi,
        signer
      );
      const tx = await tokenContract.approve(
        contracts[chainId]["address"],
        amount
      );
      await tx.wait();
      // console.log(`${amount} tokens Approved`);

      return true;
    } catch (error) {
      console.error("Error Approving token:", error);
      return false;
    }
  }
};

export const tronapprovetoken = async (
  amount,
  tokenContractAddress,
  tronnetwork
) => {
  console.log("Aprroving trc token");
  // const TroncontractAddress = "TSijZfgARceZzHGBU14GcfQuDSsQhZtVdh";
  let TroncontractAddress = "";

  if (tronnetwork === "Mainnet") {
    TroncontractAddress = "TJKVtvZDhNhRX2eQRxzuk7ctgBxA2cmHAK";
  } else if (tronnetwork === "Nile") {
    TroncontractAddress = "TPt8cDuVSeKj5CsBdJ8edxLPZg6RPhVmos";
  }

  if (typeof window !== "undefined") {
    const { tronWeb } = window;
    if (tronWeb) {
      try {
        
        let con = await tronWeb.contract(ERC20ABI.abi, tokenContractAddress);
        const tx = await con.approve(TroncontractAddress, amount).send();
        // await tx.wait();
        console.log(`${amount} tokens Approved`);
        return true;
      } catch (error) {
        console.error("Error Approving token:", error);
        return false;
      }
    }
  }
};

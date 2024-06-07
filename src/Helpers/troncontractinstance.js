"use client";
import React from "react";
import TronWeb from "tronweb";
import tronabi from "../artifacts/contracts/TronContract.json";
import tronabiSunSwap from "../artifacts/contracts/SunSwapRouter.json";

export const TronContractInstance = async (tronnetwork) => {
  if (typeof window !== "undefined") {
    try {
      console.log("trying...");
      const { tronWeb } = window;
      // const TroncontractAddress = "TSijZfgARceZzHGBU14GcfQuDSsQhZtVdh";
      let TroncontractAddress = "";
      if (tronnetwork === "Mainnet") {
        TroncontractAddress = "TJKVtvZDhNhRX2eQRxzuk7ctgBxA2cmHAK";
      } else if (tronnetwork === "Nile") {
        TroncontractAddress = "TPt8cDuVSeKj5CsBdJ8edxLPZg6RPhVmos";
      }
      let contract = await tronWeb.contract(tronabi, TroncontractAddress);
      console.log(contract);
      return contract;
    } catch (error) {
      console.log("error:", error.message);
      throw error;
    }
  }
};

export const TronContractInstanceSunSwap = async () => {
  if (typeof window !== "undefined") {
    try {
      const { tronWeb } = window;
      const TroncontractAddress = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax";
      let contract = await tronWeb.contract(
        tronabiSunSwap,
        TroncontractAddress
      );
      console.log(contract);
      return contract;
    } catch (error) {
      console.log("error:", error.message);
      throw error;
    }
  }
};

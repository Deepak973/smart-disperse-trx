"use client";
import sunSwapABI from "../artifacts/contracts/SunSwapRouter.json";

export const SunSwapInstance = async (tronnetwork) => {
  if (typeof window !== "undefined") {
    try {
      console.log("trying...");

      const { tronWeb } = window;
      let TroncontractAddress = "";

      if (tronnetwork === "Mainnet") {
        TroncontractAddress = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax";
      } else if (tronnetwork === "Nile") {
        TroncontractAddress = "TLDSUi2iYpVbyaQjnoKBQEFR6C98GqikPd";
      }
      let contract = await tronWeb.contract(sunSwapABI, TroncontractAddress);
      console.log(contract);
      return contract;
    } catch (error) {
      console.log("error:", error.message);
      throw error;
    }
  }
};

"use client";
import sunSwapABI from "../artifacts/contracts/SunSwapRouter.json";

export const SunSwapInstance = async () => {
  if (typeof window !== "undefined") {
    try {
      console.log("trying...");

      const { tronWeb } = window;
      const TroncontractAddress = "TLDSUi2iYpVbyaQjnoKBQEFR6C98GqikPd";
      let contract = await tronWeb.contract(sunSwapABI, TroncontractAddress);
      console.log(contract);
      return contract;
    } catch (error) {
      console.log("error:", error.message);
      throw error;
    }
  }
};

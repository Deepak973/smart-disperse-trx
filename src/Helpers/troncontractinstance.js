import React from 'react'
import TronWeb from "tronweb";
import tronabi from "../artifacts/contracts/TronContract.json";

export const TronContractInstance = async() => {
    try {
        console.log("trying...")
    const { tronWeb } = window;
    const TroncontractAddress = 'TGBSgXpo5rfwcMdB3KMab6j3CLBaSUFJcX';
    let contract = await tronWeb.contract(tronabi, TroncontractAddress); 
    console.log(contract);
    return contract;
    } catch (error) {
        console.log("error:",error.message)
        throw error;
    }
}

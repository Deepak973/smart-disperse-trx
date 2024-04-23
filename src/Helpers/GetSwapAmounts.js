import tronabi from "../artifacts/contracts/SunSwapRouter.json";

export const TronContractInstance = async () => {
  try {
    console.log("trying...");
    const { tronWeb } = window;
    const TroncontractAddress = "TSijZfgARceZzHGBU14GcfQuDSsQhZtVdh";
    let contract = await tronWeb.contract(tronabi, TroncontractAddress);
    console.log(contract);
    return contract;
  } catch (error) {
    console.log("error:", error.message);
    throw error;
  }
};

export const AddLiquidity = async () => {
  try {
    console.log("trying...");
    const { tronWeb } = window;
    const TroncontractAddress = "TSv6BtXo5rtgGFTPT17FiyPs981uZxkYx1";
    let contract = await tronWeb.contract(tronabi, TroncontractAddress);
    return contract;
  } catch (error) {
    console.log("error:", error.message);
    throw error;
  }
};

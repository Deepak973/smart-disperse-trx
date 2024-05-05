import { RangoClient, TransactionStatus } from "rango-sdk-basic";
import { ToastContainer, toast } from "react-toastify";


export function prepareEvmTransaction(evmTx, isApprove) {
  const gasPrice = !!evmTx.gasPrice && !evmTx.gasPrice.startsWith('0x') ? '0x' + parseInt(evmTx.gasPrice).toString(16) : null;
  const manipulatedTx = {
    ...evmTx,
    gasPrice
  };

  let tx = {};
  if (!!manipulatedTx.from) tx = { ...tx, from: manipulatedTx.from };
  if (isApprove) {
    if (!!manipulatedTx.approveTo) tx = { ...tx, to: manipulatedTx.approveTo };
    if (!!manipulatedTx.approveData) tx = { ...tx, data: manipulatedTx.approveData };
  } else {
    if (!!manipulatedTx.txTo) tx = { ...tx, to: manipulatedTx.txTo };
    if (!!manipulatedTx.txData) tx = { ...tx, data: manipulatedTx.txData };
    if (!!manipulatedTx.value) tx = { ...tx, value: manipulatedTx.value };
    if (!!manipulatedTx.gasLimit) tx = { ...tx, gasLimit: manipulatedTx.gasLimit };
    if (!!manipulatedTx.gasPrice) tx = { ...tx, gasPrice: manipulatedTx.gasPrice };
  }
  return tx;
}

export async function checkApprovalSync(requestId, txId, rangoClient) {
  while (true) {
    const approvalResponse = await rangoClient.isApproved(requestId, txId);
    if (approvalResponse.isApproved) {
      return true;
    }
    await sleep(3000);
  }
}

export async function checkTransactionStatusSync(requestId, txId, rangoClient) {
  while (true) {
    try {
      const txStatus = await rangoClient.status({
        requestId,
        txId,
      });
      if (!!txStatus) {
        // console.log({ txStatus });
        // toast.success(txStatus);
        if (
          !!txStatus.status &&
          [TransactionStatus.FAILED, TransactionStatus.SUCCESS,TransactionStatus.RUNNING].includes(txStatus.status)
        ) {
          return txStatus;
        }
      }
    } catch (error) {
      console.log({ error });
    }
    await sleep(3000);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

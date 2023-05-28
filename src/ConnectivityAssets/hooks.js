import React from "react";
import { Contract } from "@ethersproject/contracts";
import tokenAbi from "./tokenAbi.json";
import presaleAbi from "./presaleAbi.json";
import usdtAbi from "./usdtAbi.json";
import { tokenAddress, presaleAddress, usdtAddress } from "./environment";
import { ethers } from "ethers";
let walletAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
export const provider = new ethers.providers.JsonRpcProvider(
  "https://mainnet.infura.io/v3/36fc2665f5504bc18c3b7f9fab0e0c46"
);
export const voidAccount = new ethers.VoidSigner(walletAddress, provider);
function useContract(address, ABI, signer) {
  return React.useMemo(() => {
    if (signer) {
      return new Contract(address, ABI, signer);
    } else {
      return new Contract(address, ABI, voidAccount);
    }
  }, [address, ABI, signer]);
}
export function useTokenContract(signer) {
  return useContract(tokenAddress, tokenAbi, signer);
}
export function usePresaleContract(signer) {
  return useContract(presaleAddress, presaleAbi, signer);
}
export function useUSDTContract(signer) {
  return useContract(usdtAddress, usdtAbi, signer);
}

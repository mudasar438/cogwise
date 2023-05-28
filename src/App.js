import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import "./App.css";
import Header from "./Components/Header";
import NetworkChange from "./Components/networkSwitch";
import PresalePage from "./Pages/PresalePage";
import { AppContext } from "./utils";

const web3 = new Web3(
  Web3.givenProvider
    ? Web3.givenProvider
    : "https://mainnet.infura.io/v3/36fc2665f5504bc18c3b7f9fab0e0c46"
);
function App() {
  const [open, setOpen] = useState(false);
  const { account, connect } = useContext(AppContext);

  useEffect(() => {
    let chain = async () => {
      const chainid = await web3.eth.getChainId();
      if (chainid !== 1) {
        setOpen(true);
      }
    };
    chain();
  }, []);
  return (
    <div>
      <NetworkChange open={open} setOpen={setOpen} />
      <Header />
      <PresalePage />
    </div>
  );
}

export default App;

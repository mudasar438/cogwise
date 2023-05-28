import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Container,
  Dialog,
  Divider,
  Grid,
  Slide,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { MaxUint256 } from "@ethersproject/constants";
import {
  StyledButton,
  StyledMainHeading,
  StyledText,
  StyledTextBold,
  StyledTitle,
  TextInput,
} from "../Components/SmallComponents/AppComponents";
import { AppContext } from "../utils";
import {
  provider,
  usePresaleContract,
  useTokenContract,
  useUSDTContract,
} from "../ConnectivityAssets/hooks";
import { ToastNotify } from "../Components/SmallComponents/AppComponents";
import { RingLoader } from "react-spinners";
import { eth, icon, usdt } from "../Components/SmallComponents/Images";
import { presaleAddress } from "../ConnectivityAssets/environment";
import moment from "moment";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PresalePage = () => {
  const matches = useMediaQuery("(max-width:700px)");
  const matchesMin = useMediaQuery("(min-width:1600px)");
  const { account, connect, signer } = useContext(AppContext);
  const [token, setToken] = useState("USDT");
  const [openDialog, setOpenDialog] = useState(false);
  const [enteredAmount, setEnteredAmount] = useState("");
  const [balanceUSDT, setbalanceUSDT] = useState(0);
  const [balanceETH, setbalanceETH] = useState(0);
  const [oneUSDTtoToken, setoneUSDTtoToken] = useState(0);
  const [oneETHtoToken, setoneETHtoToken] = useState(0);
  const [receivedTokens, setreceivedTokens] = useState("");
  const [raisedAmount, setRaisedAmount] = useState(0);
  const [progressBar, setProgessBar] = useState(0);
  const [loading, setloading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [minBuyLim, setminBuyLim] = useState(0);
  const [minBuyETH, setminBuyETH] = useState(0);

  let currentTime = moment().format("X");

  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    severity: undefined,
  });
  const presaleContract = usePresaleContract(signer);
  const tokenContract = useTokenContract(signer);
  const usdtContract = useUSDTContract(signer);

  const init = async () => {
    try {
      let ethBal = await presaleContract.amountRaisedEth();
      setRaisedAmount(formatUnits(ethBal.toString(), 18));
      let minBuyUSDT = await presaleContract.minimumDollar();
      setminBuyLim(formatUnits(minBuyUSDT.toString(), 18));
      let minBuyETH = await presaleContract.minimumETH();
      setminBuyETH(formatUnits(minBuyETH.toString(), 18));
      const usdToTokens = await presaleContract.usdtToToken("1000000");
      setoneUSDTtoToken(+formatUnits(usdToTokens.toString(), 18));
      const ethToTokens = await presaleContract.EthToToken(
        "1000000000000000000"
      );
      setoneETHtoToken(+formatUnits(ethToTokens.toString(), 18));
      if (account) {
        let usdtBal = await usdtContract.balanceOf(account);
        setbalanceUSDT(+formatUnits(usdtBal.toString(), 6));
        let walletBalance = await provider.getBalance(account);
        setbalanceETH(+formatUnits(walletBalance.toString(), 18));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presaleContract, account]);

  const buyHadler = async () => {
    if (account) {
      if (!enteredAmount) {
        setAlertState({
          open: true,
          message: `Error! Please enter a amount`,
          severity: "error",
        });
      } else if (enteredAmount <= 0) {
        setAlertState({
          open: true,
          message: `Error! Please enter a valid amount`,
          severity: "error",
        });
      } else {
        try {
          setloading(true);
          if (token === "USDT") {
            if (+enteredAmount < +minBuyLim) {
              setAlertState({
                open: true,
                message: `Minimum amount to buy is ${+minBuyLim}`,
                severity: "error",
              });
            } else {
              let allowance = await usdtContract.allowance(
                account,
                presaleAddress
              );
              allowance = +formatUnits(allowance.toString(), 6);
              if (+allowance < +enteredAmount) {
                const approve = await usdtContract.approve(
                  presaleAddress,
                  MaxUint256.toString()
                );
                await approve.wait();
              }
              const tx = await presaleContract.buyTokenUSDT(
                parseUnits(enteredAmount.toString(), 6)
              );
              await tx.wait();
              setComplete(true);
            }
          } else {
            if (+enteredAmount < +minBuyETH) {
              setAlertState({
                open: true,
                message: `Minimum amount to buy is ${+minBuyETH} ETH`,
                severity: "error",
              });
            } else {
              const tx = await presaleContract.buyTokenEth({
                value: parseUnits(enteredAmount.toString(), 18).toString(),
              });
              await tx.wait();
              setComplete(true);
            }
          }
          setEnteredAmount("");
          initProgress();
          setloading(false);
        } catch (error) {
          setloading(false);
          if (error?.data?.message) {
            setAlertState({
              open: true,
              message: error?.data?.message,
              severity: "error",
            });
          } else if (error?.reason) {
            setAlertState({
              open: true,
              message: error?.reason,
              severity: "error",
            });
          } else {
            setAlertState({
              open: true,
              message: error?.message,
              severity: "error",
            });
          }
        }
      }
    } else {
      setAlertState({
        open: true,
        message: `Error! Please connect your wallet.`,
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const calculator = async () => {
      try {
        if (token === "USDT") {
          let rec = +enteredAmount * +oneUSDTtoToken;
          setreceivedTokens(rec);
        } else {
          let rec = +enteredAmount * +oneETHtoToken;
          setreceivedTokens(rec);
        }
      } catch (error) {}
    };
    if (+enteredAmount > 0) {
      calculator();
    }
  }, [enteredAmount, tokenContract, presaleContract]);
  const initProgress = async () => {
    try {
      const dec = await tokenContract.decimals();
      const totalSold = await presaleContract.soldToken();
      const supply = await presaleContract.totalSupply();
      let prog =
        (+formatUnits(totalSold.toString(), +dec) /
          +formatUnits(supply.toString(), +dec)) *
        100;
      setProgessBar(+prog);
    } catch (error) {}
  };
  useEffect(() => {
    initProgress();
  }, [tokenContract, presaleContract]);
  return (
    <>
      <ToastNotify alertState={alertState} setAlertState={setAlertState} />

      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        sx={{
          zIndex: 1,
          "& .MuiPaper-root": {
            backgroundColor: "#1E1E1E",
            width: matches ? "100%" : "40%",
          },
        }}
      >
        <Box
          sx={{
            borderRadius: "10px",
            height: "100%",
          }}
        >
          <Box
            py={2}
            pl={3}
            pr={1}
            sx={{
              backgroundImage:
                "linear-gradient(270deg, #39E3BA 0%, rgba(57, 227, 186, 0) 100%)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <StyledTextBold sx={{ fontSize: "18px" }}>Exchange</StyledTextBold>
            <CloseIcon
              onClick={() => {
                setEnteredAmount("");
                setOpenDialog(!openDialog);
                setComplete(false);
              }}
              style={{
                cursor: "pointer",
                color: "#ffffff",
              }}
            />
          </Box>
          {loading ? (
            <Box
              display="flex"
              alignItems="center"
              flexDirection="column"
              py={3}
            >
              <RingLoader color="#ffffff" size={170} />
              <StyledText>
                YOUR TRANSACTION IS IN PROGRESS <br />
                PLEASE WAIT
              </StyledText>
            </Box>
          ) : complete ? (
            <Box p={2} textAlign="center" color="#ffffff">
              <CheckCircleIcon sx={{ color: "#57CA5C", fontSize: "100px" }} />
              <StyledText> YOUR PURCHASE HAS BEEN SUCCESSFUL!</StyledText>
            </Box>
          ) : (
            <Box py={3} px={2}>
              <Box display="flex" alignItems="center">
                <Typography
                  variant="subtitle2"
                  color="#ffffff"
                  fontSize="15px"
                  fontFamily="Barlow"
                  mt={1}
                >
                  Round 1 [$0.045]
                </Typography>
                <Box
                  bgcolor="#39E3BA"
                  fontFamily="Regular"
                  fontWeight={700}
                  borderRadius="30px"
                  px={1}
                  py={0.2}
                  ml={1}
                >
                  Live
                </Box>
              </Box>
              <StyledTextBold>Buy Cognitive (CGW)</StyledTextBold>
              <Divider
                sx={{
                  bgcolor: "#f3f3f313",
                  width: "100%",
                  height: "2px",
                  my: 4,
                }}
              />
              <Box
                sx={{
                  borderRadius: "8px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "#141414",
                }}
              >
                <TextInput
                  fullWidth
                  placeholder="Enter amount"
                  type="number"
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(e.target.value)}
                />
                <Box pr={1} display="flex" alignItems="center">
                  <img
                    src={token === "USDT" ? usdt : eth}
                    alt=""
                    style={{
                      marginRight: "4px",
                      width: "35px",
                    }}
                  />
                </Box>
              </Box>
              <Box mt={2}>
                <Box
                  sx={{
                    borderRadius: "8px",
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "#141414",
                  }}
                >
                  <TextInput
                    fullWidth
                    placeholder="Receive amount"
                    type="number"
                    value={
                      +enteredAmount > 0
                        ? parseFloat(receivedTokens).toFixed(2)
                        : ""
                    }
                  />
                  <Box pr={1} display="flex" alignItems="center">
                    <img
                      src={icon}
                      alt=""
                      style={{
                        marginRight: "4px",
                        width: "35px",
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Divider
                sx={{
                  bgcolor: "#f3f3f313",
                  width: "100%",
                  height: "2px",
                  my: 4,
                }}
              />
              {/* {token === "ETH" ? (
                <Typography
                  variant="subtitle2"
                  color="red"
                  fontSize="15px"
                  fontFamily="Mina"
                  mt={1}
                  display={+balanceETH < +enteredAmount ? "block" : "none"}
                  pl={1}
                >
                  Oops! It looks like you don't have enough amount in your
                  wallet to pay for that transaction. Please reduce the amount
                  and try again.
                </Typography>
              ) : token === "USDT" ? (
                <Typography
                  variant="subtitle2"
                  color="red"
                  fontSize="15px"
                  fontFamily="Mina"
                  mt={1}
                  display={+balanceUSDT < +enteredAmount ? "block" : "none"}
                  pl={1}
                >
                  Oops! It looks like you don't have enough amount in your
                  wallet to pay for that transaction. Please reduce the amount
                  and try again.
                </Typography>
              ) : null} */}

              <StyledButton
                width="100%"
                // onClick={() => buyHadler()}
                // disabled={
                //   (token == "USDT" && +enteredAmount < +balanceUSDT) ||
                //   (token == "ETH" && +enteredAmount < +balanceETH)
                //     ? false
                //     : true
                // }
              >
                Buy now
              </StyledButton>
            </Box>
          )}
        </Box>
      </Dialog>

      <Box height="100%" pb={10} pt={matchesMin ? 10 : 0}>
        <Container maxWidth="xl">
          <Grid container spacing={3} display="flex" alignItems="center">
            <Grid item md={6} xs={12} display="flex" justifyContent="center">
              <Box width="100%" maxWidth="556px">
                <StyledMainHeading>
                  Become a <br />
                  early investor
                </StyledMainHeading>
                <Box mt={3} />
                <StyledText>
                  We understand that the world of crypto & blockchain can be
                  confusing and overwhelming, but with Cogwise, you can trust
                  that you are getting the best info and insights.
                </StyledText>
                <Box mt={2} />
                <StyledButton width={matches ? "50%" : "30%"}>
                  Whitepaper
                </StyledButton>
              </Box>
            </Grid>

            {/* Presale stage 1 Card data  */}

            <Grid item md={6} xs={12} display="flex" justifyContent="center">
              <Box
                sx={{
                  background: "#0B0B0B",
                  border: "2px solid #f3f3f313",
                  backdropFilter: "blur(9px)",
                  borderRadius: "10px",
                  textAlign: "center",
                  width: "100%",
                  maxWidth: "556px",
                }}
              >
                <Box
                  sx={{
                    p: 3,
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Typography
                      variant="subtitle2"
                      color="#ffffff"
                      fontSize="15px"
                      fontFamily="Barlow"
                      mt={1}
                    >
                      Round 1 [$0.045]
                    </Typography>
                    <Box
                      bgcolor="#39E3BA"
                      fontFamily="Regular"
                      fontWeight={700}
                      borderRadius="30px"
                      px={1}
                      py={0.2}
                      ml={1}
                    >
                      Live
                    </Box>
                  </Box>
                  <StyledTitle textAlign="left">
                    Buy Cognitive (CGW)
                  </StyledTitle>
                  {/* Progress bar */}
                  <Box
                    mt={3}
                    sx={{
                      background: "#6C6C6C",
                      borderRadius: "25px",
                      // margin: "5px 0",
                      height: 25,
                      width: "100%",
                      // overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        backgroundImage:
                          "linear-gradient(270deg, #39E3BA 0%, rgba(57, 227, 186, 0) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "25px",
                        height: 25,
                        opacity: 1,
                        transition: "1s ease 0.3s",
                        width: `${progressBar}%`,
                      }}
                    ></div>
                    <Box
                      position="absolute"
                      color="#ffffff"
                      top="8%"
                      left="20%"
                      fontFamily="Barlow"
                    >
                      {parseFloat(progressBar).toFixed(2)}%
                    </Box>
                  </Box>
                  <Divider
                    sx={{
                      bgcolor: "#f3f3f313",
                      width: "100%",
                      height: "1px",
                      my: 4,
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          color: "#f3f3f370",
                          fontSize: "15px",
                          fontFamily: "Regular",
                          textAlign: "left",
                          mb: 1,
                        }}
                      >
                        SOLD (CGW)
                      </Box>
                      <StyledTitle>270,192,205</StyledTitle>
                      <Box
                        sx={{
                          color: "#f3f3f370",
                          fontSize: "15px",
                          fontFamily: "Regular",
                          textAlign: "left",
                          mt: 1,
                        }}
                      >
                        / 300,000,000
                      </Box>
                    </Box>
                    <Box>
                      <Box
                        sx={{
                          color: "#f3f3f370",
                          fontSize: "15px",
                          fontFamily: "Regular",
                          textAlign: "left",
                          mb: 1,
                        }}
                      >
                        RAISED (USD)
                      </Box>
                      <StyledTitle>$9,192,205</StyledTitle>
                      <Box
                        sx={{
                          color: "#f3f3f370",
                          fontSize: "15px",
                          fontFamily: "Regular",
                          textAlign: "left",
                          mt: 1,
                        }}
                      >
                        / $14,000,000
                      </Box>
                    </Box>
                  </Box>
                  <Divider
                    sx={{
                      bgcolor: "#f3f3f313",
                      width: "100%",
                      height: "1px",
                      my: 4,
                    }}
                  />
                  {account ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      flexDirection={matches ? "column" : "row"}
                    >
                      <StyledButton
                        width={matches ? "100%" : "45%"}
                        onClick={() => {
                          setOpenDialog(true);
                          setToken("USDT");
                        }}
                      >
                        Buy with usdt
                      </StyledButton>
                      <StyledButton
                        width={matches ? "100%" : "45%"}
                        onClick={() => {
                          setOpenDialog(true);
                          setToken("ETH");
                        }}
                      >
                        Buy with eth
                      </StyledButton>
                    </Box>
                  ) : (
                    <StyledButton width="100%" onClick={() => connect()}>
                      Connect Wallet
                    </StyledButton>
                  )}
                  <Box
                    mt={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexDirection={matches ? "column" : "row"}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <a
                        // href="https://renq.io/how-to-buy"
                        // target="_blank"
                        rel="noreferrer"
                        style={{
                          textDecoration: "none",
                          color: "#fff",
                          marginRight: "15px",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            cursor: "pointer",
                            fontSize: "18px",
                            fontFamily: "Barlow",
                            "&:hover": {
                              color: "#FB497F",
                              borderBottom: "0.5px solid #FB497F",
                            },
                          }}
                        >
                          How to buy?
                        </Typography>
                      </a>
                      <Divider
                        sx={{
                          background: "#7A7A7A",
                          height: "13px",
                          width: "2.5px",
                        }}
                      />
                      <a
                        // href="https://renq.io/new-to-crypto"
                        // target="_blank"
                        rel="noreferrer"
                        style={{
                          textDecoration: "none",
                          color: "#fff",
                          marginLeft: "15px",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            cursor: "pointer",
                            fontSize: "18px",
                            fontFamily: "Barlow",
                            "&:hover": {
                              color: "#FB497F",
                              borderBottom: "0.5px solid #FB497F",
                            },
                          }}
                        >
                          New to crypto?
                        </Typography>
                      </a>
                    </Box>
                    <Box
                      mt={matches ? 3 : 0}
                      display="flex"
                      alignItems="center"
                    >
                      <img
                        style={{ marginRight: "10px" }}
                        src={eth}
                        width="35px"
                        alt=""
                      />
                      <img src={usdt} width="35px" alt="" />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default PresalePage;

import React, { useContext } from "react";
import { Container, Box } from "@mui/material";
import { logo } from "./SmallComponents/Images";
import { AppContext } from "../utils";
import { StyledButton } from "./SmallComponents/AppComponents";

export default function Header() {
  const { account, connect, disconnect } = useContext(AppContext);
  return (
    <>
      <Box
        sx={{
          background: "transparent",
        }}
        height="92px"
        width="100%"
        py={1}
      >
        <Container maxWidth="xl">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <img width="160px" src={logo} alt="" />
            {account ? (
              <StyledButton width="150px" onClick={() => disconnect()}>
                {account.slice(0, 4) + "..." + account.slice(-4)}
              </StyledButton>
            ) : (
              <StyledButton width="150px" onClick={() => connect()}>
                Connect
              </StyledButton>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
}

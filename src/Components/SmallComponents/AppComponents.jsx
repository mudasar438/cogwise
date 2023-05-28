import {
  Alert,
  Box,
  InputBase,
  Snackbar,
  styled,
  useMediaQuery,
} from "@mui/material";
import { Button } from "@mui/material";

export function ToastNotify({ alertState, setAlertState }) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={alertState.open}
      autoHideDuration={10000}
      key={"top center"}
      onClose={() => setAlertState({ ...alertState, open: false })}
    >
      <Alert
        onClose={() => setAlertState({ ...alertState, open: false })}
        severity={alertState.severity}
      >
        {alertState.message}
      </Alert>
    </Snackbar>
  );
}

export function StyledButton({ children, ...props }) {
  return (
    <>
      <Button
        {...props}
        sx={{
          color: "#ffffff",
          background: "#7900EE",
          fontSize: "18px",
          mt: 1,
          height: "50px",
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          textTransform: "capitalize",
          fontFamily: "Regular",
          borderRadius: "30px",
          width: props.width,
          "&.Mui-disabled": {
            color: "#979EA7",
          },
          "&:hover": {
            background: "#7900EE",
          },
        }}
      >
        {children}
      </Button>
    </>
  );
}
export function StyledText({ children, ...props }) {
  return (
    <>
      <Box
        {...props}
        sx={{
          color: "#ffffff",
          fontSize: "18px",
          fontFamily: "Regular",
          fontWeight: "400",
          mt: props.mt,
          textAlign: props.textAlign,
        }}
      >
        {children}
      </Box>
    </>
  );
}
export function StyledTitle({ children, ...props }) {
  const matches = useMediaQuery("(max-width:700px)");
  return (
    <>
      <Box
        {...props}
        sx={{
          color: "#ffffff",
          fontSize: matches ? "25px" : "35px",
          fontFamily: "Regular",
          // fontWeight: "600",
          mt: props.mt,
        }}
      >
        {children}
      </Box>
    </>
  );
}
export function StyledMainHeading({ children, ...props }) {
  const matches = useMediaQuery("(max-width:700px)");
  return (
    <>
      <Box
        {...props}
        sx={{
          color: "#ffffff",
          fontSize: matches ? "40px" : "60px",
          fontFamily: "Extra Bold",
          fontWeight: "900",
          mt: props.mt,
        }}
      >
        {children}
      </Box>
    </>
  );
}
export function StyledTextBold({ children, ...props }) {
  return (
    <>
      <Box
        {...props}
        sx={{
          color: "#ffffff",
          fontSize: "22px",
          fontFamily: "Regular",
          fontWeight: props.fontWeight,
          mt: props.mt,
          textAlign: props.textAlign,
        }}
      >
        {children}
      </Box>
    </>
  );
}

export const TextInput = styled(InputBase)({
  "& .MuiInputBase-input": {
    height: "50px",
    fontSize: "18px",
    fontFamily: "Regular",
    textAlign: "left",
    color: "#ffffff",
    backgroundColor: "transparent",
    paddingLeft: "15px",
    "&::-webkit-outer-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    "&::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
  },
});

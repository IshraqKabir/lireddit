import React from "react";
import {Box} from "@chakra-ui/react";

interface WrapperProps {
  variant?: string;
}

export const Wrapper: React.FC<WrapperProps> = (props) => {
  const {children, variant = "regular" } = props;
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
    >
      {children}
    </Box>
  );
};

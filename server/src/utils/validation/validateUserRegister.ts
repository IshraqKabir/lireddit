import { UsernamePasswordInput } from "./inputType/UsernamePasswordInput";
import { validateEmail } from "../validateEmail";

export const validateUserRegister = (options: UsernamePasswordInput) => {
  const { email, username, password } = options;

  if (!validateEmail(email)) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  if (username.length < 3) {
    return [
      {
        field: "username",
        message: "username has to be atleaset 3 characters long.",
      },
    ];
  }

  if (username.includes("@")) {
    return [
      {
        field: "username",
        message: "username cannot have @ symbol",
      },
    ];
  }

  if (password.length < 3) {
    return [
      {
        field: "password",
        message: "password has to be atleaset 3 characters long.",
      },
    ];
  }

  return null;
};

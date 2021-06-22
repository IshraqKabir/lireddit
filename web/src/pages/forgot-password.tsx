import React, { ReactElement, useState } from "react";
import { Formik, Form } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";

export interface loginProps { }

function ForgotPassword({ }: loginProps): ReactElement | null {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async ({ email }) => {
                    await forgotPassword({ email });

                    setComplete(true);
                }}
            >
                {({ isSubmitting }) => complete ?
                    <Box>
                        We have sent a password reset link to your email (if the account exists).
                    </Box>
                    : (
                        <Form>
                            <InputField
                                name="email"
                                placeholder="Email"
                                label="Email"
                                type="email"
                            />
                            <Button
                                type="submit"
                                colorScheme="teal"
                                mt={4}
                                isLoading={isSubmitting}
                            >
                                Send Reset Password Email
                            </Button>
                        </Form>
                    )}
            </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);

import React, { ReactElement } from "react";
import { Formik, Form } from "formik";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { useLoginUserMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

export interface loginProps { }

function Login({ }: loginProps): ReactElement | null {
    const router = useRouter();

    const [, login] = useLoginUserMutation();

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    console.log(values);
                    const { data } = await login(values);
                    const { user, errors } = data?.loginUser;

                    if (errors) {
                        setErrors(toErrorMap(errors));
                    } else if (user) {
                        // navigate
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="usernameOrEmail"
                            placeholder="Username / Email"
                            label="Username / Email"
                        />
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="password"
                                type="password"
                            />
                        </Box>
                        <Flex>
                            <NextLink href="/forgot-password">
                                <Link my={4} ml="auto" textDecoration="underline">
                                    Forgot Password?
                                </Link>
                            </NextLink>
                        </Flex>
                        <Button
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(Login);

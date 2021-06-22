import React, { ReactElement, useState } from "react";
import { GetServerSideProps } from "next";
import { Wrapper } from "../../components/Wrapper";
import { Form, Formik } from "formik";
import { InputField } from "../../components/InputField";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";

import NextLink from "next/link"

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const { token } = params;

    return {
        props: { token },
    };
};

interface IProps {
    token: string;
}

function ChangePassword({ token }: IProps): ReactElement | null {
    const router = useRouter();
    const [, ChangePassword] = useChangePasswordMutation();

    const [tokenError, setTokenEror] = useState("")

    return (<Wrapper variant="small">
        <Formik
            initialValues={{ newPassword: "" }}
            onSubmit={async (values, { setErrors }) => {
                const { newPassword } = values;
                const response = await ChangePassword({ newPassword, token })

                const { user, errors } = response.data.changePassword;

                if (errors) {
                    const errorMap = toErrorMap(errors);

                    if ('token' in errorMap) {
                        setTokenEror(errorMap.token);
                    }

                    setErrors(errorMap)
                } else if (user) {
                    // navigate
                    router.push("/");
                }
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    <InputField
                        name="newPassword"
                        placeholder="New Passowrd"
                        label="New Password"
                        type="password"
                    />
                    {tokenError && (
                        <Flex alignItems="center">
                            <Box color="red" marginY={2}>{tokenError}</Box>
                            <NextLink href="/forgot-password">
                                <Link marginLeft={2} textDecoration="underline">
                                    Click Here To Get A New Token 
                                </Link>
                            </NextLink>
                        </Flex>
                    )}
                    <Button
                        type="submit"
                        colorScheme="teal"
                        mt={4}
                        isLoading={isSubmitting}
                    >
                        Change Password
                    </Button>
                </Form>
            )}
        </Formik>
    </Wrapper>)
}


// @ts-ignore
export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword);

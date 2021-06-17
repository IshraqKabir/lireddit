import React, {ReactElement} from "react";
import {FormControl, FormLabel, Input} from "@chakra-ui/react";
import {Formik, Form} from "formik";


export interface registerProps {}

export default function Register({}: registerProps): ReactElement | null {
  const validateName = () => {};

  return (
    <Wrapper>

      <Formik
        initialValues={{username: "", password: ""}}
        onSubmit={(values) => console.log(values)}
      >
        {({values, handleChange}) => (
          <Form>
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input value={values.username} onChange={handleChange} id="username" placeholder="username" />
              {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */}
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}


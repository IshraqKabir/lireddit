import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { token } = params;

  return {
    props: { token },
  };
};

interface IProps {
  token: string;
}

export default function ChangePassword({ token }: IProps): ReactElement | null {
  return <div>{token}</div>;
}

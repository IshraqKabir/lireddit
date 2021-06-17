import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";

import express from "express";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
<<<<<<< HEAD
import cors from "cors";
=======
>>>>>>> 4c238c2ece569165ed6dc4ceaf4e3644c61d9133

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    auth_pass:
      "jMlRRr1wlNCBZVq0SeCSZ5DKbvHVU+sfjKDK2D56Hl6tYzdpQX5CgMgWrxCqRn8cdLDERUQ5GNh9B12T",
  });

  app.use(
<<<<<<< HEAD
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
=======
>>>>>>> 4c238c2ece569165ed6dc4ceaf4e3644c61d9133
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: "adamjee131228",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }: MyContext) => ({ em: orm.em, req, res }),
  });

<<<<<<< HEAD
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
=======
  apolloServer.applyMiddleware({ app });
>>>>>>> 4c238c2ece569165ed6dc4ceaf4e3644c61d9133

  app.listen(4000, () => {
    console.log(`server started at localhost:4000`);
  });
};

main().catch((err) => console.log(err));
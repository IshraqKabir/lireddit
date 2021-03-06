import "reflect-metadata"; // needed for typeorm
import { COOKIE_NAME, __prod__ } from "./constants";

import express from "express";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";

import { createConnection } from "typeorm"
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const main = async () => {
    createConnection({
        type: "postgres",
        database: "lireddit2",
        username: "ishraqkabir",
        password: "password",
        logging: "all",
        synchronize: true,
        entities: [Post, User]
    });

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis({
        password:
            "jMlRRr1wlNCBZVq0SeCSZ5DKbvHVU+sfjKDK2D56Hl6tYzdpQX5CgMgWrxCqRn8cdLDERUQ5GNh9B12T",
    });

    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true,
        })
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
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
        context: ({ req, res }: MyContext) => ({ req, res, redis }),
    });

    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log(`server started at localhost:4000`);
    });
};

main().catch((err) => console.log(err));

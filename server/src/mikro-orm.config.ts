import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const mikroConfig = {
  user: "ishraqkabir",
  password: "password",
  dbName: "lireddit",
  type: "postgresql",
  debug: !__prod__,
  entities: [Post, User],
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migrat
  },
} as Parameters<typeof MikroORM.init>[0];

export default mikroConfig;

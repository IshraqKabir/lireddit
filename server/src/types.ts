import { Request, Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";

export type SessionWithUser = Session & { userId: number };

export type MyContext = {
  req: Request & { session: SessionWithUser };
  res: Response;
  redis: Redis;
};

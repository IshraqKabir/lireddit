import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { Session } from "express-session";

export type SessionWithUser = Session & { userId: number };

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: SessionWithUser };
  res: Response;
};
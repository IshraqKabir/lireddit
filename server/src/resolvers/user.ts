import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
  Query,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req, em }: MyContext
  ) {
    // not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });

    return user;
  }

  @Mutation(() => UserResponse)
  async registerUser(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;

    if (username.length <= 5) {
      return {
        errors: [
          {
            field: "username",
            message: "username has to be atleaset 5 characters long.",
          },
        ],
      };
    }

    if (password.length <= 5) {
      return {
        errors: [
          {
            field: "password",
            message: "password has to be atleaset 5 characters long.",
          },
        ],
      };
    }

    const matchingUser = await em.findOne(User, { username });

    if (matchingUser) {
      return {
        errors: [
          {
            field: "username",
            message: "username already exists",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(password);

    const user = em.create(User, { username, password: hashedPassword });
    await em.persistAndFlush(user);
    return { user };
  }

  @Mutation(() => UserResponse)
  async loginUser(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;

    const user = await em.findOne(User, { username: username.toLowerCase() });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [ {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  // @Query(() => [User])
  // users(@Ctx() { em }: MyContext): Promise<User[]> {
  //   return em.find(User, {});
  // }

  // @Query(() => User, { nullable: true })
  // post(
  //   @Arg("id", () => Int) id: number,
  //   @Ctx() { em }: MyContext
  // ): Promise<User | null> {
  //   return em.findOne(User, { id });
  // }

  // @Mutation(() => Post, { nullable: true })
  // async updateUser(
  //   @Arg("id", () => Int) id: number,
  //   @Arg("title") title: string,
  //   @Ctx() { em }: MyContext
  // ): Promise<Post | null> {
  //   const post = await em.findOne(Post, { id });
  //   if (!post) {
  //     return null;
  //   }

  //   if (typeof title !== "undefined") {
  //     post.title = title;
  //     await em.persistAndFlush(post);
  //   }

  //   return post;
  // }

  // @Mutation(() => Boolean)
  // async deletePost(
  //   @Arg("id", () => Int) id: number,
  //   @Ctx() { em }: MyContext
  // ): Promise<boolean> {
  //   try {
  //     await em.nativeDelete(Post, { id });
  //   } catch {
  //     return false;
  //   }

  //   return true;
  // }
}

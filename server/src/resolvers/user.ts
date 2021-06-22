import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Resolver, Query } from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/validation/inputType/UsernamePasswordInput";
import { validateUserRegister } from "../utils/validation/validateUserRegister";
import { UserResponse } from "../utils/validation/objectType/UserResponse";
import { validateEmail } from "../utils/validateEmail";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { req, em, redis }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "password length must be greater than 2",
                    }
                ]
            }
        }

        const key = `${FORGOT_PASSWORD_PREFIX}${token}`
        const userId = await redis.get(key)

        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired"
                    }
                ]
            }
        }

        const user = await em.findOne(User, { id: parseInt(userId) });

        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists"
                    }
                ]
            }
        }

        user.password = await argon2.hash(newPassword);
        await em.persistAndFlush(user);

        await redis.del(key);

        // login user after change password
        req.session.userId = user.id;

        return { user: user as User, }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { em, redis }: MyContext
    ) {
        const user = await em.findOne(User, { email });

        if (!user) {
            // the email is not in the db
            // no need to inform the user
            return true;
        }

        const token = v4();

        await redis.set(
            `${FORGOT_PASSWORD_PREFIX}${token}`,
            user.id,
            "ex",
            1000 * 60 * 15 // 15 minutes
        );

        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">Click Here To Change Password</a>`
        );
        return true;
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() { req, em }: MyContext) {
        // not logged in
        if (!req.session.userId) {
            return null;
        }

        const user = await em.findOne(User, { id: req.session.userId });

        return user;
    }

    @Query(() => [User])
    async users(@Ctx() { em }: MyContext) {
        const users = await em.find(User, {});

        return users;
    }

    @Mutation(() => UserResponse)
    async registerUser(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
        const { email, username, password } = options;

        const errors = validateUserRegister(options);

        if (errors) {
            return { errors };
        }

        const matchingEmail = await em.findOne(User, { email });

        if (matchingEmail) {
            const errors = [
                {
                    field: "email",
                    message: "email already exists",
                },
            ];

            return { errors };
        }

        const matchingUsername = await em.findOne(User, { username });

        if (matchingUsername) {
            const errors = [
                {
                    field: "username",
                    message: "username already exists",
                },
            ];

            return { errors };
        }
        const hashedPassword = await argon2.hash(password);

        const user = em.create(User, { username, email, password: hashedPassword });
        await em.persistAndFlush(user);
        return { user };
    }

    @Mutation(() => UserResponse)
    async loginUser(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(
            User,
            usernameOrEmail.includes("@")
                ? { email: usernameOrEmail }
                : { username: usernameOrEmail }
        );

        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: `${
                            validateEmail(usernameOrEmail) ? "Email" : "Username"
                            } doesn't exist`,
                    },
                ],
            };
        }

        const valid = await argon2.verify(user.password, password);

        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password",
                    },
                ],
            };
        }

        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }

                res.clearCookie(COOKIE_NAME);
                resolve(true);
            })
        );
    }
}

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
        @Ctx() { req, redis }: MyContext
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
        const userIdString = await redis.get(key);

        if (!userIdString || userIdString === null) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired"
                    }
                ]
            }
        }

        const userId = parseInt(userIdString);


        const user = await User.findOne(userId);

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

        const password = await argon2.hash(newPassword);

        await User.update({ id: userId }, { password: password });

        await redis.del(key);

        // login user after change password
        req.session.userId = user.id;

        return { user: user as User, }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } });

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
    async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
        // not logged in
        if (!req.session.userId) {
            return undefined;
        }

        return User.findOne({ where: { id: req.session.userId } });
    }

    @Query(() => [User])
    async users(): Promise<User[]> {
        return await User.find();
    }

    @Mutation(() => UserResponse)
    async registerUser(
        @Arg("options") options: UsernamePasswordInput,
    ): Promise<UserResponse> {
        const { email, username, password } = options;

        const errors = validateUserRegister(options);

        if (errors) {
            return { errors };
        }

        const matchingEmail = await User.findOne({ where: { email } });

        if (matchingEmail) {
            const errors = [
                {
                    field: "email",
                    message: "email already exists",
                },
            ];

            return { errors };
        }

        const matchingUsername = await User.findOne({ where: { username } });

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

        return {
            "user": await User.create({ username, email, password: hashedPassword }).save()
        };
    }

    @Mutation(() => UserResponse)
    async loginUser(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const isEmail = usernameOrEmail.includes("@");
        const user = await User.findOne(
            {
                where: {
                    [`${isEmail ? "email" : "username"}`]: usernameOrEmail,
                }
            }
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

import { Post } from "../entities/Post";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        return await Post.find();
    }

    @Query(() => Post, { nullable: true })
    async post(
        @Arg("id", () => Int) id: number,
    ): Promise<Post | undefined> {
        return await Post.findOne(id);
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("title") title: string,
    ): Promise<Post> {
        return await Post.create({ title }).save();
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title") title: string,
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: { id } });
        if (!post) {
            return null;
        }

        if (typeof title !== "undefined") {
            await Post.update({ id }, { title });
        }
        

        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id", () => Int) id: number,
    ): Promise<boolean> {
        await Post.delete(id);
        return true;
    }
}

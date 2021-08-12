import { Posts } from '../entity/posts.entity';

export const resolvers = {
  Query: {
    posts: async () => {
      return await Posts.find();
    },
    post: async (_: any, args: any) => {
      const { id } = args;
      return await Posts.findOne({ id });
    },
    hello: () => 'hello world',
  },
  Mutation: {
    addPost: async (_: any, args: any) => {
      const { title, text } = args;
      const post = Posts.create({
        title,
        text,
      });
      await post.save();
      return post;
    },
    deletePost: async (_: any, args: any) => {
      const { id } = args;
      try {
        await Posts.delete({ id });
        return true;
      } catch (e) {
        return false;
      }
    },
  },
};

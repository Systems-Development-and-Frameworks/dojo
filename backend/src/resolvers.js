const resolvers = {
  Query: {
    posts: (_, __, { dataSources }) => dataSources.db.getPosts(),
    users: (_, __, { dataSources }) => dataSources.db.getUsers()
  },
  Mutation: {
    createPost: (_, { post }, { dataSources }) => dataSources.db.createPost(post.title, 0, post.author.name),
    deletePost: (_, { id }, { dataSources }) => dataSources.db.deletePost(id),
    upvotePost: (_, { id, voter }, { dataSources }) => dataSources.db.upvotePost(id, voter.name),
    downvotePost: (_, { id, voter }, { dataSources }) => dataSources.db.downvotePost(id, voter.name)
  }
}

export default resolvers

const { ApolloServer, AuthenticationError } = require("apollo-server");
const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");
const schema = require("./schema");
const resolvers = require("./resolvers");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  context: ({ req }) => {
    const token = req.headers.authorization || "";

    if (token !== "test-token") {
      throw new AuthenticationError("Not authorised");
    }
  },
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

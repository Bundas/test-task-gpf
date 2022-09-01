require("dotenv").config();

const { ApolloServer, AuthenticationError } = require("apollo-server");
const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");
const schema = require("./schema");
const resolvers = require("./resolvers");
const { createClient, createRepository } = require("./repository");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  csrfPrevention: true,
  cache: "bounded",
  context: ({ req }) => {
    const token = req.headers.authorization || "";

    if (token !== process.env.GRAPHQL_SERVER_API_KEY) {
      throw new AuthenticationError("Not authorised");
    }

    const grpcClient = createClient(process.env.GRPC_SERVER_ENDPOINT);
    const repository = createRepository(
      grpcClient,
      process.env.GRPC_SERVER_API_KEY
    );

    return { simpleDataSource: repository };
  },
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

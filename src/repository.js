const grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const packageDefinition = protoLoader.loadSync(
  process.env.PATH_TO_PROTOBUF_SCHEMA,
  options
);

const {
  djtestpoms: { StoreManager },
} = grpc.loadPackageDefinition(packageDefinition);

const createFunctionWrapperForStreams = (client, apiKey) => (func) => (
  externalParams
) => {
  return new Promise((resolve, reject) => {
    const messages = [];
    const params = { apiKey, ...externalParams };
    const stream = func.call(client, params);
    stream.on("data", (data) => {
      messages.push(data);
    });

    stream.on("end", () => {
      resolve(messages);
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

const createFunctionWrapper = (client, apiKey) => (func) => (
  externalParams
) => {
  return new Promise((resolve, reject) => {
    const params = { apiKey, ...externalParams };
    func.call(client, params, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
};

const createRepository = (client, apiKey) => {
  const promisifyStreamFunction = createFunctionWrapperForStreams(
    client,
    apiKey
  );

  const promisifyFunction = createFunctionWrapper(client, apiKey);

  return {
    getProducts: promisifyStreamFunction(client.getProducts),
    searchProducts: promisifyStreamFunction(client.searchProducts),
    getCategories: promisifyStreamFunction(client.getCategories),
    getOrders: promisifyStreamFunction(client.getOrders),
    createProduct: promisifyFunction(client.createProduct),
    editProduct: promisifyFunction(client.editProduct),
    createOrder: promisifyFunction(client.createOrder),
    changeOrderStatus: promisifyFunction(client.changeOrderStatus),
  };
};

const createClient = (endpoint) => {
  return new StoreManager(endpoint, grpc.credentials.createInsecure());
};

module.exports = { createClient, createRepository };

const grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

const pathToProto = `/Users/jan_burda1/Documents/djtestpoms/djtestpoms/djtestpoms.proto`;
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
const packageDefinition = protoLoader.loadSync(pathToProto, options);
const {
  djtestpoms: { StoreManager },
} = grpc.loadPackageDefinition(packageDefinition);

const client = new StoreManager(
  "localhost:8080",
  grpc.credentials.createInsecure()
);

const createFunctionWrapperForStreams = (client) => (func) => (
  externalParams
) => {
  return new Promise((resolve, reject) => {
    const messages = [];
    const params = { apiKey: "dQw4w9WgXcQ", ...externalParams };
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

const createFunctionWrapper = (client) => (func) => (externalParams) => {
  return new Promise((resolve, reject) => {
    const params = { apiKey: "dQw4w9WgXcQ", ...externalParams };
    func.call(client, params, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
};

const createRepo = (client) => {
  const promisifyStreamFunction = createFunctionWrapperForStreams(client);
  const promisifyFunction = createFunctionWrapper(client);

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

const repo = createRepo(client);

module.exports = { client, repo };

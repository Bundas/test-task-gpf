const { util } = require("protobufjs");

const resolvers = {
  Query: {
    getOrders: (_, __, { simpleDataSource }) => {
      return simpleDataSource.getOrders();
    },
    getProducts: async (_, args, { simpleDataSource }) => {
      const productsResponse = await simpleDataSource.getProducts({
        ids: args.ids,
      });

      return productsResponse.map(({ product }) => product);
    },
    searchProducts: async (_, args, { simpleDataSource }) => {
      const productsResponse = await simpleDataSource.searchProducts({
        name: args.name,
      });
      return productsResponse.map(({ product }) => product);
    },
    getCategories: async (_, __, { simpleDataSource }) => {
      const categories = await simpleDataSource.getCategories();
      return categories;
    },
  },
  Mutation: {
    createOrder: async (_, { input }, { simpleDataSource }) => {
      const items = Object.fromEntries(
        input.orderItems.map(({ productId, quantity }) => [productId, quantity])
      );

      const result = await simpleDataSource.createOrder({
        items,
      });

      return {
        recordId: result.id,
        record: result,
      };
    },
    changeOrderStatus: async (_, { input }, { simpleDataSource }) => {
      try {
        const result = await simpleDataSource.changeOrderStatus({
          order_id: input.orderId,
          status: input.status,
        });

        return {
          __typename: "ChangeOrderStatusPayload",
          recordId: result.id,
          record: result,
        };
      } catch (error) {
        if (error.details === "Order Not Found") {
          return {
            __typename: "OrderNotFoundError",
            message: error.details,
            orderId: input.orderId,
          };
        }
      }
    },
    createProduct: async (_, { input }, { simpleDataSource }) => {
      const result = await simpleDataSource.createProduct({
        name: input.name,
        color: input.color,
        price: input.price,
        category_id: input.categoryId,
      });

      return {
        recordId: result.id,
        record: result,
      };
    },
    editProduct: async (_, { input }, { simpleDataSource }) => {
      const result = await simpleDataSource.editProduct({
        product: {
          id: input.productId,
          name: input.name,
          color: input.color,
          price: input.price,
          category_id: input.categoryId,
        },
      });

      return {
        recordId: result.id,
        record: result,
      };
    },
  },
  Order: {
    items: async (parent, _, { simpleDataSource }) => {
      const productIds = Object.keys(parent.items).map((hashedId) =>
        util.longFromHash(hashedId).toString()
      );

      const productsResponse = await simpleDataSource.getProducts({
        ids: productIds,
      });
      const products = productsResponse.map(({ product }) => product);

      const items = Object.entries(parent.items).map(([hashedId, quantity]) => {
        const productId = util.longFromHash(hashedId).toString();
        const product = products.find((product) => product?.id === productId);

        return { product, quantity };
      });

      return items;
    },
  },
  Product: {
    category: async (parent, _, { simpleDataSource }) => {
      const categories = await simpleDataSource.getCategories();

      const category = categories.find(
        (category) => category.id === parent.category_id
      );

      return category;
    },
  },
};

module.exports = resolvers;

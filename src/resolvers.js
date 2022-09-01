const { util } = require("protobufjs");

const { repo } = require("./util");

const resolvers = {
  Query: {
    getOrders: () => {
      return repo.getOrders();
    },
    getProducts: async (_, args) => {
      const productsResponse = await repo.getProducts({
        ids: args.ids,
      });

      return productsResponse.map(({ product }) => product);
    },
    searchProducts: async (parent, args) => {
      const productsResponse = await repo.searchProducts({ name: args.name });
      return productsResponse.map(({ product }) => product);
    },
    getCategories: async () => {
      const categories = await repo.getCategories();
      return categories;
    },
  },
  Mutation: {
    createOrder: async (_, { input }) => {
      const items = Object.fromEntries(
        input.orderItems.map(({ productId, quantity }) => [productId, quantity])
      );

      const result = await repo.createOrder({
        items,
      });

      return {
        recordId: result.id,
        record: result,
      };
    },
    changeOrderStatus: async (_, { input }) => {
      const result = await repo.changeOrderStatus({
        order_id: input.orderId,
        status: input.status,
      });

      return {
        recordId: result.id,
        record: result,
      };
    },
    createProduct: async (_, { input }) => {
      const result = await repo.createProduct({
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
    editProduct: async (_, { input }) => {
      const result = await repo.editProduct({
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
    items: async (parent) => {
      const productIds = Object.keys(parent.items).map((hashedId) =>
        util.longFromHash(hashedId).toString()
      );

      const productsResponse = await repo.getProducts({ ids: productIds });
      const products = productsResponse.map(({ product }) => product);

      const items = Object.entries(parent.items).map(([hashedId, quantity]) => {
        const productId = util.longFromHash(hashedId).toString();
        const product = products.find((product) => product.id === productId);

        return { product, quantity };
      });

      return items;
    },
  },
  Product: {
    category: async (parent) => {
      const categories = await repo.getCategories();

      const category = categories.find(
        (category) => category.id === parent.category_id
      );

      return category;
    },
  },
};

module.exports = resolvers;

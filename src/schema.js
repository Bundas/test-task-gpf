const { gql } = require("apollo-server");

const schema = gql`
  enum OrderStatus {
    CREATED
    READY_TO_SHIP
    SHIPPED
    DELIVERED
    CANCELLED
  }

  input CreateProductInput {
    name: String!
    color: String!
    price: Float!
    categoryId: ID!
  }

  input CreateOrderInput {
    orderItems: [OrderItemInput!]!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input ChangeOrderStatusInput {
    orderId: ID!
    status: OrderStatus!
  }

  input CreateProductInput {
    name: String!
    color: String!
    price: Float!
    categoryId: ID!
  }

  input EditProductInput {
    productId: ID!
    name: String!
    color: String!
    price: Float!
    categoryId: ID!
  }

  interface BaseError {
    message: String!
  }

  type OrderNotFoundError implements BaseError {
    message: String!
    orderId: String!
  }

  type Category {
    id: ID!
    name: String!
  }

  type Product {
    id: ID!
    name: String!
    color: String!
    price: Float!
    category: Category
  }

  type OrderItem {
    product: Product
    quantity: Int!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    items: [OrderItem!]!
  }

  type CreateProductPayload {
    recordId: ID
    record: Product
  }

  type EditProductPayload {
    recordId: ID
    record: Product
  }

  type CreateOrderPayload {
    recordId: ID
    record: Order
    errorMessage: String
  }

  type ChangeOrderStatusPayload {
    recordId: ID
    record: Order
  }

  type Query {
    getProducts(ids: [ID!]!): [Product]!
    searchProducts(name: String!): [Product!]!

    getCategories: [Category!]!
    getOrders: [Order!]!
  }

  union ChangeOrderStatusResult = ChangeOrderStatusPayload | OrderNotFoundError

  type Mutation {
    createProduct(input: CreateProductInput!): CreateProductPayload
    editProduct(input: EditProductInput!): EditProductPayload

    createOrder(input: CreateOrderInput!): CreateOrderPayload
    changeOrderStatus(input: ChangeOrderStatusInput!): ChangeOrderStatusResult
  }
`;

module.exports = schema;

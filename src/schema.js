const { gql } = require("apollo-server");

const schema = gql`
  type Category {
    id: ID!
    name: String!
  }

  type Product {
    id: ID!
    name: String!
    color: String!
    price: Float!
    category: Category!
  }

  enum OrderStatus {
    CREATED
    READY_TO_SHIP
    SHIPPED
    DELIVERED
    CANCELLED
  }

  type OrderItem {
    product: Product!
    quantity: Int!
  }

  type Order {
    id: ID!
    status: OrderStatus!
    items: [OrderItem!]!
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
  }

  type ChangeOrderStatusPayload {
    recordId: ID
    record: Order
  }

  type Query {
    getProducts(ids: [ID!]!): [Product!]!
    searchProducts(name: String!): [Product!]!

    getCategories: [Category!]!
    getOrders: [Order!]!
  }

  type Mutation {
    createProduct(input: CreateProductInput!): CreateProductPayload
    editProduct(input: EditProductInput!): EditProductPayload

    createOrder(input: CreateOrderInput!): CreateOrderPayload
    changeOrderStatus(input: ChangeOrderStatusInput!): ChangeOrderStatusPayload
  }
`;

module.exports = schema;

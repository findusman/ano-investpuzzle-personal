import { PRODUCTS } from "_app/enums";

export const testUsers = [
  {
    firstName: "Bolt",
    lastName: "Tester",
    email: "tester@bolt.test",
    password: "123123123",
    username: "tester",
    product: PRODUCTS.BOLT_PLUS,
  },
  {
    firstName: "Jone",
    lastName: "Doe",
    email: "tester1@bolt.test",
    password: "123123123",
    username: "tester1",
    product: PRODUCTS.BOLT_PLUS,
  },
];

export const defaultUser = testUsers[0];

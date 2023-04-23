import { expect } from "chai";
import * as request from "supertest";
import { boltIdModel, userModel, userProfileModel } from "_app/models";

import { server } from "../../server";
import { cleanDatabase, connectDatabase, disconnectDatabase } from "../helper";
import { defaultUser, testUsers } from "../samples";

const api = request(server);

before(async () => {
  await connectDatabase();
  await cleanDatabase();
});
after(async () => {
  await disconnectDatabase();
});

describe("Auth API", () => {
  describe("/auth/register", () => {
    it("user register success with vaild signup info:200", async function () {
      const res = await api.post("/auth/register").send(defaultUser).expect(200);
      expect(res.body).have.property("token");
    });
    it("user register failure with duplicated user email:409", async function () {
      await api
        .post("/auth/register")
        .send({ ...testUsers[1], email: defaultUser.email })
        .expect(409);
    });
    it("user register failure with duplicated username:409", async function () {
      await api
        .post("/auth/register")
        .send({ ...testUsers[1], username: defaultUser.username })
        .expect(409);
    });
  });

  describe("/auth/login", () => {
    it("user login success with valid user info:200", async function () {
      const res = await api
        .post("/auth/login/")
        .send({ email: defaultUser.email, password: defaultUser.password })
        .expect(200);
      expect(res.body.user.email).to.equal(defaultUser.email);
    });
  });

  describe("/auth/emailExistCheck", () => {
    it("email check with with existing one:200", async function () {
      const res = await api.post("/auth/emailExistCheck/").send({ email: defaultUser.email });
      expect(res.body.exists).to.equal(true);
    });
    it("email check with with non-existing one:200", async function () {
      const res = await api.post("/auth/emailExistCheck/").send({ email: testUsers[1].email });
      expect(res.body.exists).to.equal(false);
    });
  });
});

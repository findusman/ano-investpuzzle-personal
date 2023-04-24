"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const request = require("supertest");
const server_1 = require("../../server");
const helper_1 = require("../helper");
const samples_1 = require("../samples");
const api = request(server_1.server);
before(async () => {
    await (0, helper_1.connectDatabase)();
    await (0, helper_1.cleanDatabase)();
});
after(async () => {
    await (0, helper_1.disconnectDatabase)();
});
describe("Auth API", () => {
    describe("/auth/register", () => {
        it("user register success with vaild signup info:200", async function () {
            const res = await api.post("/auth/register").send(samples_1.defaultUser).expect(200);
            (0, chai_1.expect)(res.body).have.property("token");
        });
        it("user register failure with duplicated user email:409", async function () {
            await api
                .post("/auth/register")
                .send(Object.assign(Object.assign({}, samples_1.testUsers[1]), { email: samples_1.defaultUser.email }))
                .expect(409);
        });
        it("user register failure with duplicated username:409", async function () {
            await api
                .post("/auth/register")
                .send(Object.assign(Object.assign({}, samples_1.testUsers[1]), { username: samples_1.defaultUser.username }))
                .expect(409);
        });
    });
    describe("/auth/login", () => {
        it("user login success with valid user info:200", async function () {
            const res = await api
                .post("/auth/login/")
                .send({ email: samples_1.defaultUser.email, password: samples_1.defaultUser.password })
                .expect(200);
            (0, chai_1.expect)(res.body.user.email).to.equal(samples_1.defaultUser.email);
        });
    });
    describe("/auth/emailExistCheck", () => {
        it("email check with with existing one:200", async function () {
            const res = await api.post("/auth/emailExistCheck/").send({ email: samples_1.defaultUser.email });
            (0, chai_1.expect)(res.body.exists).to.equal(true);
        });
        it("email check with with non-existing one:200", async function () {
            const res = await api.post("/auth/emailExistCheck/").send({ email: samples_1.testUsers[1].email });
            (0, chai_1.expect)(res.body.exists).to.equal(false);
        });
    });
});
//# sourceMappingURL=auth.spec.js.map
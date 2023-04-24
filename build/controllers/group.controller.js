"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const utils_1 = require("_app/utils");
const dtos_1 = require("_app/dtos");
class GroupController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/groups", loggerFactory.getNamedLogger("group-controller"));
        this.getGroups = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { page, skip, limit, keyword, filterType, myfollowonly, orderBy } = (0, utils_1.getPaginator)(request);
                const data = await this._groupService.getGroups(currentUser._id, limit, page, skip, keyword, orderBy.toString());
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.createGroup = async (request, response, next) => {
            const currentUser = request.user;
            const groupData = request.body;
            try {
                const groupItem = await this._groupService.createGroup(currentUser, groupData);
                response.send({ data: { message: "Group create success" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateGroup = async (request, response, next) => {
            const currentUser = request.user;
            const groupData = request.body;
            const groupId = request.params.id;
            try {
                const groupItem = await this._groupService.updateGroupInfo(currentUser, groupId, groupData);
                response.send({ data: { message: "Group update success" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.removeUserFromGroup = async (request, response, next) => {
            const currentUser = request.user;
            const removingUserData = request.body;
            const groupId = request.params.id;
            try {
                const groupItem = await this._groupService.removeUserFromGroup(currentUser._id, groupId, removingUserData.user);
                response.send({ data: { message: "User removed successfully" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.acceptGroupInvite = async (request, response, next) => {
            const currentUser = request.user;
            const groupId = request.params.id;
            const groupData = request.body;
            try {
                const groupItem = await this._groupService.acceptGroupInvite(currentUser._id, groupId, groupData.isAccept);
                if (groupData.isAccept)
                    response.send({ data: { message: "Accepted Group Invite successfully" } });
                else
                    response.send({ data: { message: "Rejected Group Invite successfully" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteGroup = async (request, response, next) => {
            const currentUser = request.user;
            const groupId = request.params.id;
            try {
                await this._groupService.removeGroup(currentUser._id, groupId);
                response.send({ data: { message: "Group has been removed successfully" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.getGroup = async (request, response, next) => {
            const currentUser = request.user;
            const groupId = request.params.id;
            try {
                const { group, owner, meIncluded, groupUsers } = await this._groupService.getGroup(currentUser._id, groupId);
                response.send({ data: { group, owner, meIncluded, groupUsers } });
            }
            catch (error) {
                next(error);
            }
        };
        this.joinGroup = async (request, response, next) => {
            const currentUser = request.user;
            const groupId = request.params.id;
            try {
                const groupItem = await this._groupService.joinGroup(currentUser._id, groupId);
                response.send({ data: { message: "Joined in group successfully" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.requestJoinGroup = async (request, response, next) => {
            const currentUser = request.user;
            const groupId = request.params.id;
            try {
                const groupItem = await this._groupService.requestJoinGroup(currentUser._id, groupId);
                response.send({ data: { message: "Group join request has been sent scuccessfully" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.acceptJoinRequest = async (request, response, next) => {
            const currentUser = request.user;
            const groupId = request.params.id;
            const { user, notiId, isAccept } = request.body;
            try {
                const groupItem = await this._groupService.acceptJoinRequestGroup(currentUser._id, groupId, user, isAccept, notiId);
                response.send({ data: { message: "Group join request has been accepted" } });
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.CreateGroupDto), this.createGroup);
        this.router.get(`${this.path}/:id`, (0, middlewares_1.authMiddleware)(), this.getGroup);
        this.router.get(`${this.path}/`, (0, middlewares_1.authMiddleware)(), this.getGroups);
        this.router.put(`${this.path}/:id`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.UpdateGroupDto), this.updateGroup);
        this.router.get(`${this.path}/:id/join`, (0, middlewares_1.authMiddleware)(), this.joinGroup);
        this.router.get(`${this.path}/:id/requestjoin`, (0, middlewares_1.authMiddleware)(), this.requestJoinGroup);
        this.router.post(`${this.path}/:id/acceptjoinrequest`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.AcceptGroupJoinDto), this.acceptJoinRequest);
        this.router.delete(`${this.path}/:id`, (0, middlewares_1.authMiddleware)(), this.deleteGroup);
        this.router.delete(`${this.path}/:id/user`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.RemoveuserDto), this.removeUserFromGroup);
        this.router.post(`${this.path}/:id/accept`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.AcceptGroupInviteDto), this.acceptGroupInvite);
    }
}
exports.default = GroupController;
//# sourceMappingURL=group.controller.js.map
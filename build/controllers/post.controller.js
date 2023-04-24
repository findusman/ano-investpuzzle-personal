"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("_app/interfaces");
const middlewares_1 = require("_app/middlewares");
const dtos_1 = require("_app/dtos");
const utils_1 = require("_app/utils");
class PostController extends interfaces_1.Controller {
    constructor(loggerFactory) {
        super("/posts", loggerFactory.getNamedLogger("post-controller"));
        this.createPost = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const postData = request.body;
                await this._postService.createPost(currentUser, postData);
                response.status(200).send({ message: "successfully saved" });
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePost = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const postId = request.params.id;
                const postData = request.body;
                await this._postService.updatePost(currentUser, postId, postData);
                response.status(200).send({ message: "successfully updated" });
            }
            catch (error) {
                next(error);
            }
        };
        this.deletePost = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const postId = request.params.id;
                await this._postService.removePost(currentUser, postId);
                response.status(200).send({ message: "successfully updated" });
            }
            catch (error) {
                next(error);
            }
        };
        this.postLike = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const postId = request.params.id;
                const { isLike } = request.body;
                await this._postService.setPostLike(currentUser, postId, isLike);
                response.status(200).send({ message: "successfully updated" });
            }
            catch (error) {
                next(error);
            }
        };
        this.createComment = async (request, response, next) => {
            try {
                const postId = request.params.id;
                const currentUser = request.user;
                const { content } = request.body;
                await this._postService.createComment(currentUser, postId, content);
                response.status(200).send({ message: "successfully saved" });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateComment = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const commentId = request.params.id;
                const { content } = request.body;
                await this._postService.updateComment(currentUser, commentId, content);
                response.status(200).send({ message: "successfully updated" });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteComment = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const commentId = request.params.id;
                await this._postService.removeComment(currentUser, commentId);
                response.status(200).send({ message: "successfully updated" });
            }
            catch (error) {
                next(error);
            }
        };
        this.postCommentLike = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const commentId = request.params.id;
                const { isLike } = request.body;
                await this._postService.setPostCommentLike(currentUser, commentId, isLike);
                response.status(200).send({ message: "successfully updated" });
            }
            catch (error) {
                next(error);
            }
        };
        this.replyOnComment = async (request, response, next) => {
            try {
                const commentId = request.params.id;
                const currentUser = request.user;
                const { content } = request.body;
                await this._postService.replyOnComment(currentUser, commentId, content);
                response.status(200).send({ message: "successfully saved" });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteReply = async (request, response, next) => {
            try {
                const commentId = request.params.id;
                const currentUser = request.user;
                await this._postService.removeOwnerReply(currentUser, commentId);
                response.status(200).send({ message: "successfully deleted" });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPosts = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const userId = request.params.id;
                const { page, skip, limit } = (0, utils_1.getPaginator)(request);
                const data = await this._postService.getPosts(currentUser, userId, limit, page, skip);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPostDetail = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const postId = request.params.id;
                const { page, skip, limit } = (0, utils_1.getPaginator)(request);
                const data = await this._postService.getPostDetail(currentUser, postId);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.filterPosts = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { page, skip, limit, keyword } = (0, utils_1.getPaginator)(request);
                const data = await this._postService.filterPosts(currentUser, keyword, limit, page, skip);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMyFeed = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const { page, skip, limit, keyword } = (0, utils_1.getPaginator)(request);
                const data = await this._postService.getMyFeed(currentUser, limit, page, skip, keyword);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPostComments = async (request, response, next) => {
            try {
                const currentUser = request.user;
                const postId = request.params.id;
                const { page, skip, limit } = (0, utils_1.getPaginator)(request);
                const data = await this._postService.getPostComments(currentUser, postId, limit, page, skip);
                response.send(data);
            }
            catch (error) {
                next(error);
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.CreatePostDto), this.createPost);
        this.router.put(`${this.path}/:id`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.CreatePostDto), this.updatePost);
        this.router.delete(`${this.path}/:id`, (0, middlewares_1.authMiddleware)(), this.deletePost);
        this.router.post(`${this.path}/:id/like`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.PostOrCommentLikeDto), this.postLike);
        this.router.post(`${this.path}/:id/comment`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.PostCommentDto), this.createComment);
        this.router.put(`${this.path}/comment/:id`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.PostCommentDto), this.updateComment);
        this.router.delete(`${this.path}/comment/:id`, (0, middlewares_1.authMiddleware)(), this.deleteComment);
        this.router.post(`${this.path}/comment/:id/like`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.PostOrCommentLikeDto), this.postCommentLike);
        this.router.post(`${this.path}/comment/:id/reply`, (0, middlewares_1.authMiddleware)(), (0, middlewares_1.validationMiddleware)(dtos_1.OwnerReplyDto), this.replyOnComment);
        this.router.delete(`${this.path}/comment/:id/reply`, (0, middlewares_1.authMiddleware)(), this.deleteReply);
        this.router.get(`${this.path}/:id`, (0, middlewares_1.authMiddleware)(), this.getPosts);
        this.router.get(`${this.path}/:id/myfeeds`, (0, middlewares_1.authMiddleware)(), this.getMyFeed);
        this.router.get(`${this.path}/:id/comments`, (0, middlewares_1.authMiddleware)(), this.getPostComments);
        this.router.get(`${this.path}/`, (0, middlewares_1.authMiddleware)(), this.filterPosts);
        this.router.get(`${this.path}/:id/postdetail`, (0, middlewares_1.authMiddleware)(), this.getPostDetail);
    }
}
exports.default = PostController;
//# sourceMappingURL=post.controller.js.map
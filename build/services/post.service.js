"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const moment = require("moment");
const models_1 = require("_app/models");
const services_1 = require("_app/services");
const mongoose_1 = require("mongoose");
const exceptions_1 = require("_app/exceptions");
class PostService {
    constructor() {
        this.user = models_1.userModel;
        this.post = models_1.postModel;
        this.postComment = models_1.postCommentModel;
        this.postLike = models_1.postLikeModel;
        this.postCommentLike = models_1.postCommentLikeModel;
        this.postOwnerReply = models_1.postOwnerReplyModel;
        this.notificationService = new services_1.NotificationService();
        this.userService = new services_1.UserService();
    }
    static getInstance() {
        if (!PostService._sharedInstance) {
            PostService._sharedInstance = new PostService();
        }
        return PostService._sharedInstance;
    }
    async getPostById(id) {
        const query = this.post.findById(id);
        return await query;
    }
    async getPostByUserId(owner) {
        return await this.post.findOne({ owner });
    }
    async getCommentById(id) {
        const query = this.postComment.findById(id);
        return await query;
    }
    async getUserLikeExisting(post, user) {
        return await this.postLike.findOne({ post, user });
    }
    async getUserCommentLikeExist(comment, user) {
        return await this.postCommentLike.findOne({ comment, user });
    }
    async getOwnerReplyExistOnComment(comment) {
        return await this.postOwnerReply.findOne({ comment });
    }
    async createPost(ownerObj, postData) {
        const userId = ownerObj._id;
        const postItem = await this.post.create({
            owner: new mongoose_1.default.Types.ObjectId(userId),
            content: postData.content,
            photourl: postData.photoUrl ? postData.photoUrl : "",
            createdAt: moment().unix() * 1000,
        });
        return postItem;
    }
    async updatePost(ownerObj, postId, postData) {
        var _a, _b;
        const userId = ownerObj._id;
        var currentPost = await this.getPostById(postId);
        if (currentPost.owner.toString() != userId) {
            throw new exceptions_1.HttpException(400, "You are not owner of this post");
        }
        else {
            await this.post.findByIdAndUpdate(postId, { content: (_a = postData.content) !== null && _a !== void 0 ? _a : "", photourl: (_b = postData.photoUrl) !== null && _b !== void 0 ? _b : "" });
        }
        return "success";
    }
    async removePost(ownerObj, postId) {
        const userId = ownerObj._id;
        var currentPost = await this.getPostById(postId);
        if (currentPost) {
            if (currentPost.owner.toString() != userId.toString()) {
                throw new exceptions_1.HttpException(400, "You are not owner of this post");
            }
            else {
                await this.postComment.deleteMany({ post: new mongoose_1.default.Types.ObjectId(postId) });
                await this.postLike.deleteMany({ post: new mongoose_1.default.Types.ObjectId(postId) });
                await this.postCommentLike.deleteMany({ post: new mongoose_1.default.Types.ObjectId(postId) });
                await this.postOwnerReply.deleteMany({ post: new mongoose_1.default.Types.ObjectId(postId) });
                await this.post.findOneAndDelete({ _id: new mongoose_1.default.Types.ObjectId(postId) });
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "This post doesn't exist");
        }
    }
    async setPostLike(ownerObj, postId, isLike) {
        const userId = ownerObj._id;
        var currentPost = await this.getPostById(postId);
        if (currentPost) {
            var userLikeExist = await this.getUserLikeExisting(postId, userId);
            if (userLikeExist) {
                if (userLikeExist.isLike == isLike) {
                    await this.postLike.findByIdAndDelete(userLikeExist._id.toString());
                }
                else {
                    await this.postLike.findByIdAndUpdate(userLikeExist._id.toString(), { isLike: isLike });
                }
            }
            else {
                const likeItem = await this.postLike.create({
                    post: new mongoose_1.default.Types.ObjectId(postId),
                    user: new mongoose_1.default.Types.ObjectId(userId),
                    isLike: isLike,
                    createdAt: moment().unix() * 1000,
                });
                return "success";
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "This post doesn't exist");
        }
    }
    async createComment(userObj, postId, content) {
        const postData = await this.getPostById(postId);
        if (postData) {
            const userId = userObj._id;
            const commentItem = await this.postComment.create({
                post: new mongoose_1.default.Types.ObjectId(postId),
                user: new mongoose_1.default.Types.ObjectId(userId),
                content: content,
                createdAt: moment().unix() * 1000,
            });
            await this.notificationService.createNotification(userId.toString(), postData.owner.toString(), 5, postId, "", 0);
            return commentItem;
        }
        else {
            throw new exceptions_1.HttpException(400, "This post doesn't exist");
        }
    }
    async updateComment(userObj, commentId, content) {
        const userId = userObj._id;
        var currentComment = await this.getCommentById(commentId);
        if (currentComment.user.toString() != userId) {
            throw new exceptions_1.HttpException(400, "You are not owner of this comment");
        }
        else {
            await this.postComment.findByIdAndUpdate(commentId, { content: content });
        }
        return "success";
    }
    async removeComment(ownerObj, commentId) {
        const userId = ownerObj._id;
        var currentComment = await this.getCommentById(commentId);
        if (currentComment) {
            if (currentComment.user.toString() != userId.toString()) {
                throw new exceptions_1.HttpException(400, "You are not owner of this comment");
            }
            else {
                await this.postCommentLike.deleteMany({ comment: new mongoose_1.default.Types.ObjectId(commentId) });
                await this.postOwnerReply.deleteMany({ comment: new mongoose_1.default.Types.ObjectId(commentId) });
                await this.postComment.findOneAndDelete({ _id: new mongoose_1.default.Types.ObjectId(commentId) });
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "This comment doesn't exist");
        }
    }
    async setPostCommentLike(ownerObj, commentId, isLike) {
        const userId = ownerObj._id;
        var currentComment = await this.getCommentById(commentId);
        if (currentComment) {
            var userCommentLikeExist = await this.getUserCommentLikeExist(commentId, userId);
            if (userCommentLikeExist) {
                if (userCommentLikeExist.isLike == isLike) {
                    await this.postCommentLike.findByIdAndDelete(userCommentLikeExist._id.toString());
                }
                else {
                    await this.postCommentLike.findByIdAndUpdate(userCommentLikeExist._id.toString(), { isLike: isLike });
                }
            }
            else {
                const likeItem = await this.postCommentLike.create({
                    post: new mongoose_1.default.Types.ObjectId(currentComment.post.toString()),
                    comment: new mongoose_1.default.Types.ObjectId(commentId),
                    user: new mongoose_1.default.Types.ObjectId(userId),
                    isLike: isLike,
                    createdAt: moment().unix() * 1000,
                });
                return "success";
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "This comment doesn't exist");
        }
    }
    async replyOnComment(ownerObj, commentId, content) {
        const userId = ownerObj._id;
        var currentComment = await this.getCommentById(commentId);
        if (currentComment) {
            var postExist = await this.getPostById(currentComment.post);
            if (postExist) {
                if (postExist.owner.toString == userId.toString) {
                    var commentReplyExist = await this.getOwnerReplyExistOnComment(commentId);
                    if (commentReplyExist) {
                        await this.postOwnerReply.findByIdAndUpdate(commentReplyExist._id.toString(), { content: content });
                        return "success";
                    }
                    else {
                        const replyItem = await this.postOwnerReply.create({
                            post: new mongoose_1.default.Types.ObjectId(currentComment.post.toString()),
                            comment: new mongoose_1.default.Types.ObjectId(commentId),
                            content: content,
                            createdAt: moment().unix() * 1000,
                        });
                        await this.notificationService.createNotification(userId.toString(), currentComment.user.toString(), 9, currentComment._id.toString(), "", 0);
                        return "success";
                    }
                }
                else {
                    throw new exceptions_1.HttpException(400, "You are not owner of this post");
                }
            }
            else {
                throw new exceptions_1.HttpException(400, "This post doesn't exist");
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "This comment doesn't exist");
        }
    }
    async removeOwnerReply(ownerObj, commentId) {
        const userId = ownerObj._id;
        var currentComment = await this.getCommentById(commentId);
        if (currentComment) {
            var postExist = await this.getPostById(currentComment.post);
            if (postExist) {
                if (postExist.owner.toString == userId.toString) {
                    var commentReplyExist = await this.getOwnerReplyExistOnComment(commentId);
                    if (commentReplyExist) {
                        await this.postOwnerReply.findByIdAndDelete(commentReplyExist._id.toString());
                        return "success";
                    }
                    else {
                        throw new exceptions_1.HttpException(400, "This reply already removed");
                    }
                }
                else {
                    throw new exceptions_1.HttpException(400, "You are not owner of this post");
                }
            }
            else {
                throw new exceptions_1.HttpException(400, "This post doesn't exist");
            }
        }
        else {
            throw new exceptions_1.HttpException(400, "This comment doesn't exist");
        }
    }
    async getPosts(currentUser, userId, limit, page, skip) {
        const postQuery = this.post
            .find({ owner: new mongoose_1.default.Types.ObjectId(userId) })
            .populate({
            path: "owner",
            select: { userFullName: 1, photoUrl: 1 },
            strictPopulate: false,
        })
            .populate("comments")
            .populate("likes")
            .populate("dislikes")
            .populate({
            path: "isLiked",
            match: () => ({ user: currentUser._id, isLike: true }),
        })
            .populate({
            path: "isDisliked",
            match: () => ({ user: currentUser._id, isLike: false }),
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await this.post.find().merge(postQuery).skip(0).limit(null).countDocuments();
        const posts = await postQuery;
        return {
            data: posts || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
    async getPostDetail(currentUser, postId) {
        const postQuery = this.post
            .findOne({ _id: new mongoose_1.default.Types.ObjectId(postId) })
            .populate({
            path: "owner",
            select: { userFullName: 1, photoUrl: 1, username: 1 },
            strictPopulate: false,
        })
            .populate("comments")
            .populate("likes")
            .populate("dislikes")
            .populate({
            path: "isLiked",
            match: () => ({ user: currentUser._id, isLike: true }),
        })
            .populate({
            path: "isDisliked",
            match: () => ({ user: currentUser._id, isLike: false }),
        });
        const post = await postQuery;
        return {
            data: post,
        };
    }
    async filterPosts(currentUser, query, limit, page, skip) {
        const postQuery = this.post
            .find({ content: new RegExp(query, "i") })
            .populate({
            path: "owner",
            select: { userFullName: 1, photoUrl: 1 },
            strictPopulate: false,
        })
            .populate("comments")
            .populate("likes")
            .populate("dislikes")
            .populate({
            path: "isLiked",
            match: () => ({ user: currentUser._id, isLike: true }),
        })
            .populate({
            path: "isDisliked",
            match: () => ({ user: currentUser._id, isLike: false }),
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await this.post.find().merge(postQuery).skip(0).limit(null).countDocuments();
        const posts = await postQuery;
        return {
            data: posts || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
    async getMyFeed(currentUser, limit, page, skip, keyword) {
        const myFollowings = await this.userService.getFollowingIds(currentUser._id);
        let followingsQuery = [];
        myFollowings.map((followingId) => {
            followingsQuery.push({ owner: new mongoose_1.default.Types.ObjectId(followingId) });
        });
        let matchesWith = [];
        if (keyword != null && keyword.length > 0) {
            matchesWith.push({ content: new RegExp(keyword, "i") });
        }
        const filter = {};
        followingsQuery.length > 0 ? filter.$or = followingsQuery : null;
        matchesWith.length > 0 ? (filter.$and = matchesWith) : null;
        const postQuery = this.post
            .find(filter)
            .populate({
            path: "owner",
            select: { userFullName: 1, photoUrl: 1, username: 1 },
            strictPopulate: false,
        })
            .populate("comments")
            .populate("likes")
            .populate("dislikes")
            .populate({
            path: "isLiked",
            match: () => ({ user: currentUser._id, isLike: true }),
        })
            .populate({
            path: "isDisliked",
            match: () => ({ user: currentUser._id, isLike: false }),
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = followingsQuery.length == 0 ? 0 : await this.post.find().merge(postQuery).skip(0).limit(null).countDocuments();
        const posts = followingsQuery.length == 0 ? [] : await postQuery;
        return {
            data: posts || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
    async getPostComments(currentUser, postId, limit, page, skip) {
        const commentQuery = this.postComment
            .find({ post: new mongoose_1.default.Types.ObjectId(postId) })
            .populate("user")
            .populate("replies")
            .populate("likes")
            .populate("dislikes")
            .populate({
            path: "isLiked",
            match: () => ({ user: currentUser._id, isLike: true }),
        })
            .populate({
            path: "isDisliked",
            match: () => ({ user: currentUser._id, isLike: false }),
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await this.postComment.find().merge(commentQuery).skip(0).limit(null).countDocuments();
        const posts = await commentQuery;
        return {
            data: posts || [],
            page: Number(page),
            limit: Number(limit),
            total,
        };
    }
}
exports.PostService = PostService;
PostService._sharedInstance = null;
//# sourceMappingURL=post.service.js.map
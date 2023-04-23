import * as Papa from "papaparse";
import moment = require("moment");

import {
  userModel,
  postModel,
  postCommentModel,
  postLikeModel,
  postCommentLikeModel,
  postOwnerReplyModel,
} from "_app/models";
import { NotificationService, UserService } from "_app/services";
import { User } from "_app/interfaces";

import { CreatePostDto } from "_app/dtos";
import { Env } from "_app/config";
import * as handlebars from "handlebars";
import mongoose from "mongoose";
import {
  HttpException,
} from "_app/exceptions";

export class PostService {
  public user = userModel;
  public post = postModel;
  public postComment = postCommentModel;
  public postLike = postLikeModel;
  public postCommentLike = postCommentLikeModel;
  public postOwnerReply = postOwnerReplyModel;

  public notificationService = new NotificationService();
  public userService = new UserService();

  static _sharedInstance: PostService = null;

  static getInstance() {
    if (!PostService._sharedInstance) {
      PostService._sharedInstance = new PostService();
    }
    return PostService._sharedInstance;
  }

  public async getPostById(id: string) {
    const query = this.post.findById(id);
    return await query;
  }

  public async getPostByUserId(owner: string) {
    return await this.post.findOne({ owner });
  }

  public async getCommentById(id: string) {
    const query = this.postComment.findById(id);
    return await query;
  }

  public async getUserLikeExisting(post: string, user: string) {
    return await this.postLike.findOne({ post, user });
  }

  public async getUserCommentLikeExist(comment: string, user: string) {
    return await this.postCommentLike.findOne({ comment, user });
  }

  public async getOwnerReplyExistOnComment(comment: string) {
    return await this.postOwnerReply.findOne({ comment });
  }

  public async createPost(ownerObj: User, postData: CreatePostDto) {
    const userId = ownerObj._id;
    const postItem = await this.post.create({
      owner: new mongoose.Types.ObjectId(userId),
      content: postData.content,
      photourl: postData.photoUrl ? postData.photoUrl : "",
      createdAt: moment().unix() * 1000,
    });
    return postItem;
  }

  public async updatePost(ownerObj: User, postId: string, postData: CreatePostDto) {
    const userId = ownerObj._id;
    var currentPost = await this.getPostById(postId);
    if (currentPost.owner.toString() != userId) {
      throw new HttpException(400, "You are not owner of this post");
    } else {
      await this.post.findByIdAndUpdate(postId, { content: postData.content ?? "", photourl: postData.photoUrl ?? "" });
    }
    return "success";
  }

  public async removePost(ownerObj: User, postId: string) {
    const userId = ownerObj._id;
    var currentPost = await this.getPostById(postId);
    if (currentPost) {
      if (currentPost.owner.toString() != userId.toString()) {
        throw new HttpException(400, "You are not owner of this post");
      } else {
        await this.postComment.deleteMany({ post: new mongoose.Types.ObjectId(postId) });
        await this.postLike.deleteMany({ post: new mongoose.Types.ObjectId(postId) });
        await this.postCommentLike.deleteMany({ post: new mongoose.Types.ObjectId(postId) });
        await this.postOwnerReply.deleteMany({ post: new mongoose.Types.ObjectId(postId) });
        await this.post.findOneAndDelete({ _id: new mongoose.Types.ObjectId(postId) });
      }
    } else {
      throw new HttpException(400, "This post doesn't exist");
    }
  }

  public async setPostLike(ownerObj: User, postId: string, isLike: boolean) {
    const userId = ownerObj._id;
    var currentPost = await this.getPostById(postId);
    if (currentPost) {
      var userLikeExist = await this.getUserLikeExisting(postId, userId);
      if (userLikeExist) {
        if (userLikeExist.isLike == isLike) {
          await this.postLike.findByIdAndDelete(userLikeExist._id.toString());
        } else {
          await this.postLike.findByIdAndUpdate(userLikeExist._id.toString(), { isLike: isLike });
        }
      } else {
        const likeItem = await this.postLike.create({
          post: new mongoose.Types.ObjectId(postId),
          user: new mongoose.Types.ObjectId(userId),
          isLike: isLike,
          createdAt: moment().unix() * 1000,
        });
        return "success";
      }
    } else {
      throw new HttpException(400, "This post doesn't exist");
    }
  }

  public async createComment(userObj: User, postId: string, content: string) {
    const postData = await this.getPostById(postId);
    if (postData) {
      const userId = userObj._id;
      const commentItem = await this.postComment.create({
        post: new mongoose.Types.ObjectId(postId),
        user: new mongoose.Types.ObjectId(userId),
        content: content,
        createdAt: moment().unix() * 1000,
      });

      await this.notificationService.createNotification(userId.toString(), postData.owner.toString(), 5, postId, "", 0);
      return commentItem;
    } else {
      throw new HttpException(400, "This post doesn't exist");
    }
  }

  public async updateComment(userObj: User, commentId: string, content: String) {
    const userId = userObj._id;
    var currentComment = await this.getCommentById(commentId);
    if (currentComment.user.toString() != userId) {
      throw new HttpException(400, "You are not owner of this comment");
    } else {
      await this.postComment.findByIdAndUpdate(commentId, { content: content });
    }
    return "success";
  }

  public async removeComment(ownerObj: User, commentId: string) {
    const userId = ownerObj._id;
    var currentComment = await this.getCommentById(commentId);
    if (currentComment) {
      if (currentComment.user.toString() != userId.toString()) {
        throw new HttpException(400, "You are not owner of this comment");
      } else {
        await this.postCommentLike.deleteMany({ comment: new mongoose.Types.ObjectId(commentId) });
        await this.postOwnerReply.deleteMany({ comment: new mongoose.Types.ObjectId(commentId) });
        await this.postComment.findOneAndDelete({ _id: new mongoose.Types.ObjectId(commentId) });
      }
    } else {
      throw new HttpException(400, "This comment doesn't exist");
    }
  }

  public async setPostCommentLike(ownerObj: User, commentId: string, isLike: boolean) {
    const userId = ownerObj._id;
    var currentComment = await this.getCommentById(commentId);
    if (currentComment) {
      var userCommentLikeExist = await this.getUserCommentLikeExist(commentId, userId);
      if (userCommentLikeExist) {
        if (userCommentLikeExist.isLike == isLike) {
          await this.postCommentLike.findByIdAndDelete(userCommentLikeExist._id.toString());
        } else {
          await this.postCommentLike.findByIdAndUpdate(userCommentLikeExist._id.toString(), { isLike: isLike });
        }
      } else {
        const likeItem = await this.postCommentLike.create({
          post: new mongoose.Types.ObjectId(currentComment.post.toString()),
          comment: new mongoose.Types.ObjectId(commentId),
          user: new mongoose.Types.ObjectId(userId),
          isLike: isLike,
          createdAt: moment().unix() * 1000,
        });
        return "success";
      }
    } else {
      throw new HttpException(400, "This comment doesn't exist");
    }
  }

  public async replyOnComment(ownerObj: User, commentId: string, content: string) {
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
          } else {
            const replyItem = await this.postOwnerReply.create({
              post: new mongoose.Types.ObjectId(currentComment.post.toString()),
              comment: new mongoose.Types.ObjectId(commentId),
              content: content,
              createdAt: moment().unix() * 1000,
            });
            await this.notificationService.createNotification(userId.toString(), currentComment.user.toString(), 9, currentComment._id.toString(), "", 0);
            return "success";
          }
        } else {
          throw new HttpException(400, "You are not owner of this post");
        }
      } else {
        throw new HttpException(400, "This post doesn't exist");
      }
    } else {
      throw new HttpException(400, "This comment doesn't exist");
    }
  }

  public async removeOwnerReply(ownerObj: User, commentId: string) {
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
          } else {
            throw new HttpException(400, "This reply already removed");
          }
        } else {
          throw new HttpException(400, "You are not owner of this post");
        }
      } else {
        throw new HttpException(400, "This post doesn't exist");
      }
    } else {
      throw new HttpException(400, "This comment doesn't exist");
    }
  }

  public async getPosts(currentUser: User, userId: string, limit: number, page: number, skip: number) {
    const postQuery = this.post
      .find({ owner: new mongoose.Types.ObjectId(userId) })
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

  public async getPostDetail(currentUser: User, postId: string) {
    const postQuery = this.post
      .findOne({ _id: new mongoose.Types.ObjectId(postId) })
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

    const post = await postQuery;
    return {
      data: post,
    };
  }

  public async filterPosts(currentUser: User, query: string, limit: number, page: number, skip: number) {
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

  public async getMyFeed(currentUser: User, limit: number, page: number, skip: number, keyword: string) {
    const myFollowings = await this.userService.getFollowingIds(currentUser._id);

    let followingsQuery: any = [];
    myFollowings.map((followingId: string) => {
      followingsQuery.push({ owner: new mongoose.Types.ObjectId(followingId) })
    });

    let matchesWith: any = [];
    if (keyword != null && keyword.length > 0) {
      matchesWith.push({ content: new RegExp(keyword, "i") });
    }

    const filter: any = {};
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

  public async getPostComments(currentUser: User, postId: string, limit: number, page: number, skip: number) {
    const commentQuery = this.postComment
      .find({ post: new mongoose.Types.ObjectId(postId) })
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

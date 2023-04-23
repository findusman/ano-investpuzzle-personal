import { Request, Response, NextFunction } from "express";
import { NotFoundException } from "_app/exceptions";
import { Controller, RequestWithUser, User } from "_app/interfaces";
import { authMiddleware, queryIdValidator, queryMiddleware, validationMiddleware } from "_app/middlewares";
import { CreatePostDto, OwnerReplyDto, PostCommentDto, PostOrCommentLikeDto } from "_app/dtos";
import { LoggerFactory } from "_app/factories";
import { isObjectIdOrHexString } from "mongoose";
import { getPaginator } from "_app/utils";
import { postOwnerReplyModel } from "_app/models";

class PostController extends Controller {
  constructor(loggerFactory: LoggerFactory) {
    super("/posts", loggerFactory.getNamedLogger("post-controller"));
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/`, authMiddleware(), validationMiddleware(CreatePostDto), this.createPost);
    this.router.put(`${this.path}/:id`, authMiddleware(), validationMiddleware(CreatePostDto), this.updatePost);
    this.router.delete(`${this.path}/:id`, authMiddleware(), this.deletePost);
    this.router.post(
      `${this.path}/:id/like`,
      authMiddleware(),
      validationMiddleware(PostOrCommentLikeDto),
      this.postLike
    );

    this.router.post(
      `${this.path}/:id/comment`,
      authMiddleware(),
      validationMiddleware(PostCommentDto),
      this.createComment
    );
    this.router.put(
      `${this.path}/comment/:id`,
      authMiddleware(),
      validationMiddleware(PostCommentDto),
      this.updateComment
    );
    this.router.delete(`${this.path}/comment/:id`, authMiddleware(), this.deleteComment);
    this.router.post(
      `${this.path}/comment/:id/like`,
      authMiddleware(),
      validationMiddleware(PostOrCommentLikeDto),
      this.postCommentLike
    );

    this.router.post(
      `${this.path}/comment/:id/reply`,
      authMiddleware(),
      validationMiddleware(OwnerReplyDto),
      this.replyOnComment
    );
    this.router.delete(`${this.path}/comment/:id/reply`, authMiddleware(), this.deleteReply);

    this.router.get(`${this.path}/:id`, authMiddleware(), this.getPosts);
    this.router.get(`${this.path}/:id/myfeeds`, authMiddleware(), this.getMyFeed);
    this.router.get(`${this.path}/:id/comments`, authMiddleware(), this.getPostComments);
    this.router.get(`${this.path}/`, authMiddleware(), this.filterPosts);
    this.router.get(`${this.path}/:id/postdetail`, authMiddleware(), this.getPostDetail);
  }

  private createPost = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const postData = request.body as CreatePostDto;
      await this._postService.createPost(currentUser, postData);
      response.status(200).send({ message: "successfully saved" });
    } catch (error) {
      next(error);
    }
  };

  private updatePost = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const postId = request.params.id;
      const postData = request.body as CreatePostDto;
      await this._postService.updatePost(currentUser, postId, postData);
      response.status(200).send({ message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  };

  private deletePost = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const postId = request.params.id;
      await this._postService.removePost(currentUser, postId);
      response.status(200).send({ message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  };

  private postLike = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const postId = request.params.id;
      const { isLike } = request.body as PostOrCommentLikeDto;
      await this._postService.setPostLike(currentUser, postId, isLike);
      response.status(200).send({ message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  };

  private createComment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const postId = request.params.id;
      const currentUser = request.user as User;
      const { content } = request.body as CreatePostDto;
      await this._postService.createComment(currentUser, postId, content);
      response.status(200).send({ message: "successfully saved" });
    } catch (error) {
      next(error);
    }
  };

  private updateComment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const commentId = request.params.id;
      const { content } = request.body as PostCommentDto;
      await this._postService.updateComment(currentUser, commentId, content);
      response.status(200).send({ message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  };

  private deleteComment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const commentId = request.params.id;
      await this._postService.removeComment(currentUser, commentId);
      response.status(200).send({ message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  };

  private postCommentLike = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const commentId = request.params.id;
      const { isLike } = request.body as PostOrCommentLikeDto;
      await this._postService.setPostCommentLike(currentUser, commentId, isLike);
      response.status(200).send({ message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  };

  private replyOnComment = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const commentId = request.params.id;
      const currentUser = request.user as User;
      const { content } = request.body as OwnerReplyDto;
      await this._postService.replyOnComment(currentUser, commentId, content);
      response.status(200).send({ message: "successfully saved" });
    } catch (error) {
      next(error);
    }
  };

  private deleteReply = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const commentId = request.params.id;
      const currentUser = request.user as User;
      await this._postService.removeOwnerReply(currentUser, commentId);
      response.status(200).send({ message: "successfully deleted" });
    } catch (error) {
      next(error);
    }
  };

  private getPosts = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const userId = request.params.id;
      const { page, skip, limit } = getPaginator(request);
      const data = await this._postService.getPosts(currentUser, userId, limit, page, skip);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private getPostDetail = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const postId = request.params.id;
      const { page, skip, limit } = getPaginator(request);
      const data = await this._postService.getPostDetail(currentUser, postId);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private filterPosts = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { page, skip, limit, keyword } = getPaginator(request);
      const data = await this._postService.filterPosts(currentUser, keyword, limit, page, skip);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private getMyFeed = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const { page, skip, limit, keyword } = getPaginator(request);
      const data = await this._postService.getMyFeed(currentUser, limit, page, skip, keyword);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };

  private getPostComments = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    try {
      const currentUser = request.user as User;
      const postId = request.params.id;
      const { page, skip, limit } = getPaginator(request);
      const data = await this._postService.getPostComments(currentUser, postId, limit, page, skip);
      response.send(data);
    } catch (error) {
      next(error);
    }
  };
}

export default PostController;

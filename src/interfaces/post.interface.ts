import { Request } from "express";

export interface Post {
  _id: string;
  content: string;
  photourl: string;
  owner: string;
}

export interface PostComment{
  _id: string;
  post: string;
  user: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostLike {
  _id: string;
  post: string; 
  isLike: boolean;
  user: string;  
}

export interface CommentLike {
  _id: string;
  post: string; 
  comment: string;
  isLike: boolean;
  user: string;  
}

export interface PostOwnerReply {
  _id: string;
  post: string; 
  comment: string;
  content: string;  
}

import api from "../lib/api";
import type { CommentPayload, DeleteResponse } from "./Payload";

export async function createCommentForQuestionApi(payload: CommentPayload):Promise<Comment>{
    const res = await api.post("api/comments/question", payload);
    return res.data;
}

export async function createCommentForAnswerApi(payload: CommentPayload):Promise<Comment>{
    const res = await api.post("api/comments/answer", payload);
    return res.data;
}

export async function getCommentsForQuestionApi(qId:number):Promise<Comment[]>{
    const res = await api.get(`api/comments/questions/${qId}`);
    return res.data;
}

export async function getCommentsForAnswerApi(qId:number):Promise<Comment[]>{
    const res = await api.get(`api/comments/answers/${qId}`);
    return res.data;
}

export async function deleteCommentApi(commentId:number): Promise<DeleteResponse>{
    const res = await api.get(`api/comments/questions/${commentId}`);
    return res.data;
}
import api from "../lib/api";
import type { CreateQuestionPayload, Question } from "../redux/types";
import type { AllQuestionResponse, AnswerResponse, DeleteResponse, VotePayload } from "./Payload";

export async function createQuestionApi(questionData: CreateQuestionPayload) {
    const res = await api.post("api/questions", questionData);
    return res.data;
}

export async function getAllQuestions(page: number = 1, limit: number = 10): Promise<AllQuestionResponse> {
    const res = await api.get(`api/questions?page=${page}&limit=${limit}`);
    return res.data;
}

export async function getMyQuestions(): Promise<AllQuestionResponse>{
    const res = await api.get('api/questions/me');
    return res.data;
}

export async function getQuestionById(id:number): Promise<Question> {
    const res = await api.get(`api/questions/${id}`);
    return res.data;
}

export async function getAnswerByQId(QId:number): Promise<AnswerResponse> {
    const res = await api.get(`api/questions/${QId}/answers`);
    return res.data;
}

export const postAnswer = async (questionId:number, body: string) => {
  return await api.post(`/api/questions/${questionId}/answers`, { body });
};

export async function deleteQuestionApi(questionId:number): Promise<DeleteResponse>{
    const res = await api.delete(`api/questions/${questionId}`);

    return res.data;
}

export async function voteQuestion(votePayload: VotePayload): Promise<boolean>{
    const res = await api.post("api/question/vote", votePayload);
    return res.data;
}

export async function voteAnswer(votePayload: VotePayload): Promise<boolean>{
    const res = await api.post("api/answer/vote", votePayload);
    return res.data;
}

export async function isUserVotedToQuestion(questionId: number):Promise<number>{
    const res = await api.get(`api/question/getUserVote/${questionId}`);
    return res.data;
}

export async function isUserVotedToAnswer(answerId: number):Promise<number>{
    const res = await api.get(`api/answer/getUserVote/${answerId}`);
    return res.data;
}
import api from "../lib/api";
import type { CreateQuestionPayload, Question } from "../redux/types";
import type { AllQuestionResponse, AnswerResponse } from "./Payload";

export async function createQuestionApi(questionData: CreateQuestionPayload) {
    const res = await api.post("api/questions", questionData);
    return res.data;
}

export async function getAllQuestions(page: number = 1, limit: number = 10): Promise<AllQuestionResponse> {
    const res = await api.get(`api/questions?page=${page}&limit=${limit}`);
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
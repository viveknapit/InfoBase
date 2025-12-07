import api from "../lib/api";
import type { CreateQuestionPayload } from "../redux/types";

export async function createQuestionApi(questionData: CreateQuestionPayload) {
    const res = await api.post("api/questions", questionData);
    return res.data;
}
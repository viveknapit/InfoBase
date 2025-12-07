import type { Tag, User } from "../redux/types"

export interface LoginPayload{
    email: string,
    password: string
}

export interface LoginResponse{
    accessToken: string,
    userDto: User,
}

export interface TagResponse{
    tags: Tag[];
}

export interface QuestionResponse{
    id:number,
    tittle:string,
    description:string,
    tags: string[],
    askedBy: User,
    createdAt: string,
    relatedProject: string
}
export interface CreateQuestionResponse{
    status:boolean,
    message: string,
    question: QuestionResponse
}

export const TOKEN_KEY = "Infobase-Token";


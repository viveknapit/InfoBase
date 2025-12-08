import type { Answer, Pagination, Question, Tag, User } from "../redux/types"

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
    askedBy: UserShort,
    createdAt: string,
    relatedProject: string
}

export interface AllQuestionResponse{
    total:number,
    page:number,
    limit:number,
    questions:Question[]
}
export interface CreateQuestionResponse{
    status:boolean,
    message: string,
    question: QuestionResponse
}

export interface UserShort{
    id:number,
    name:string,
    email:string
}

export interface AnswerData{
    questionId:number,
    answers: Answer[],
    pagination: {
        currentPage:number,
        totalPages:number,
        totalAnswers: number
    }
}

export interface AnswerResponse{
    success:boolean,
    data:AnswerData;
}


export const TOKEN_KEY = "Infobase-Token";


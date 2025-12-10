import type { Answer, Question, Tag, User } from "../redux/types"

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

export interface VotePayload{
    votingId: number,
    action: string
}

export interface DeleteResponse{
    success: boolean,
    message: string
}

export interface Comment{
    id:number,
    text:string,
    user:UserShort,
    contentType:string,
    parentId:number,
    createdAt:string,
    updatedAt:string
}

export interface CommentResponse{
    comments: Comment[]
}

export interface CommentPayload{
    text:string,
    parentId:number
}

export const TOKEN_KEY = "Infobase-Token";


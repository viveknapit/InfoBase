import axios from "axios";
import type { User } from "../redux/types";
import { TOKEN_KEY, type LoginPayload, type LoginResponse } from "./Payload";

 export async function getUser(){
        const token = window.localStorage.getItem('Token');
        if(token === '' || token === null){
            return null;
        }
        const user = JSON.parse(atob(token.split('.')[1])) as User;
        return user;
}

export async function logOut(): Promise<string> {
        window.localStorage.removeItem('Token');
        return fetch('user/logout', {method: 'POST'}).then(x => x.text());
}

export async function loginService(payload: LoginPayload): Promise<LoginResponse>{
        const res = await axios.post<LoginResponse>("/api/auth/login", payload);

        if(res.data.accessToken){
                window.localStorage.setItem(TOKEN_KEY, res.data.accessToken);
        }
        return res.data;
}

import type { User } from "../redux/types";
import { TOKEN_KEY, type LoginPayload, type LoginResponse } from "./Payload";
import api from "../lib/api";

export async function getUser(){
        const token = window.localStorage.getItem(TOKEN_KEY);
        if(token === '' || token === null){
            return null;
        }
        const res = await api.get('api/auth/me');
        return res.data;
}

export async function logOut(): Promise<string> {
        window.localStorage.removeItem(TOKEN_KEY);
        return fetch('user/logout', {method: 'POST'}).then(x => x.text());
}

export async function loginService(payload: LoginPayload): Promise<LoginResponse>{
        const res = await api.post("/api/auth/login", payload);

        if(res.data.token){
                window.localStorage.setItem(TOKEN_KEY, res.data.token);
        }
        return res.data;
}

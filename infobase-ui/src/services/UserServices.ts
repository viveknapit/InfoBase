import type { User } from "../redux/types";

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

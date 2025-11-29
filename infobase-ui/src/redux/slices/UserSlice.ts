import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserState } from "../types";
import type { User } from "../types";

const initialState: UserState = {
    user:{
        id: 101,
        name: 'Jenny',
        avatar: 'abc.aws.com',
        skills: ['C#', 'html', 'css', 'react', 'prokey'],
        initials: 'J',
        project: 'Input Management',
    },
    isLoggedIn: false

}

const UserSlice = createSlice({
    name: 'User',
    initialState,
    reducers: {
        Logout:(state) =>{
            state.isLoggedIn = false;
            state.user = null;
        },
        SetLoginDetails: (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        },
    }
});

export const { Logout, SetLoginDetails } = UserSlice.actions;
export default UserSlice.reducer;
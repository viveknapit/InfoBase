import api from "../lib/api";


export async function getAll() {
    const res = await api.get("api/tags");
    return res.data;
}
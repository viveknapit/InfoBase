import api from "../lib/api";
import type { Project } from "../redux/types";

export async function getAllProjects(): Promise<Project[]> {
    const res = await api.get("api/projects");
    return res.data;
}
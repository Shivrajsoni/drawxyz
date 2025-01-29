import {z} from "zod";
export  const createUserSchema = z.object({
    username:z.string().min(3).max(20),
    password:z.string(),
    email:z.string().email()
})
export const SigninSchema = z.object({
    email:z.string().email(),
    password:z.string()
})
export const createRoomSchema = z.object({
    slug:z.string(),
    adminId:z.string(),
})
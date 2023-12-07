export interface UserTest {
    id: number
    name: string
    email: string
    password: string
    rolle: roller
    phone: number
    adress: string
    birthdate: string
    peletong_id: number
}

export type roller = "admin" | "leder" | "medlem"
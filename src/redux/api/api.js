import axios from "axios"


// Cria a instância do Axios
export const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true, 
})


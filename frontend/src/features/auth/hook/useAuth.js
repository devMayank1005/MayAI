import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
    const dispatch = useDispatch()

    async function handleRegister(email, username, password) {
        try {    
            dispatch(setLoading(true))
            const response = await register(email, username, password)
            dispatch(setUser(response.user))
            return response.user
        } catch (error) {
            dispatch(setError(error.response?.data?.message || error.message))
            return null
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin(email, password) {
        try {
            dispatch(setLoading(true))
            const response = await login(email, password)
            dispatch(setUser(response.user))
            return response.user
        } catch (error) {
            dispatch(setError(error.response?.data?.message || error.message))
            return null
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const response = await getMe()
            dispatch(setUser(response.user))
            return response.user
        } catch (error) {
            dispatch(setError(error.response?.data?.message || error.message || "Failed to fetch user data"))
            return null
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            dispatch(setLoading(true))
            await logout()
            dispatch(setUser(null))
            dispatch(setError(null))
            return true
        } catch (error) {
            dispatch(setError(error.response?.data?.message || error.message || "Failed to logout"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
    }
}
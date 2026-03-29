import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
    const dispatch = useDispatch()

    async function handleRegister(email, username, password) {
        try {    
            dispatch(setLoading(true))
            const response = await register(username, email, password)
            dispatch(setUser(response.user))
            dispatch(setError(null))
            return response
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.message
            const message = serverMessage === "User with this email or username already exists"
                ? "User already registered with this email"
                : serverMessage
            dispatch(setError(message))
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
            dispatch(setError(null))
            return response.user
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.message
            const message = serverMessage === "Invalid email or password"
                ? "Incorrect email or password"
                : serverMessage
            dispatch(setError(message))
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

    async function initializeAuth() {
        try {
            dispatch(setLoading(true))
            const response = await getMe()
            dispatch(setUser(response.user))
            return response.user
        } catch (error) {
            // 401 = not authenticated, don't treat as error
            if (error.response?.status !== 401) {
                dispatch(setError(error.response?.data?.message || error.message))
            }
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
        initializeAuth,
        handleLogout,
    }
}
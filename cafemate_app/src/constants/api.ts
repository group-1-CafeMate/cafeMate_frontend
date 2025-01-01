const BASE_URL = "http://127.0.0.1:8000"

export const API = {
    User: {
        LogIn: `${BASE_URL}/login/`,
        LogOut: `${BASE_URL}/logout/`,
        SignUp: `${BASE_URL}/signup/`,
        GetUserInfo: `${BASE_URL}/user/`,
        SendVerificationEmail: `${BASE_URL}/user/email/`, // 寄送驗證信的 API
        ForgotPassword: `${BASE_URL}/pw/forgot/`, // 忘記密碼的 API
        ResetPassword: `${BASE_URL}/pw/reset/`, // 重設密碼的 API
    },
    Cafe: {
        GetCafe: `${BASE_URL}/cafe/`,
        GetCafes: `${BASE_URL}/cafes/`,
        GetFilteredCafe: `${BASE_URL}/cafes/filter/`,
        GetTopCafe: `${BASE_URL}/cafes/top/`
    },
};

export default API;
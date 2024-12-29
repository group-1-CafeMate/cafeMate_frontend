const BASE_URL = "http://127.0.0.1:8000"

export const API = {
    User: {
        Login: `${BASE_URL}/login/`,
        SignUp: `${BASE_URL}/signup/`,
        GetInfo: `${BASE_URL}/user/`,
        SendVerificationEmail: `${BASE_URL}/user/email/`, // 寄送驗證信的 API
    },
    Cafe: {
        GetCafe: `${BASE_URL}/cafe/`,
        GetCafes: `${BASE_URL}/cafes/`,
        GetFilteredCafe: `${BASE_URL}/cafes/filter/`,
        GetTopCafe: `${BASE_URL}/cafes/top/`
    },
};

export default API;
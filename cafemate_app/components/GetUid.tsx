import getCookie from "src/getCookies";

export const getUserUid = (): string | null => {
  try {
    const userId = getCookie("uid");
    return userId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
};
import Button from "components/Button";

const SignIn = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg-color">
      <div className="flex flex-wrap bg-white rounded-lg shadow-lg w-full max-w-4xl">
        {/* 左側區塊 */}
        <div
          className="w-full md:w-1/2 bg-cover bg-center rounded-l-lg"
          style={{
            backgroundImage: "url('/images/cafe-background.jpg')", // 本地圖片存放位置
          }}
        >
          <div className="p-8 h-full flex flex-col justify-center items-center bg-black bg-opacity-50 text-white text-center">
            <h1 className="text-3xl font-bold mb-4">
              We haven&apos;t met before right?
            </h1>
            <p className="mb-4">Then you should try us!</p>
            <p className="mb-8">
              CafeMate is your coffee buddy in Taipei and New Taipei City! Share
              your preferences, and we’ll find the perfect café nearby. Smart,
              personal, and made for coffee lovers like you!
            </p>
            <Button
              label="SIGN UP"
              onClick={() => alert("Sign Up Clicked")}
              variant="solid"
            />
          </div>
        </div>

        {/* 右側區塊 */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-8">
            Welcome back to Cafemate
          </h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-foreground">
                USERNAME
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter username"
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-accent-color py-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-foreground">
                PASSWORD
              </label>
              <input
                type="password"
                id="password"
                placeholder="********"
                className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-accent-color py-2"
              />
            </div>
            <div className="text-right">
              <a href="#" className="text-sm text-gray-500 hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="mt-4">
              <Button
                label="SIGN IN"
                onClick={() => alert("Sign In Clicked")}
                variant="solid"
                className="bg-accent-color"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

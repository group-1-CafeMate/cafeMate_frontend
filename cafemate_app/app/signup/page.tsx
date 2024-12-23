import Button from "components/Button";

const SignUp: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg-color">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Create an Account
        </h2>
        <form className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="e.g. Howard"
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-input-focus-color py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="e.g. howard.thurman@gmail.com"
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-input-focus-color py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="********"
              className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-input-focus-color py-2"
            />
          </div>
          <div className="mt-4">
            <Button
              label="Let's get started"
              onClick={() => alert("Sign Up Clicked")}
              variant="solid"
              className="bg-button-bg-color hover:bg-button-hover-bg-color"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;

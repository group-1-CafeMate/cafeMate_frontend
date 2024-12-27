interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "solid" | "outline";
  className?: string;
}

const Button = ({
  label,
  onClick,
  variant = "solid",
  className = "",
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded font-bold transition-colors duration-200 outline-none ${
        variant === "solid"
          ? "bg-[#9c6f44] text-white border-2 border-transparent hover:bg-white hover:text-[#9c6f44] hover:border-[#9c6f44] focus:border-[#9c6f44] active:border-[#9c6f44]"
          : "border-2 border-[#ddbb9b] text-[#ddbb9b] hover:bg-[#ddbb9b] hover:text-white hover:border-[#9c6f44] focus:border-[#9c6f44] active:border-[#9c6f44]"
      } ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "solid" | "outline";
  className?: string; // 新增這行
}

const Button = ({ label, onClick, variant = "solid" }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded font-bold ${
        variant === "solid"
          ? "bg-[#9c6f44 text-white hover:bg-[#c5a782]"
          : "border border-[#ddbb9b] text-[#ddbb9b] hover:bg-[#ddbb9b] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
};

export default Button;

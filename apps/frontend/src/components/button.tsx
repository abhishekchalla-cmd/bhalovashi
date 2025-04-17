import { alteDIN } from "@/fonts";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: (...args: any[]) => any;
  style?: React.CSSProperties;
};

export default function Button(props: ButtonProps) {
  const { children, className, onClick, style } = props;
  return (
    <button
      className={`${className} text-gray-300 px-4 py-2 rounded bg-gradient-to-tr from-white/2 to-white/20 ${alteDIN.className} shadow shadow-white/20`}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}

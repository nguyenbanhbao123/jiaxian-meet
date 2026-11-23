import AuthForm, { type AuthMode } from "./auth/AuthForm";
import HeroSection from "./auth/HeroSection";
import type { AuthUser } from "./home/Avatar";

type Props = {
  mode: AuthMode;
  onAuthSuccess: (user: AuthUser) => void;
};

export default function SignUp({ mode, onAuthSuccess }: Props) {
  return (
    <main id="signup-main" tabIndex={-1} className="flex h-screen w-full bg-[#16171b] text-white font-sans">
      {/* Left Side: Auth Panel */}
      <div className="flex w-full md:w-1/2 flex-col overflow-y-auto px-8 py-12 lg:px-16">
        {/* Header / Logo */}
        <a href="#home" aria-label="Jiaxian Meet home" className="mb-12 flex w-fit items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#dcb886] text-sm font-bold text-black">
            UJ
          </div>
          <span className="text-xl font-semibold tracking-wide">
            Jiaxian <span className="font-light text-gray-400">Meet</span>
          </span>
        </a>

        {/* Form Container */}
        <div className="mx-auto w-full max-w-md flex-1">
          <AuthForm mode={mode} onAuthSuccess={onAuthSuccess} />
        </div>
      </div>

      {/* Right Side: Hero Section (Hidden on smaller screens) */}
      <div className="hidden w-1/2 md:block">
        <HeroSection />
      </div>
    </main>
  );
}
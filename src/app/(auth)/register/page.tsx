import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F2]">
      <div className="bg-[#FDFBF7] p-8 rounded-2xl shadow-md border border-[#9EB4D1]">
        <h1 className="text-center text-xl font-semibold mb-4 text-[#2C2C2C]">
          Create your account ✨
        </h1>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}

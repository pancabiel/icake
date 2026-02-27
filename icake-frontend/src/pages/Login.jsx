import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "@/api";
import { toast } from "react-toastify";

const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(1, "Senha obrigatória"),
});

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(values) {
        setLoading(true);
        try {
            await login(values.email, values.password);
            navigate("/", { replace: true });
        } catch {
            toast.error("E-mail ou senha incorretos.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--main-white)] px-4">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo */}
                <div className="flex flex-col items-center gap-2">
                    <img src="/icon.png" alt="iCake" width={80} />
                    <h1 className="text-2xl font-bold text-[var(--main-red)]">iCake</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--main-black)]">
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="seu@email.com"
                            {...register("email")}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--main-red)] focus:ring-1 focus:ring-[var(--main-red)]"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--main-black)]">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            {...register("password")}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--main-red)] focus:ring-1 focus:ring-[var(--main-red)]"
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-[var(--main-red)] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--main-dark-red)] disabled:opacity-50"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

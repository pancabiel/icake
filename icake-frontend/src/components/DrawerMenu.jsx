import { X, UtensilsCrossed, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/api";

export default function DrawerMenu({ open, onClose }) {
    const navigate = useNavigate();

    function handleNavigate(path) {
        onClose();
        navigate(path);
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 z-40 transition-opacity duration-300"
                style={{
                    background: "rgba(0,0,0,0.45)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                }}
            />

            {/* Drawer panel */}
            <div
                className="fixed top-0 left-0 z-50 h-full w-72 shadow-2xl flex flex-col"
                style={{
                    background: "var(--main-black)",
                    color: "white",
                    transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                    transform: open ? "translateX(0)" : "translateX(-100%)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.1)", background: "var(--main-red)" }}
                >
                    <span className="text-lg font-bold tracking-wide">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/20 transition-colors"
                        aria-label="Fechar menu"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Menu items */}
                <nav className="flex flex-col gap-1 p-4 flex-1">
                    <MenuItem
                        icon={<UtensilsCrossed size={20} />}
                        label="Cardápio"
                        onClick={() => handleNavigate("/cardapio")}
                    />
                </nav>

                {/* Logout */}
                <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <MenuItem
                        icon={<LogOut size={20} />}
                        label="Sair"
                        onClick={logout}
                    />
                </div>
            </div>
        </>
    );
}

function MenuItem({ icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors hover:bg-white/10 active:bg-white/20 w-full"
            style={{ color: "white" }}
        >
            <span style={{ color: "var(--main-pink)" }}>{icon}</span>
            {label}
        </button>
    );
}

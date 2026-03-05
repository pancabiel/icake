import { useEffect, useState } from "react";
import Header from "../components/Header";
import OrderCard from "../components/OrderCard";
import ConfirmModal from "../components/ConfirmModal";
import { fetchOrders, unconcludeOrder } from "@/api";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function ConcludedOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({});

    useEffect(() => {
        fetchOrders("CONCLUDED")
            .then((data) => setOrders(data))
            .catch(() => setError("Erro ao carregar pedidos concluídos."))
            .finally(() => setLoading(false));
    }, []);

    function handleUnconclude(orderId) {
        setModalConfig({
            title: "Reabrir pedido?",
            message: "Tem certeza que deseja reabrir este pedido? Ele voltará para a lista de pendentes.",
            onConfirm: async () => {
                try {
                    await unconcludeOrder(orderId);
                    setOrders((prev) => prev.filter((o) => o.id !== orderId));
                    toast.success("Pedido reaberto!");
                } catch {
                    toast.error("Erro ao reabrir pedido.");
                }
                setModalOpen(false);
            }
        });
        setModalOpen(true);
    }

    return (
        <div style={{ backgroundColor: "rgb(245, 245, 247)", minHeight: "100vh" }}>
            <Header />
            <ConfirmModal
                isOpen={modalOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalOpen(false)}
            />
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Pedidos Concluídos</h2>

                {loading && (
                    <div className="flex justify-center py-16">
                        <LoaderCircle size={36} className="animate-spin" style={{ color: "var(--main-red)" }} />
                    </div>
                )}

                {error && (
                    <p className="text-center py-8 text-red-600">{error}</p>
                )}

                {!loading && !error && orders.length === 0 && (
                    <p className="text-center py-8 text-gray-500">Nenhum pedido concluído.</p>
                )}

                {!loading && !error && orders.length > 0 &&
                    orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            date={new Date(order.dateTime).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                            name={order.clientName}
                            address={order.address}
                            details={order.items
                                .map((orderItem) => `${orderItem.quantity} ${orderItem.item.name}`)
                                .join(", ")}
                            onUnconclude={() => handleUnconclude(order.id)}
                        />
                    ))
                }
            </div>
        </div>
    );
}

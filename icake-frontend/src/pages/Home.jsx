import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import OrderCard from "../components/OrderCard";
import ConfirmModal from "../components/ConfirmModal";
import { fetchOrders, deleteOrder, concludeOrder } from "@/api";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function Home() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalConfig, setModalConfig] = useState({});
	const navigate = useNavigate();

	useEffect(() => {
		fetchOrders("PENDING")
			.then((data) => setOrders(data))
			.catch(() => setError("Erro ao carregar pedidos."))
			.finally(() => setLoading(false));
	}, []);

	function handleEdit(orderId) {
		navigate(`/editOrder/${orderId}`);
	}

	function handleConclude(orderId) {
		setModalConfig({
			title: "Concluir pedido?",
			message: "Tem certeza que deseja concluir este pedido?",
			onConfirm: async () => {
				try {
					await concludeOrder(orderId);
					setOrders((prev) => prev.filter((o) => o.id !== orderId));
					toast.success("Pedido concluído!");
				} catch {
					toast.error("Erro ao concluir pedido.");
				}
				setModalOpen(false);
			}
		});
		setModalOpen(true);
	}

	function handleDelete(orderId) {
		setModalConfig({
			title: "Excluir pedido?",
			message: "Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.",
			onConfirm: async () => {
				try {
					await deleteOrder(orderId);
					setOrders((prev) => prev.filter((o) => o.id !== orderId));
					toast.success("Pedido excluído!");
				} catch {
					toast.error("Erro ao excluir pedido.");
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
				{loading && (
					<div className="flex justify-center py-16">
						<LoaderCircle size={36} className="animate-spin" style={{ color: "var(--main-red)" }} />
					</div>
				)}

				{error && (
					<p className="text-center py-8 text-red-600">{error}</p>
				)}

				{!loading && !error && orders.length === 0 && (
					<p className="text-center py-8 text-gray-500">Nenhum pedido pendente.</p>
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
							}).replace(", ", " - ")}
							name={order.clientName}
							address={order.address?.resume}
							items={order.items?.map((oi) => ({
								quantity: oi.quantity,
								name: oi.item.name
							}))}
							onConclude={() => handleConclude(order.id)}
							onEdit={() => handleEdit(order.id)}
							onDelete={() => handleDelete(order.id)}
						/>
					))
				}
			</div>
		</div>
	);
}
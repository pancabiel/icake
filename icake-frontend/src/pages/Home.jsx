import { useEffect, useState } from "react";
import Header from "../components/Header";
import OrderCard from "../components/OrderCard";
import { fetchOrders } from "@/api";
import { LoaderCircle } from "lucide-react";

export default function Home() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchOrders()
			.then((data) => setOrders(data))
			.catch(() => setError("Erro ao carregar pedidos."))
			.finally(() => setLoading(false));
	}, []);

	return <div>
		<Header />
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
				<p>Nenhum pedido pendente.</p>
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
					/>
				))
			}
		</div>
	</div>;
}
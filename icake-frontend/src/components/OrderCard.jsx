export default function OrderCard({ date, name, address, details }) {
	return (
		<div className="border rounded-lg p-4 shadow-sm bg-white mb-4">
			<p className="font-semibold">Data: {date}</p>
			<p>Cliente: {name}</p>
			<p>Endereço: {address}</p>
			<p>Detalhes: {details}</p>
		</div>
	);
}

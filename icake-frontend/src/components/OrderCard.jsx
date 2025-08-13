export default function OrderCard({ date, name, address, details }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white mb-4">
      <p className="font-semibold">Data da encomenda: {date}</p>
      <p>Nome do cliente: {name}</p>
      <p>Endereço do cliente: {address}</p>
      <p>Detalhes do pedido: {details}</p>
    </div>
  );
}

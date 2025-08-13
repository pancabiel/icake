import Header from "./components/Header";
import Footer from "./components/Footer";
import OrderCard from "./components/OrderCard";

export default function App() {
  const orders = [
    {
      date: "12/08/2025",
      name: "Maria Souza",
      address: "Rua das Flores, 123",
      details: "Bolo de chocolate, 2kg",
    },
    {
      date: "13/08/2025",
      name: "João Silva",
      address: "Av. Central, 456",
      details: "Cupcakes sortidos, 24 unidades",
    },
  ];

  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      <Header />

      <main className="p-4">
        <h2 className="text-xl font-bold mb-4">Encomendas</h2>
        {orders.map((order, index) => (
          <OrderCard key={index} {...order} />
        ))}
      </main>

      <Footer />
    </div>
  );
}

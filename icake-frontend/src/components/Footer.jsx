import { Home, Package, PlusCircle, MessageCircle, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="flex justify-around items-center py-3 border-t bg-white fixed bottom-0 w-full">
      <button><Home size={28} /></button>
      <button><Package size={28} /></button>
      <button><PlusCircle size={28} /></button>
      <button><MessageCircle size={28} /></button>
      <button><User size={28} /></button>
    </footer>
  );
}

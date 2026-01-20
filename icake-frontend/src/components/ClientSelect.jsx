import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useState } from "react";

export default function ClientSelect({ clients, value, onChange }) {
  const [query, setQuery] = useState("");

  const filteredClients =
    query === ""
      ? clients
      : clients.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <ComboboxInput
          placeholder="Nome do cliente"
          className="w-full border p-2 rounded"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(val) => {
            if (!val) return "";
            if (val.type === "new") return val.name;
            return clients.find(c => c.id === val.id)?.name || "";
          }}
          autoComplete="off"
        />

        <ComboboxOptions className="absolute w-full mt-1 border rounded bg-white z-10 max-h-40 overflow-auto">
          {filteredClients.length === 0 && query !== "" ? (
            <ComboboxOption
              value={{ type: "new", name: query }}
              className="cursor-pointer p-2 rounded-md data-focus:bg-blue-100 transition-colors">
              <span>Criar "{query}"</span>
            </ComboboxOption>
          ) : (
            filteredClients.map((client) => (
              <ComboboxOption
                key={client.id}
                value={{ type: "existing", id: client.id }}
                className="cursor-pointer p-2 rounded-md data-focus:bg-blue-100 transition-colors">
                {client.name}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}

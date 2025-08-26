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
        />
        <ComboboxOptions className="absolute w-full mt-1 border rounded bg-white z-10 max-h-40 overflow-auto">
          {filteredClients.length === 0 && query !== "" ? (
            <ComboboxOption value={query}>
              <span>Create "{query}"</span>
            </ComboboxOption>
          ) : (
            filteredClients.map((client) => (
              <ComboboxOption key={client.id} value={client.name}>
                {client.name}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}

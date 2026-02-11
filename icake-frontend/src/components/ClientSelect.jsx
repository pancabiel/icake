import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useState, useMemo } from "react";

// Search scoring function
function searchScore(name, query) {
  const nameLower = name.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match
  if (nameLower === queryLower) return 1000;

  // Starts with query
  if (nameLower.startsWith(queryLower)) return 500;

  // Word in name starts with query
  const words = nameLower.split(/\s+/);
  const startsWithWord = words.some(word => word.startsWith(queryLower));
  if (startsWithWord) return 300;

  // Contains query
  if (nameLower.includes(queryLower)) return 100;

  // No match
  return 0;
}

export default function ClientSelect({ clients, value, onChange }) {
  const [query, setQuery] = useState("");

  const filteredClients = useMemo(() => {
    if (query === "") return clients;

    // Score and filter clients
    const scored = clients
      .map(client => ({
        ...client,
        score: searchScore(client.name, query)
      }))
      .filter(client => client.score > 0)
      .sort((a, b) => b.score - a.score); // Sort by score descending

    return scored;
  }, [clients, query]);

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <ComboboxInput
          id="client-select-input"
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

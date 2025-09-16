import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useState } from "react";

export default function ItemSelect({ items, value, onChange }) {
  const [query, setQuery] = useState("");

  const filteredItems =
    query === ""
      ? items
      : items.filter((i) =>
          i.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <ComboboxInput
          placeholder="Selecione ou digite um item"
          className="w-full border p-2 rounded"
          onChange={(e) => setQuery(e.target.value)}
          displayValue={(id) => items.find(i => i.id === id)?.name || ""}
        />
        <ComboboxOptions className="absolute w-full mt-1 border rounded bg-white z-10 max-h-40 overflow-auto">
          {filteredItems.length === 0 && query !== "" ? (
            <ComboboxOption value={query} key="new-item">
              <span>Criar "{query}"</span>
            </ComboboxOption>
          ) : (
            filteredItems.map((item) => (
              <ComboboxOption key={item.id} value={item.id}>
                {item.name}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}

import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useState, useEffect } from "react";
import { fetchAddressesByClientId } from "@/api";

export default function AddressSelect({ clientId, value, onChange, disabled }) {
  const [query, setQuery] = useState("");
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (clientId) {
      fetchAddressesByClientId(clientId).then(setAddresses);
    } else {
      setAddresses([]);
    }
  }, [clientId]);

  const filteredAddresses =
    query === ""
      ? addresses
      : addresses.filter((a) =>
          a.street.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox value={value || ""} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <ComboboxInput
          placeholder={disabled ? "Selecione um cliente" : "Selecione ou digite um endereço"}
          className={`w-full border p-2 rounded ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          displayValue={(id) => addresses.find(c => c.id === id)?.resume || ""}
        />
        {!disabled && (
          <ComboboxOptions className="absolute w-full mt-1 border rounded bg-white z-10 max-h-40 overflow-auto">
            {filteredAddresses.length === 0 && query !== "" ? (
              <ComboboxOption key="new-address" value={query}>
                <span>Criar endereço "{query}"</span>
              </ComboboxOption>
            ) : (
              filteredAddresses.map((address) => (
                <ComboboxOption key={address.id} value={address.id}>
                  {address.resume}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}

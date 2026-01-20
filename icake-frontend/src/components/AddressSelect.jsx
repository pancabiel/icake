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
          displayValue={(val) => {
            if (!val) return "";
            if (val.type === "new") return val.street;
            return addresses.find(a => a.id === val.id)?.resume || "";
          }}
          autoComplete="off"
        />
        {!disabled && (
          <ComboboxOptions className="absolute w-full mt-1 border rounded bg-white z-10 max-h-40 overflow-auto">
            {filteredAddresses.length === 0 && query !== "" ? (
              <ComboboxOption
                key="new-address"
                value={{ type: "new", street: query }}
                className="cursor-pointer p-2 rounded-md data-focus:bg-blue-100 transition-colors">
                <span>Criar endereço "{query}"</span>
              </ComboboxOption>
            ) : (
              filteredAddresses.map((address) => (
                <ComboboxOption
                  key={address.id}
                  value={{ type: "existing", id: address.id }}
                  className="cursor-pointer p-2 rounded-md data-focus:bg-blue-100 transition-colors">
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

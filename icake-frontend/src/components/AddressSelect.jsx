import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useState, useEffect } from "react";
import { fetchAddressesByClientId } from "@/api";

export default function AddressSelect({ clientId, value, onChange, disabled, refreshKey, isNewClient }) {
  const [query, setQuery] = useState("");
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (clientId) {
      fetchAddressesByClientId(clientId).then(setAddresses);
    } else {
      setAddresses([]);
    }
  }, [clientId, refreshKey]);

  const filteredAddresses =
    query === ""
      ? addresses
      : addresses.filter((a) =>
        a.street.toLowerCase().includes(query.toLowerCase())
      );

  const getPlaceholder = () => {
    if (isNewClient) return "Adicione um endereço";
    if (disabled) return "Selecione um cliente";
    return "Selecione um endereço";
  };

  return (
    <Combobox value={value || ""} onChange={onChange} disabled={disabled || isNewClient}>
      <div className="relative">
        <ComboboxInput
          placeholder={getPlaceholder()}
          className={`w-full border p-2 rounded ${(disabled || isNewClient) ? "bg-gray-100 cursor-not-allowed" : ""} ${isNewClient ? "pointer-events-none" : ""}`}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled || isNewClient}
          displayValue={(val) => {
            if (!val) return "";
            // For new addresses in memory, build display string from fields
            if (val.type === "new") {
              return `${val.street}, ${val.number}${val.complement ? ` - ${val.complement}` : ""}`;
            }
            // For addresses with resume (from API response), use it directly
            if (val.resume) {
              return val.resume;
            }
            // For existing addresses selected from dropdown, find in fetched list
            return addresses.find(a => a.id === val.id)?.resume || "";
          }}
          autoComplete="off"
        />
        {!disabled && (
          <ComboboxOptions className="absolute w-full mt-1 border rounded bg-white z-10 max-h-40 overflow-auto">
            {filteredAddresses.length === 0 ? (
              <div className="p-2 text-gray-500">Nenhum endereço encontrado</div>
            ) : (
              filteredAddresses.map((address) => (
                <ComboboxOption
                  key={address.id}
                  value={{ id: address.id }}
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

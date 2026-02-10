import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/react'
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import { fetchCities } from "@/api";

export default function AddressModal({ open, onClose, onSave, isNewClient }) {
    const [cities, setCities] = useState([]);
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const streetInputRef = useRef(null);
    const numberInputRef = useRef(null);
    const complementInputRef = useRef(null);
    const lastFetchedCepRef = useRef(null);

    const form = useForm({
        defaultValues: {
            zipCode: "",
            city: "", // store city name
            street: "",
            number: "",
            complement: ""
        }
    });

    useEffect(() => {
        // Fetch cities on mount
        fetchCities()
            .then(data => {
                if (Array.isArray(data)) {
                    setCities(data);
                }
            })
            .catch(err => console.error("Failed to fetch cities", err));
    }, []);

    // Only show cities when user starts typing, and limit to 50 results for performance
    const filteredCities =
        query === ''
            ? []
            : cities
                .filter((city) =>
                    city.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .startsWith(query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
                )
                .slice(0, 50)

    const handleCepLookup = useCallback(async (cep) => {
        if (cep === lastFetchedCepRef.current) return;
        lastFetchedCepRef.current = cep;

        setIsLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                await new Promise(resolve => setTimeout(resolve, 500));
                form.setValue("street", data.logradouro);

                // Helper for normalization
                const normalize = (str) =>
                    str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

                const targetCity = normalize(data.localidade);

                // Try to match city
                const cityMatch = cities.find(c => normalize(c.name) === targetCity);
                if (cityMatch) {
                    setQuery(cityMatch.name); // Updates the Combobox display
                    form.setValue("city", cityMatch.name);
                }
            }
        } catch (error) {
            console.error("ViaCEP error", error);
        } finally {
            setIsLoading(false);
        }
    }, [cities, form]);

    const handleSubmit = useCallback(async (values) => {
        // Find the city object by name to get its id
        const cityMatch = cities.find(c => c.name === values.city);

        setIsSubmitting(true);
        try {
            await onSave({
                zipCode: values.zipCode,
                street: values.street,
                number: values.number,
                complement: values.complement,
                city: cityMatch ? { id: cityMatch.id } : null
            });
            // We don't call onClose() here. 
            // The parent (OrderForm) will call setAddressModalOpen(false) on SUCCESS.
        } catch (err) {
            // Error is handled in OrderForm (toast). 
            // We stay open here.
        } finally {
            setIsSubmitting(false);
        }
    }, [cities, onSave]);

    useEffect(() => {
        if (!open && !isNewClient) {
            form.reset();
            lastFetchedCepRef.current = null;
            setQuery('');
        }
    }, [open, form, isNewClient]);

    // Debounced CEP lookup - triggers 500ms after user stops typing
    useEffect(() => {
        let timeoutId;
        const subscription = form.watch((value, { name }) => {
            if (name === 'zipCode') {
                const cep = value.zipCode?.replace(/\D/g, '');
                if (cep?.length === 8) {
                    if (timeoutId) clearTimeout(timeoutId);
                    timeoutId = setTimeout(async () => {
                        await handleCepLookup(cep);
                    }, 500);
                }
            }
        });
        return () => {
            subscription.unsubscribe();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [form.watch, handleCepLookup]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-lg">
                        <Loader2 className="animate-spin text-[var(--main-red)]" size={48} />
                    </div>
                )}
                <DialogHeader>
                    <DialogTitle>Novo Endereço</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="zipCode"
                            autoComplete="off"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CEP</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="00000-000"
                                            maxLength={9}
                                            autoComplete="off"
                                            onKeyDown={async (e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    const cep = field.value?.replace(/\D/g, '');
                                                    if (cep?.length === 8) {
                                                        await handleCepLookup(cep);
                                                        // Check if street and city were filled to move focus
                                                        const values = form.getValues();

                                                        if (values.street && values.city) {
                                                            numberInputRef.current?.focus();
                                                        } else {
                                                            // If lookup failed or didn't fill, go to city
                                                            document.getElementById('city-input')?.focus();
                                                        }
                                                    } else {
                                                        document.getElementById('city-input')?.focus();
                                                    }
                                                }
                                            }}
                                            onBlur={(e) => {
                                                field.onBlur();
                                                const cep = e.target.value?.replace(/\D/g, '');
                                                if (cep?.length === 8) {
                                                    handleCepLookup(cep);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Cidade</FormLabel>
                                    <FormControl>
                                        <Combobox as="div" value={field.value} onChange={field.onChange} onClose={() => setQuery('')}>
                                            <div className="relative">
                                                <ComboboxInput
                                                    id="city-input"
                                                    className={clsx(
                                                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    )}
                                                    displayValue={(city) => city}
                                                    onChange={(event) => setQuery(event.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            streetInputRef.current?.focus();
                                                        }
                                                    }}
                                                />
                                                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronsUpDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
                                                </ComboboxButton>
                                            </div>
                                            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-[calc(100%-3rem)] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                {query === '' ? (
                                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
                                                        Digite para buscar...
                                                    </div>
                                                ) : filteredCities.length === 0 ? (
                                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                        Nada encontrado.
                                                    </div>
                                                ) : (
                                                    filteredCities.map((city) => (
                                                        <ComboboxOption
                                                            key={city.id}
                                                            className={({ active }) =>
                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-[var(--main-red)] text-white' : 'text-gray-900'
                                                                }`
                                                            }
                                                            value={city.name}
                                                        >
                                                            {({ selected, active }) => (
                                                                <>
                                                                    <span
                                                                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                                            }`}
                                                                    >
                                                                        {city.name}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span
                                                                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-[var(--main-red)]'
                                                                                }`}
                                                                        >
                                                                            <Check className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </ComboboxOption>
                                                    ))
                                                )}
                                            </ComboboxOptions>
                                        </Combobox>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="street"
                            autoComplete="off"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rua</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            ref={streetInputRef}
                                            placeholder="Nome da rua"
                                            autoComplete="off"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    numberInputRef.current?.focus();
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            ref={numberInputRef}
                                            placeholder="123, 12A, S/N"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    complementInputRef.current?.focus();
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="complement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Complemento</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            ref={complementInputRef}
                                            placeholder="Apartamento, bloco, referência"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    // Just prevent submission, blurring is natural on mobile Enter at last field
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Salvar"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

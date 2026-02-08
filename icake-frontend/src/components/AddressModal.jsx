import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/react'
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { fetchCities } from "@/api";

export default function AddressModal({ open, onClose, onSave }) {
    const [cities, setCities] = useState([]);
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false);

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

    // Debounced CEP lookup - triggers 500ms after user stops typing
    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            if (name === 'zipCode') {
                const cep = value.zipCode?.replace(/\D/g, '');
                if (cep?.length === 8) {
                    const timeoutId = setTimeout(() => {
                        handleCepLookup(cep);
                    }, 500);
                    return () => clearTimeout(timeoutId);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    async function handleCepLookup(cep) {
        setIsLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                form.setValue("street", data.logradouro);

                // Try to match city
                const cityMatch = cities.find(c => c.name.toLowerCase() === data.localidade.toLowerCase());
                if (cityMatch) {
                    form.setValue("city", cityMatch.name);
                }
            }
        } catch (error) {
            console.error("ViaCEP error", error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSubmit(values) {
        // Find the city object by name to get its id
        const cityMatch = cities.find(c => c.name === values.city);

        onSave({
            zipCode: values.zipCode,
            street: values.street,
            number: values.number,
            complement: values.complement,
            city: cityMatch ? { id: cityMatch.id } : null
        });
        form.reset();
        setQuery('');
    }

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
                                            inputMode="numeric"
                                            maxLength={9}
                                            autoComplete="off"
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
                                                    className={clsx(
                                                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    )}
                                                    displayValue={(city) => city}
                                                    onChange={(event) => setQuery(event.target.value)}
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
                                            placeholder="Nome da rua"
                                            autoComplete="off"
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
                                            placeholder="123, 12A, S/N"
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
                                            placeholder="Apartamento, bloco, referência"
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
                            >
                                Cancelar
                            </Button>

                            <Button type="submit">
                                Salvar
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

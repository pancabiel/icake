"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { fetchClients, fetchItems } from "@/api";
import ClientSelect from "@/components/ClientSelect";
import AddressSelect from "@/components/AddressSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ItemSelect from "@/components/ItemSelect";
import { Trash } from "lucide-react";

const orderSchema = z.object({
	clientId: z.string().nonempty("Client is required"),
	date: z.date({ required_error: "Date is required" })
});

export default function OrderForm() {
	const form = useForm({
		resolver: zodResolver(orderSchema),
		defaultValues: {
			clientId: "",
			addressId: "",
			date: null,
			items: [{ productId: "", quantity: 1 }],
		},
	});

	const [clients, setClients] = useState([]);
	const [items, setItems] = useState([]);

	useEffect(() => {
		fetchClients()
			.then(setClients);
	}, []);

	useEffect(() => {
		fetchItems()
			.then(setItems);
	}, [])

	useEffect(() => {
		form.setValue("addressId", ""); // reset address whenever client changes
	}, [form.watch("clientId")]);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	async function onSubmit(values) {
		const confirmed = confirm("Salvar o pedido?");
		if (!confirmed) return;

		await fetch("http://localhost:8080/api/orders", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});
		form.reset();
	}

	return (
		<div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
					<Controller
						control={form.control}
						name="clientId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cliente</FormLabel>
								<FormControl>
									<ClientSelect
										clients={clients}
										value={field.value}
										onChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<Controller
						control={form.control}
						name="addressId"
						render={({ field }) => {
							const selectedClient = form.watch("clientId");
							const isNewClient = !clients.find(c => c.id === selectedClient);

							return (
								<FormItem>
									<FormLabel>Endereço</FormLabel>
									<FormControl>
										<AddressSelect
											clientId={isNewClient ? null : selectedClient} // only fetch addresses if existing client
											value={field.value}
											onChange={field.onChange}
											disabled={!selectedClient} // disabled if no client selected
										/>
									</FormControl>
								</FormItem>
							);
						}}
					/>

					<FormField
						control={form.control}
						name="date"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Data</FormLabel>
								<FormControl>
									<DatePicker
          							className="w-full border p-2 rounded"
										selected={field.value ? new Date(field.value) : null}
										onChange={(date) => field.onChange(date)}
          							dateFormat="dd/MM/yyyy"
			 						/>
								</FormControl>
							</FormItem>
						)}
					/>

					<div className="space-y-4">
						<h3 className="font-semibold">Itens</h3>
						{fields.map((item, index) => (
							<div key={item.id} className="space-y-2">
								<div className="flex gap-4 items-end">
									<Controller
										control={form.control}
										name={`items.${index}.productId`} // must match fieldArray
										render={({ field }) => (
											<FormItem className="flex-1">
												<FormLabel>Item</FormLabel>
												<FormControl>
													<ItemSelect
														items={items}      // all available items
														value={field.value} // selected item id
														onChange={field.onChange}
													/>
												</FormControl>
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name={`items.${index}.quantity`}
										render={({ field }) => (
											<FormItem className="w-24">
												<FormLabel>Qntd</FormLabel>
												<FormControl>
													<Input type="number" {...field} className="h-11"/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="flex-1">
									<FormField
										control={form.control}
										name={`items.${index}.note`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Descrição</FormLabel>
												<FormControl>
													<textarea
														{...field}
														className="w-full border rounded p-2 resize-none h-24"
														placeholder="Descrição do item (opcional)"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="flex justify-end mt-1">
									<Button
										type="button"
										variant="destructive"
										size="icon"
										onClick={() => {
											if (confirm("Excluir o item?")) {
												remove(index);
											}
										}}
									>
										<Trash className="w-5 h-5" />
									</Button>
								</div>
							</div>
						))}
						<Button 
							type="button" 
							variant="secondary"
							className="w-full"
							onClick={() => append({ productId: "", quantity: 1 })}>
							Adicionar Item
						</Button>
					</div>
					<Button
						type="submit"
						className="w-full"
					>
						Salvar pedido
					</Button>
				</form>
			</Form>
		</div>
	);
}

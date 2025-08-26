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
import { fetchClients } from "@/api";
import { Combobox } from "@headlessui/react";
import ClientSelect from "@/components/ClientSelect";

const orderSchema = z.object({
	clientId: z.string().min(1, "Client ID is required"),
	addressId: z.string().min(1, "Address ID is required"),
	date: z.string().min(1, "Date is required"),
	items: z
		.array(
			z.object({
				productId: z.string().min(1, "Product ID is required"),
				quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
			})
		)
		.min(1, "At least one item is required"),
});

export default function OrderForm() {
	const form = useForm({
		resolver: zodResolver(orderSchema),
		defaultValues: {
			client: "",
			addressId: "",
			date: "",
			items: [{ productId: "", quantity: 1 }],
		},
	});

	const [clients, setClients] = useState([]);

	useEffect(() => {
		fetchClients()
			.then(setClients);
	}, []);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	async function onSubmit(values) {
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
					{/* Combobox for Client */}
					<Controller
						control={form.control}
						name="client"
						render={({ field }) => (
							<ClientSelect
								clients={clients}
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					/>

					<FormField
						control={form.control}
						name="addressId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Address ID</FormLabel>
								<FormControl>
									<Input placeholder="Enter address ID" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="date"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Date</FormLabel>
								<FormControl>
									<Input type="date" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="space-y-4">
						<h3 className="font-semibold">Items</h3>
						{fields.map((item, index) => (
							<div key={item.id} className="flex gap-4 items-end">
								<FormField
									control={form.control}
									name={`items.${index}.productId`}
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormLabel>Product ID</FormLabel>
											<FormControl>
												<Input placeholder="Product ID" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name={`items.${index}.quantity`}
									render={({ field }) => (
										<FormItem className="w-24">
											<FormLabel>Qty</FormLabel>
											<FormControl>
												<Input type="number" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="button"
									variant="destructive"
									onClick={() => remove(index)}
								>
									Remove
								</Button>
							</div>
						))}
						<Button type="button" variant="secondary" onClick={() => append({ productId: "", quantity: 1 })}>
							Add Item
						</Button>
					</div>

					<Button type="submit" className="w-full">
						Create Order
					</Button>
				</form>
			</Form>
		</div>
	);
}

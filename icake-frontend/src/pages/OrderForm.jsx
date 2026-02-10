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
import { createAddress, createOrder, fetchClients, fetchItems } from "@/api";
import ClientSelect from "@/components/ClientSelect";
import AddressSelect from "@/components/AddressSelect";

import ItemSelect from "@/components/ItemSelect";
import { Trash } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import AddressModal from "@/components/AddressModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const orderSchema = z.object({
	client: z.any(),
	date: z.date({ required_error: "Date is required" })
});

export default function OrderForm() {
	const form = useForm({
		resolver: zodResolver(orderSchema),
		defaultValues: {
			client: null,
			address: null,
			date: null,
			items: [{ productId: "", quantity: 1 }],
		},
	});

	const [clients, setClients] = useState([]);
	const [items, setItems] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalConfig, setModalConfig] = useState({});
	const [addressModalOpen, setAddressModalOpen] = useState(false);
	const [addressRefreshKey, setAddressRefreshKey] = useState(0);

	const openDeleteModal = (index) => {
		setModalConfig({
			title: "Excluir item?",
			message: "Tem certeza que deseja excluir o item?",
			onConfirm: () => {
				remove(index);
				setModalOpen(false);
			}
		});
		setModalOpen(true);
	};

	const openFinishModal = () => {
		setModalConfig({
			title: "Finalizar pedido?",
			message: "Tem certeza que deseja finalizar o pedido?",
			onConfirm: () => {
				setModalOpen(false);
				onSubmit(form.getValues());
			}
		});
		setModalOpen(true);
	};

	useEffect(() => {
		fetchClients()
			.then(setClients);
	}, []);

	useEffect(() => {
		fetchItems()
			.then(setItems);
	}, [])

	useEffect(() => {
		form.setValue("address", null); // reset address whenever client changes
	}, [form.watch("client")]);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	async function handleCreateAddress(data) {
		const selectedClient = form.watch("client");
		const isNewClient = selectedClient?.type === "new";

		if (isNewClient) {
			// For new clients, store address data locally (will be created with the order)
			form.setValue("address", {
				type: "new",
				zipCode: data.zipCode,
				street: data.street,
				number: data.number,
				complement: data.complement,
				city: data.city
			});
			setAddressModalOpen(false);
		} else {
			// For existing clients, create address via API
			const clientId = selectedClient?.id;
			const res = await createAddress(clientId, {
				zipCode: data.zipCode,
				street: data.street,
				number: data.number,
				complement: data.complement,
				city: data.city
			});

			if (res.ok) {
				await new Promise(resolve => setTimeout(resolve, 500));
				const newAddress = await res.json();

				// Store the full address so AddressSelect can display it
				form.setValue("address", newAddress);
				// Trigger refresh of address list
				setAddressRefreshKey(prev => prev + 1);
				setAddressModalOpen(false);
			} else {
				toast.error("Erro ao criar endereço");
				await new Promise(resolve => setTimeout(resolve, 500));
				throw res; // Re-throw to inform the modal
			}
		}
	}

	async function onSubmit(values) {
		try {
			const order = await createOrder(values);
			form.reset();
			setAddressRefreshKey(0); // Reset address cache
			toast.success("Pedido criado com sucesso!");
		} catch (err) {
			console.error(err);
			toast.error("Erro ao criar pedido");
		}
	}

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			const target = e.target;
			// Allow Enter for textareas and buttons (if they need it)
			if (target.tagName === "TEXTAREA") {
				return;
			}

			// Special case: Client select + New Client -> Open Address Modal
			if (target.id === "client-select-input") {
				const selectedClient = form.getValues("client");
				if (selectedClient?.type === "new") {
					e.preventDefault();
					setAddressModalOpen(true);
					return;
				}
			}

			e.preventDefault();
			const formElements = Array.from(e.currentTarget.querySelectorAll("input, select, textarea"));
			const index = formElements.indexOf(target);
			if (index > -1 && index < formElements.length - 1) {
				formElements[index + 1].focus();
			}
		}
	};

	return (
		<div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
			<ToastContainer />
			<ConfirmModal
				isOpen={modalOpen}
				title={modalConfig.title}
				message={modalConfig.message}
				onConfirm={modalConfig.onConfirm}
				onCancel={() => setModalOpen(false)}
			/>
			<AddressModal
				open={addressModalOpen}
				onClose={() => setAddressModalOpen(false)}
				onSave={handleCreateAddress}
				isNewClient={form.watch("client")?.type === "new"}
			/>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					onKeyDown={handleKeyDown}
					className="space-y-6 max-w-lg mx-auto"
				>
					<Controller
						control={form.control}
						name="client"
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
						name="address"
						render={({ field }) => {
							const selectedClient = form.watch("client");
							const isNewClient = selectedClient?.type === "new";

							return (
								<FormItem>
									<FormLabel>Endereço</FormLabel>
									<FormControl>
										<div className="flex gap-2">
											<div
												className={`flex-1 ${isNewClient ? "cursor-pointer" : ""}`}
												onClick={() => isNewClient && setAddressModalOpen(true)}
											>
												<AddressSelect
													clientId={isNewClient ? null : selectedClient?.id}
													value={field.value}
													onChange={field.onChange}
													disabled={!selectedClient}
													refreshKey={addressRefreshKey}
													isNewClient={isNewClient}
												/>
											</div>

											<button
												type="button"
												onClick={() => setAddressModalOpen(true)}
												className={`px-3 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent ${isNewClient ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : ""
													}`}
												disabled={!selectedClient}
											>
												+
											</button>
										</div>

									</FormControl>
								</FormItem>
							);
						}}
					/>

					<FormField
						control={form.control}
						name="date"
						render={({ field }) => {
							const dateValue = field.value ? new Date(field.value) : null;
							const displayValue = dateValue ?
								`${String(dateValue.getDate()).padStart(2, '0')}/${String(dateValue.getMonth() + 1).padStart(2, '0')}/${dateValue.getFullYear()}`
								: "";
							const nativeValue = dateValue ? dateValue.toISOString().split('T')[0] : "";

							return (
								<FormItem>
									<FormLabel>Data</FormLabel>
									<FormControl>
										<div
											className="relative cursor-pointer"
											onClick={(e) => {
												const input = e.currentTarget.querySelector('input[type="date"]');
												if (input && input.showPicker) {
													input.showPicker();
												}
											}}
										>
											<Input
												type="text"
												readOnly
												placeholder="dd/mm/aaaa"
												className="w-full h-11 pointer-events-none"
												value={displayValue}
											/>
											<input
												type="date"
												className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
												value={nativeValue}
												onChange={(e) => {
													const val = e.target.value;
													field.onChange(val ? new Date(val + "T00:00:00") : null);
												}}
											/>
										</div>
									</FormControl>
								</FormItem>
							);
						}}
					/>

					<div className="space-y-4">
						<h3 className="font-semibold text-2xl">Itens</h3>
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
												<FormLabel>Qntd.</FormLabel>
												<FormControl>
													<Input type="number" {...field} className="h-11" min="1" />
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
										onClick={openDeleteModal.bind(null, index)}
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
						type="button"
						className="w-full"
						onClick={openFinishModal}
					>
						Salvar pedido
					</Button>
				</form>
			</Form>
		</div>
	);
}

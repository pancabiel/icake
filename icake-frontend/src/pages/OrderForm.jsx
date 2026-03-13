import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createAddress, createOrder, fetchClients, fetchItems, fetchOrderById, getToken } from "@/api";
import ClientSelect from "@/components/ClientSelect";
import AddressSelect from "@/components/AddressSelect";
import ItemSelect from "@/components/ItemSelect";
import ItemAddonModal from "@/components/ItemAddonModal";
import { Trash } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import AddressModal from "@/components/AddressModal";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const orderSchema = z.object({
	client: z.any(),
	date: z.date({ required_error: "Data é obrigatória" }),
	time: z.string().min(1, { message: "Hora é obrigatória" }),
});

export default function OrderForm() {
	const { id: orderId } = useParams();
	const navigate = useNavigate();
	const isEditMode = !!orderId;

	const form = useForm({
		resolver: zodResolver(orderSchema),
		defaultValues: {
			client: null,
			address: null,
			date: null,
			time: "08:00",
			// Each item now carries: productId, quantity, note, addonOptionIds, selections
			items: [{ productId: "", quantity: 1, note: "", addonOptionIds: [], selections: {} }],
		},
	});

	const [clients, setClients] = useState([]);
	const [items, setItems] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalConfig, setModalConfig] = useState({});
	const [addressModalOpen, setAddressModalOpen] = useState(false);
	const [addressRefreshKey, setAddressRefreshKey] = useState(0);
	const [isMobile, setIsMobile] = useState(false);

	// ── Addon modal state ──────────────────────────────────────────────────────
	// { index, item } — which field row and which item triggered it
	const [addonModal, setAddonModal] = useState(null);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 640);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const openDeleteModal = (index) => {
		setModalConfig({
			title: "Excluir item?",
			message: "Tem certeza que deseja excluir o item?",
			onConfirm: () => { remove(index); setModalOpen(false); },
		});
		setModalOpen(true);
	};

	const openFinishModal = () => {
		setModalConfig({
			title: "Finalizar pedido?",
			message: "Tem certeza que deseja finalizar o pedido?",
			onConfirm: () => { setModalOpen(false); onSubmit(form.getValues()); },
		});
		setModalOpen(true);
	};

	useEffect(() => { fetchClients().then(setClients); }, []);
	useEffect(() => { fetchItems().then(setItems); }, []);

	useEffect(() => {
		if (!isEditMode) return;
		fetchOrderById(orderId).then((order) => {
			const dt = new Date(order.dateTime);
			form.setValue("client", { id: order.client.id, name: order.client.name, type: "existing" });
			form.setValue("address", order.address);
			form.setValue("date", dt);
			form.setValue("time", `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`);
			if (order.items?.length > 0) {
				form.setValue("items", order.items.map((oi) => ({
					productId: oi.item.id,
					quantity: oi.quantity,
					note: oi.note || "",
					// Rebuild selections from existing addonSelections
					addonOptionIds: oi.addonSelections?.map(s => s.id) ?? [],
					selections: {},
				})));
			}
		});
	}, [isEditMode, orderId]);

	const watchedClient = form.watch("client");
	useEffect(() => {
		if (!isEditMode) form.setValue("address", null);
	}, [watchedClient]);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	// ── When an item is selected, open the addon modal if item has addons ──────
	function handleItemSelected(index, productId) {
		form.setValue(`items.${index}.productId`, productId);
		form.setValue(`items.${index}.addonOptionIds`, []);
		form.setValue(`items.${index}.selections`, {});

		if (!productId) return;
		const selectedItem = items.find(i => i.id === productId || String(i.id) === String(productId));
		if (!selectedItem) return;

		// Open modal — it will fetch addons internally
		setAddonModal({ index, item: selectedItem });
	}

	// ── When addon modal confirms ──────────────────────────────────────────────
	function handleAddonConfirm({ selections, addonOptionIds, note }) {
		const { index } = addonModal;
		form.setValue(`items.${index}.selections`, selections);
		form.setValue(`items.${index}.addonOptionIds`, addonOptionIds);
		if (note) form.setValue(`items.${index}.note`, note);
		setAddonModal(null);
	}

	async function handleCreateAddress(data) {
		const selectedClient = form.watch("client");
		const isNewClient = selectedClient?.type === "new";

		if (isNewClient) {
			form.setValue("address", { type: "new", ...data });
			setAddressModalOpen(false);
		} else {
			const clientId = selectedClient?.id;
			const res = await createAddress(clientId, data);
			if (res.ok) {
				await new Promise(resolve => setTimeout(resolve, 500));
				const newAddress = await res.json();
				form.setValue("address", newAddress);
				setAddressRefreshKey(prev => prev + 1);
				setAddressModalOpen(false);
			} else {
				toast.error("Erro ao criar endereço");
				throw res;
			}
		}
	}

	async function onSubmit(values) {
		try {
			const datePart = values.date.toISOString().split("T")[0];
			const dateTime = `${datePart}T${values.time}:00`;

			const itemsPayload = values.items.map(item => ({
				item: { id: item.productId },
				quantity: item.quantity,
				note: item.note,
				addonOptionIds: item.addonOptionIds ?? [],
			}));

			if (isEditMode) {
				const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${getToken()}`,
					},
					body: JSON.stringify({
						client: values.client.type === "new"
							? { name: values.client.name }
							: { id: values.client.id },
						address: values.address.type === "new"
							? { zipCode: values.address.zipCode, street: values.address.street, number: values.address.number, complement: values.address.complement, city: values.address.city }
							: { id: values.address.id },
						dateTime,
						items: itemsPayload,
					}),
				});
				if (!res.ok) throw new Error("Failed to update order");
				toast.success("Pedido atualizado com sucesso!");
				navigate("/");
			} else {
				await createOrder({ ...values, dateTime, items: itemsPayload });
				form.reset();
				setAddressRefreshKey(0);
				toast.success("Pedido criado com sucesso!");
			}
		} catch (err) {
			console.error(err);
			toast.error(isEditMode ? "Erro ao atualizar pedido" : "Erro ao criar pedido");
		}
	}

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			const target = e.target;
			if (target.tagName === "TEXTAREA") return;
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
			if (index > -1 && index < formElements.length - 1) formElements[index + 1].focus();
		}
	};

	return (
		<div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
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

			{/* Addon Modal */}
			{addonModal && (
				<ItemAddonModal
					item={addonModal.item}
					initialAddonOptionIds={form.getValues(`items.${addonModal.index}.addonOptionIds`)}
					initialNote={form.getValues(`items.${addonModal.index}.note`)}
					onClose={() => setAddonModal(null)}
					onConfirm={handleAddonConfirm}
				/>
			)}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-6 max-w-lg mx-auto">

					{/* Client, Address, Date, Time — unchanged */}
					<Controller
						control={form.control}
						name="client"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cliente</FormLabel>
								<FormControl>
									<ClientSelect clients={clients} value={field.value} onChange={field.onChange} />
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
											<div className={`flex-1 ${isNewClient ? "cursor-pointer" : ""}`}
												onClick={() => isNewClient && setAddressModalOpen(true)}>
												<AddressSelect
													clientId={isNewClient ? null : selectedClient?.id}
													value={field.value}
													onChange={field.onChange}
													disabled={!selectedClient}
													refreshKey={addressRefreshKey}
													isNewClient={isNewClient}
												/>
											</div>
											<button type="button" onClick={() => setAddressModalOpen(true)}
												className={`px-3 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${isNewClient ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : ""}`}
												disabled={!selectedClient}>+
											</button>
										</div>
									</FormControl>
								</FormItem>
							);
						}}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormField control={form.control} name="date" render={({ field }) => {
							const dateValue = field.value ? new Date(field.value) : null;
							const displayValue = dateValue
								? `${String(dateValue.getDate()).padStart(2, "0")}/${String(dateValue.getMonth() + 1).padStart(2, "0")}/${dateValue.getFullYear()}`
								: "";
							const nativeValue = dateValue ? dateValue.toISOString().split("T")[0] : "";
							return (
								<FormItem>
									<FormLabel>Data</FormLabel>
									<FormControl>
										<div className="relative cursor-pointer" onClick={e => {
											const input = e.currentTarget.querySelector('input[type="date"]');
											if (input?.showPicker) input.showPicker();
										}}>
											<Input type="text" readOnly placeholder="dd/mm/aaaa" className="w-full h-11 pointer-events-none" value={displayValue} />
											<input type="date" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" value={nativeValue}
												onChange={e => field.onChange(e.target.value ? new Date(e.target.value + "T00:00:00") : null)} />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}} />

						<FormField control={form.control} name="time" render={({ field }) => {
							const handleTimeChange = (e) => {
								let val = e.target.value.replace(/\D/g, "");
								if (val.length > 4) val = val.slice(0, 4);
								if (val.length >= 3) {
									const hours = val.slice(0, 2);
									const minutes = val.slice(2);
									if (parseInt(hours) > 23) val = "23" + minutes;
									if (minutes && parseInt(minutes) > 59) val = hours + "59";
									val = val.slice(0, 2) + ":" + val.slice(2);
								} else if (val.length > 0) {
									if (parseInt(val) > 23) val = "23";
								}
								field.onChange(val);
							};
							if (!isMobile) {
								return (
									<FormItem>
										<FormLabel>Hora</FormLabel>
										<FormControl>
											<Input type="text" placeholder="08:00" className="w-full h-11 text-center" value={field.value} onChange={handleTimeChange} maxLength={5} />
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}
							return (
								<FormItem>
									<FormLabel>Hora</FormLabel>
									<FormControl>
										<div className="relative cursor-pointer" onClick={e => {
											const input = e.currentTarget.querySelector('input[type="time"]');
											if (input?.showPicker) input.showPicker();
										}}>
											<Input type="text" readOnly className="w-full h-11 pointer-events-none text-center" value={field.value} />
											<input type="time" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" value={field.value} onChange={field.onChange} />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}} />
					</div>

					{/* ── Items ── */}
					<div className="space-y-4">
						<h3 className="font-semibold text-2xl">Itens</h3>
						{fields.map((fieldItem, index) => {
							const addonOptionIds = form.watch(`items.${index}.addonOptionIds`) ?? [];
							const productId = form.watch(`items.${index}.productId`);
							const selectedItem = items.find(i => String(i.id) === String(productId));

							return (
								<div key={fieldItem.id} className="space-y-2 p-4 border rounded-xl bg-gray-50">
									<div className="flex gap-4 items-end">
										<Controller
											control={form.control}
											name={`items.${index}.productId`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormLabel>Item</FormLabel>
													<FormControl>
														<ItemSelect
															items={items}
															value={field.value}
															onChange={(val) => handleItemSelected(index, val)}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
										<FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
											<FormItem className="w-24">
												<FormLabel>Qntd.</FormLabel>
												<FormControl>
													<Input type="number" {...field} className="h-11" min="1" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)} />
									</div>

									{/* Addon summary + edit button */}
									{selectedItem && (
										<div className="flex items-center justify-between">
											<p className="text-xs text-gray-500">
												{addonOptionIds.length > 0
													? `${addonOptionIds.length} opção(ões) selecionada(s)`
													: "Sem opções selecionadas"
												}
											</p>
											<button
												type="button"
												onClick={() => setAddonModal({ index, item: selectedItem })}
												className="text-xs font-semibold px-3 py-1 rounded-lg"
												style={{ background: "#fee2e2", color: "var(--main-red)" }}
											>
												{addonOptionIds.length > 0 ? "Editar opções" : "Selecionar opções"}
											</button>
										</div>
									)}

									<FormField control={form.control} name={`items.${index}.note`} render={({ field }) => (
										<FormItem>
											<FormLabel>Observações</FormLabel>
											<FormControl>
												<textarea {...field} className="w-full border rounded p-2 resize-none h-20 text-sm bg-white" placeholder="Observações do item (opcional)" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)} />

									<div className="flex justify-end mt-1">
										<Button type="button" variant="destructive" size="icon" onClick={() => openDeleteModal(index)}>
											<Trash className="w-5 h-5" />
										</Button>
									</div>
								</div>
							);
						})}

						<Button type="button" variant="secondary" className="w-full"
							onClick={() => append({ productId: "", quantity: 1, note: "", addonOptionIds: [], selections: {} })}>
							Adicionar Item
						</Button>
					</div>

					<Button type="button" className="w-full" onClick={openFinishModal}>
						{isEditMode ? "Atualizar pedido" : "Salvar pedido"}
					</Button>
				</form>
			</Form>
		</div>
	);
}
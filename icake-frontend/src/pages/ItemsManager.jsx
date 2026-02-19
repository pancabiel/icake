import { useEffect, useState } from "react";
import Header from "../components/Header";
import { fetchItems, createItem, updateItem, deleteItem } from "@/api";
import { Pencil, Trash2, Plus, X, Check, LoaderCircle } from "lucide-react";

export default function ItemsManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // null = create mode

    // Confirm delete state
    const [deletingId, setDeletingId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    function loadItems() {
        setLoading(true);
        fetchItems()
            .then(setItems)
            .catch(() => setError("Erro ao carregar itens."))
            .finally(() => setLoading(false));
    }

    useEffect(() => { loadItems(); }, []);

    function openCreate() {
        setEditingItem(null);
        setModalOpen(true);
    }

    function openEdit(item) {
        setEditingItem(item);
        setModalOpen(true);
    }

    async function handleDelete(id) {
        setDeleteLoading(true);
        try {
            await deleteItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch {
            // simple silent fail – could show toast
        } finally {
            setDeletingId(null);
            setDeleteLoading(false);
        }
    }

    function handleSaved(saved) {
        setItems(prev => {
            const exists = prev.find(i => i.id === saved.id);
            if (exists) return prev.map(i => i.id === saved.id ? saved : i);
            return [...prev, saved];
        });
        setModalOpen(false);
    }

    return (
        <div className="min-h-screen" style={{ background: "var(--main-white)" }}>
            <Header />

            <div className="p-4 max-w-xl mx-auto">
                {/* Title row */}
                <div className="flex items-center justify-between mb-4 mt-2">
                    <h2 className="text-2xl font-bold" style={{ color: "var(--main-black)" }}>
                        Cardápio
                    </h2>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white shadow-md active:scale-95 transition-transform"
                        style={{ background: "var(--main-red)" }}
                    >
                        <Plus size={18} />
                        Novo Item
                    </button>
                </div>

                {/* States */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <LoaderCircle size={36} className="animate-spin" style={{ color: "var(--main-red)" }} />
                    </div>
                )}

                {error && (
                    <p className="text-center py-8 text-red-600">{error}</p>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg">Nenhum item cadastrado.</p>
                        <p className="text-sm mt-1">Clique em "Novo Item" para começar.</p>
                    </div>
                )}

                {/* Items list */}
                {!loading && !error && items.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm"
                            >
                                <div>
                                    <p className="font-semibold text-base" style={{ color: "var(--main-black)" }}>
                                        {item.name}
                                    </p>
                                    <p className="text-sm mt-0.5" style={{ color: "var(--main-dark-red)" }}>
                                        {formatPrice(item.price)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                        aria-label="Editar"
                                    >
                                        <Pencil size={18} style={{ color: "var(--main-red)" }} />
                                    </button>
                                    <button
                                        onClick={() => setDeletingId(item.id)}
                                        className="p-2 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
                                        aria-label="Excluir"
                                    >
                                        <Trash2 size={18} style={{ color: "var(--main-red)" }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Item Form Modal */}
            {modalOpen && (
                <ItemFormModal
                    item={editingItem}
                    onClose={() => setModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}

            {/* Delete Confirm Modal */}
            {deletingId !== null && (
                <ConfirmDeleteModal
                    loading={deleteLoading}
                    onCancel={() => setDeletingId(null)}
                    onConfirm={() => handleDelete(deletingId)}
                />
            )}
        </div>
    );
}

/* ── Item Form Modal ── */
function ItemFormModal({ item, onClose, onSaved }) {
    const isEdit = item !== null;
    const [name, setName] = useState(item?.name ?? "");
    const [price, setPrice] = useState(item?.price != null ? String(item.price) : "");
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    function validate() {
        const errs = {};
        if (!name.trim()) errs.name = "Nome é obrigatório.";
        const parsed = parseFloat(price.replace(",", "."));
        if (!price.trim() || isNaN(parsed) || parsed < 0) errs.price = "Preço inválido.";
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        const parsed = parseFloat(price.replace(",", "."));
        setSaving(true);
        try {
            let saved;
            if (isEdit) {
                saved = await updateItem(item.id, { name: name.trim(), price: parsed });
            } else {
                saved = await createItem({ name: name.trim(), price: parsed });
            }
            onSaved(saved);
        } catch {
            setErrors({ submit: "Erro ao salvar. Tente novamente." });
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                {/* Modal header */}
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ background: "var(--main-red)", color: "white" }}
                >
                    <h3 className="text-lg font-bold">{isEdit ? "Editar Item" : "Novo Item"}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                            placeholder="Ex: Bolo de chocolate"
                            className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2"
                            style={{ borderColor: errors.name ? "var(--main-red)" : undefined, "--tw-ring-color": "var(--main-red)" }}
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">Preço (R$)</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={price}
                            onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: undefined })); }}
                            placeholder="Ex: 25,00"
                            className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2"
                            style={{ borderColor: errors.price ? "var(--main-red)" : undefined }}
                        />
                        {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
                    </div>

                    {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-xl border font-semibold text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm text-white transition-colors disabled:opacity-60"
                            style={{ background: "var(--main-red)" }}
                        >
                            {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </ModalOverlay>
    );
}

/* ── Confirm Delete Modal ── */
function ConfirmDeleteModal({ onCancel, onConfirm, loading }) {
    return (
        <ModalOverlay onClose={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 p-6 text-center">
                <Trash2 size={36} className="mx-auto mb-3" style={{ color: "var(--main-red)" }} />
                <h3 className="font-bold text-lg mb-1" style={{ color: "var(--main-black)" }}>
                    Excluir item?
                </h3>
                <p className="text-sm text-gray-500 mb-5">Esta ação não pode ser desfeita.</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-xl border font-semibold text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
                        style={{ background: "var(--main-red)" }}
                    >
                        {loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
                        Excluir
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
}

/* ── Shared overlay backdrop ── */
function ModalOverlay({ children, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            {children}
        </div>
    );
}

/* ── Helpers ── */
function formatPrice(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

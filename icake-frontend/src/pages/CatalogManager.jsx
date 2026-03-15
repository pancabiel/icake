import { useEffect, useState } from "react";
import Header from "../components/Header";
import {
    fetchCatalog,
    createCategory, updateCategory, deleteCategory,
    createItem, updateItem, deleteItem,
    createAddon, updateAddon, deleteAddon,
    createAddonOption, updateAddonOption, deleteAddonOption,
} from "@/api";
import {
    Pencil, Trash2, Plus, X, Check,
    LoaderCircle, ChevronDown, ChevronRight,
    GripVertical, ToggleLeft, ToggleRight,
} from "lucide-react";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CatalogManager() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedIds, setExpandedIds] = useState(new Set());

    // Modals
    const [categoryModal, setCategoryModal] = useState(null); // null | { mode: "create"|"edit", category? }
    const [itemModal, setItemModal] = useState(null);         // null | { mode, item?, categoryId? }
    const [deletingTarget, setDeletingTarget] = useState(null); // null | { type, id, label }

    function load() {
        setLoading(true);
        fetchCatalog()
            .then(data => {
                const cats = data.categories ?? data;
                setCategories(cats.map(cat => ({
                    ...cat,
                    items: (cat.products ?? cat.items ?? []).map(p => ({
                        ...p,
                        price: p.basePrice ?? p.price,
                    })),
                })));
            })
            .catch(() => setError("Erro ao carregar cardápio."))
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    function toggleExpand(id) {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    // ── category saved ──
    function onCategorySaved(saved) {
        setCategories(prev => {
            const exists = prev.find(c => c.id === saved.id);
            if (exists) return prev.map(c => c.id === saved.id ? { ...c, ...saved } : c);
            return [...prev, { ...saved, items: [] }];
        });
        setCategoryModal(null);
    }

    // ── item saved ──
    function onItemSaved(saved, categoryId) {
        setCategories(prev => prev.map(cat => {
            if (cat.id !== categoryId) return cat;
            const items = cat.items ?? [];
            const exists = items.find(i => i.id === saved.id);
            return {
                ...cat,
                items: exists
                    ? items.map(i => i.id === saved.id ? saved : i)
                    : [...items, saved],
            };
        }));
        setItemModal(null);
    }

    // ── delete confirmed ──
    async function handleDeleteConfirmed() {
        const { type, id, categoryId } = deletingTarget;
        try {
            if (type === "category") {
                await deleteCategory(id);
                setCategories(prev => prev.filter(c => c.id !== id));
            } else if (type === "item") {
                await deleteItem(id);
                setCategories(prev => prev.map(cat => ({
                    ...cat,
                    items: (cat.items ?? []).filter(i => i.id !== id),
                })));
            }
        } finally {
            setDeletingTarget(null);
        }
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
                        onClick={() => setCategoryModal({ mode: "create" })}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white shadow-md active:scale-95 transition-transform"
                        style={{ background: "var(--main-red)" }}
                    >
                        <Plus size={18} />
                        Nova Categoria
                    </button>
                </div>

                {/* States */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <LoaderCircle size={36} className="animate-spin" style={{ color: "var(--main-red)" }} />
                    </div>
                )}
                {error && <p className="text-center py-8 text-red-600">{error}</p>}
                {!loading && !error && categories.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg">Nenhuma categoria cadastrada.</p>
                        <p className="text-sm mt-1">Clique em "Nova Categoria" para começar.</p>
                    </div>
                )}

                {/* Categories */}
                {!loading && !error && (
                    <div className="flex flex-col gap-3">
                        {categories.map(cat => {
                            const expanded = expandedIds.has(cat.id);
                            const items = cat.items ?? [];
                            return (
                                <div key={cat.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                    {/* Category row */}
                                    <div className="flex items-center px-4 py-3 gap-3">
                                        <button
                                            onClick={() => toggleExpand(cat.id)}
                                            className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                        >
                                            {expanded
                                                ? <ChevronDown size={18} className="flex-shrink-0 text-gray-400" />
                                                : <ChevronRight size={18} className="flex-shrink-0 text-gray-400" />
                                            }
                                            <span className="text-xl">{cat.emoji}</span>
                                            <span className="font-bold text-base truncate" style={{ color: "var(--main-black)" }}>
                                                {cat.name}
                                            </span>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                {items.length} {items.length === 1 ? "item" : "itens"}
                                            </span>
                                        </button>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => setCategoryModal({ mode: "edit", category: cat })}
                                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                            >
                                                <Pencil size={16} style={{ color: "var(--main-red)" }} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingTarget({ type: "category", id: cat.id, label: cat.name })}
                                                className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16} style={{ color: "var(--main-red)" }} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Items list (expanded) */}
                                    {expanded && (
                                        <div className="border-t border-gray-100 px-4 pb-3 pt-2 flex flex-col gap-2">
                                            {items.length === 0 && (
                                                <p className="text-sm text-gray-400 py-2 text-center">
                                                    Nenhum item nesta categoria.
                                                </p>
                                            )}
                                            {items.map(item => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2"
                                                >
                                                    <span className="text-lg">{item.emoji}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate" style={{ color: "var(--main-black)" }}>
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs" style={{ color: "var(--main-dark-red)" }}>
                                                            {formatPrice(item.price)}
                                                            {item.addons?.length > 0 &&
                                                                <span className="text-gray-400 ml-2">
                                                                    · {item.addons.length} {item.addons.length === 1 ? "opção" : "opções"}
                                                                </span>
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <button
                                                            onClick={() => setItemModal({ mode: "edit", item, categoryId: cat.id })}
                                                            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                                        >
                                                            <Pencil size={15} style={{ color: "var(--main-red)" }} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingTarget({ type: "item", id: item.id, label: item.name, categoryId: cat.id })}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 size={15} style={{ color: "var(--main-red)" }} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Add item button */}
                                            <button
                                                onClick={() => setItemModal({ mode: "create", categoryId: cat.id })}
                                                className="flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors hover:bg-red-50"
                                                style={{ borderColor: "var(--main-red)", color: "var(--main-red)" }}
                                            >
                                                <Plus size={16} />
                                                Novo Item
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Category Modal */}
            {categoryModal && (
                <CategoryFormModal
                    category={categoryModal.category}
                    onClose={() => setCategoryModal(null)}
                    onSaved={onCategorySaved}
                />
            )}

            {/* Item Modal */}
            {itemModal && (
                <ItemFormModal
                    item={itemModal.item}
                    categoryId={itemModal.categoryId}
                    categories={categories}
                    onClose={() => setItemModal(null)}
                    onSaved={onItemSaved}
                />
            )}

            {/* Delete Confirm */}
            {deletingTarget && (
                <ConfirmDeleteModal
                    label={deletingTarget.label}
                    onCancel={() => setDeletingTarget(null)}
                    onConfirm={handleDeleteConfirmed}
                />
            )}
        </div>
    );
}

// ─── Category Form Modal ──────────────────────────────────────────────────────

function CategoryFormModal({ category, onClose, onSaved }) {
    const isEdit = !!category;
    const [name, setName] = useState(category?.name ?? "");
    const [emoji, setEmoji] = useState(category?.emoji ?? "");
    const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) { setErrors({ name: "Nome é obrigatório." }); return; }
        setSaving(true);
        try {
            const payload = { name: name.trim(), emoji: emoji.trim(), sortOrder: Number(sortOrder) };
            const saved = isEdit
                ? await updateCategory(category.id, payload)
                : await createCategory(payload);
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
                <ModalHeader title={isEdit ? "Editar Categoria" : "Nova Categoria"} onClose={onClose} />
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    <div className="flex gap-3">
                        <Field label="Emoji" error={null} style={{ width: 80 }}>
                            <input
                                type="text" value={emoji} maxLength={2}
                                onChange={e => setEmoji(e.target.value)}
                                placeholder="🎂"
                                className="border rounded-xl px-3 py-2 text-center text-xl outline-none focus:ring-2 w-full"
                            />
                        </Field>
                        <Field label="Nome" error={errors.name} className="flex-1">
                            <input
                                type="text" value={name}
                                onChange={e => { setName(e.target.value); setErrors({}); }}
                                placeholder="Ex: Bolos"
                                className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 w-full"
                                style={{ borderColor: errors.name ? "var(--main-red)" : undefined }}
                            />
                        </Field>
                    </div>
                    <Field label="Ordem de exibição" error={null}>
                        <input
                            type="number" value={sortOrder} min={0}
                            onChange={e => setSortOrder(e.target.value)}
                            className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 w-full"
                        />
                    </Field>
                    {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
                    <ModalActions onCancel={onClose} saving={saving} />
                </form>
            </div>
        </ModalOverlay>
    );
}

// ─── Item Form Modal ──────────────────────────────────────────────────────────

function ItemFormModal({ item, categoryId, categories, onClose, onSaved }) {
    const isEdit = !!item;
    const [form, setForm] = useState({
        name: item?.name ?? "",
        description: item?.description ?? "",
        emoji: item?.emoji ?? "",
        price: item?.price != null ? String(item.price) : "",
        unit: item?.unit ?? "unidade",
        minQty: item?.minQty ?? 1,
        active: item?.active ?? true,
        categoryId: item?.categoryId ?? categoryId,
    });
    // Normalize addons from API: ensure options have sizePrices as plain object with string keys
    const [addons, setAddons] = useState(() =>
        (item?.addons ?? []).map(a => ({
            ...a,
            options: (a.options ?? []).map(o => ({
                ...o,
                sizePrices: o.sizePrices ?? {},
            })),
        }))
    );
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = "Nome é obrigatório.";
        const p = parseFloat(String(form.price).replace(",", "."));
        if (!String(form.price).trim() || isNaN(p) || p < 0) errs.price = "Preço inválido.";
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        try {
            const payload = {
                ...form,
                price: parseFloat(String(form.price).replace(",", ".")),
                minQty: Number(form.minQty),
            };
            const saved = isEdit
                ? await updateItem(item.id, payload)
                : await createItem(payload);

            // Sync addons
            const finalItem = await syncAddons(saved.id, addons, item?.addons ?? []);
            onSaved({ ...saved, addons: finalItem }, form.categoryId);
        } catch {
            setErrors({ submit: "Erro ao salvar. Tente novamente." });
        } finally {
            setSaving(false);
        }
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col"
                style={{ maxHeight: "90vh" }}>
                <ModalHeader title={isEdit ? "Editar Item" : "Novo Item"} onClose={onClose} />

                <div className="overflow-y-auto flex-1">
                    <form id="item-form" onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

                        {/* Basic fields */}
                        <div className="flex gap-3">
                            <Field label="Emoji" style={{ width: 80 }}>
                                <input type="text" value={form.emoji} maxLength={2}
                                    onChange={e => set("emoji", e.target.value)}
                                    placeholder="🎂"
                                    className="border rounded-xl px-3 py-2 text-center text-xl outline-none w-full" />
                            </Field>
                            <Field label="Nome" error={errors.name} className="flex-1">
                                <input type="text" value={form.name}
                                    onChange={e => { set("name", e.target.value); setErrors({}); }}
                                    placeholder="Ex: Bolo de Aniversário"
                                    className="border rounded-xl px-3 py-2 text-sm outline-none w-full"
                                    style={{ borderColor: errors.name ? "var(--main-red)" : undefined }} />
                            </Field>
                        </div>

                        <Field label="Descrição">
                            <textarea value={form.description}
                                onChange={e => set("description", e.target.value)}
                                placeholder="Descrição opcional..."
                                rows={2}
                                className="border rounded-xl px-3 py-2 text-sm outline-none w-full resize-none" />
                        </Field>

                        <div className="flex gap-3">
                            <Field label="Preço base (R$)" error={errors.price} className="flex-1">
                                <input type="text" inputMode="decimal" value={form.price}
                                    onChange={e => { set("price", e.target.value); setErrors({}); }}
                                    placeholder="Ex: 120,00"
                                    className="border rounded-xl px-3 py-2 text-sm outline-none w-full"
                                    style={{ borderColor: errors.price ? "var(--main-red)" : undefined }} />
                            </Field>
                            <Field label="Unidade" className="flex-1">
                                <input type="text" value={form.unit}
                                    onChange={e => set("unit", e.target.value)}
                                    placeholder="unidade"
                                    className="border rounded-xl px-3 py-2 text-sm outline-none w-full" />
                            </Field>
                        </div>

                        <div className="flex gap-3 items-end">
                            <Field label="Qtd. mínima" className="w-32">
                                <input type="number" value={form.minQty} min={1}
                                    onChange={e => set("minQty", e.target.value)}
                                    className="border rounded-xl px-3 py-2 text-sm outline-none w-full" />
                            </Field>
                            <Field label="Categoria" className="flex-1">
                                <select value={form.categoryId}
                                    onChange={e => set("categoryId", Number(e.target.value))}
                                    className="border rounded-xl px-3 py-2 text-sm outline-none w-full bg-white">
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                                    ))}
                                </select>
                            </Field>
                            {/* Active toggle */}
                            <button type="button" onClick={() => set("active", !form.active)}
                                className="flex items-center gap-1.5 pb-2 text-sm font-semibold"
                                style={{ color: form.active ? "var(--main-red)" : "#9ca3af" }}>
                                {form.active
                                    ? <ToggleRight size={24} />
                                    : <ToggleLeft size={24} />
                                }
                                {form.active ? "Ativo" : "Inativo"}
                            </button>
                        </div>

                        {/* Addons section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-sm" style={{ color: "var(--main-black)" }}>
                                    Opções / Adicionais
                                </p>
                                <button type="button"
                                    onClick={() => setAddons(prev => [...prev, {
                                        _tempId: String(Date.now()), label: "", type: "SINGLE",
                                        required: false, maxSelections: null, sortOrder: prev.length, options: []
                                    }])}
                                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg"
                                    style={{ background: "var(--main-red)", color: "white" }}>
                                    <Plus size={13} /> Adicionar grupo
                                </button>
                            </div>

                            {addons.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-3">
                                    Nenhum grupo de opções. Clique em "Adicionar grupo".
                                </p>
                            )}

                            <div className="flex flex-col gap-3">
                                {addons.map((addon, addonIdx) => {
                                    const sizeOptions = addons
                                        .filter(a => a.type === "SIZE" && (a.id ?? a._tempId) !== (addon.id ?? addon._tempId))
                                        .flatMap(a => a.options ?? []);
                                    return (
                                        <AddonEditor
                                            key={addon.id ?? addon._tempId}
                                            addon={addon}
                                            sizeOptions={sizeOptions}
                                            onChange={updated => setAddons(prev =>
                                                prev.map((a, i) => i === addonIdx ? updated : a)
                                            )}
                                            onRemove={() => setAddons(prev => prev.filter((_, i) => i !== addonIdx))}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
                    </form>
                </div>

                <div className="p-5 pt-0 border-t border-gray-100">
                    <ModalActions onCancel={onClose} saving={saving} formId="item-form" />
                </div>
            </div>
        </ModalOverlay>
    );
}

// ─── Addon Editor ─────────────────────────────────────────────────────────────

// Returns a stable string key for a size option (real id or temp id)
function sizeOptKey(opt) { return String(opt.id ?? opt._tempId); }

function AddonEditor({ addon, sizeOptions, onChange, onRemove }) {
    function set(key, val) { onChange({ ...addon, [key]: val }); }

    function addOption() {
        onChange({ ...addon, options: [...(addon.options ?? []), { _tempId: String(Date.now()), label: "", priceDelta: 0, sizePrices: {} }] });
    }

    function updateOption(idx, updated) {
        onChange({ ...addon, options: addon.options.map((o, i) => i === idx ? updated : o) });
    }

    function removeOption(idx) {
        onChange({ ...addon, options: addon.options.filter((_, i) => i !== idx) });
    }

    const isSizeAddon = addon.type === "SIZE";
    // Only show per-size price inputs when this is NOT a SIZE addon and there are size options defined
    const showSizePrices = !isSizeAddon && sizeOptions.length > 0;

    return (
        <div className="border rounded-2xl overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
            {/* Addon header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                <input
                    type="text" value={addon.label} placeholder="Nome do grupo (ex: Massa)"
                    onChange={e => set("label", e.target.value)}
                    className="flex-1 bg-transparent text-sm font-semibold outline-none min-w-0"
                    style={{ color: "var(--main-black)" }}
                />
                <select value={addon.type} onChange={e => set("type", e.target.value)}
                    className="text-xs border rounded-lg px-2 py-1 bg-white outline-none flex-shrink-0">
                    <option value="SINGLE">1 opção</option>
                    <option value="MULTI">Múltiplos</option>
                    <option value="SIZE">Tamanho</option>
                </select>
                {addon.type === "MULTI" && (
                    <input type="number" value={addon.maxSelections ?? ""} min={1} placeholder="máx"
                        onChange={e => set("maxSelections", e.target.value ? Number(e.target.value) : null)}
                        className="w-12 text-xs border rounded-lg px-1 py-1 text-center outline-none flex-shrink-0" />
                )}
                <input
                    type="number" value={addon.sortOrder ?? 0} min={0}
                    onChange={e => set("sortOrder", Number(e.target.value))}
                    title="Ordem de exibição"
                    className="w-10 text-xs border rounded-lg px-1 py-1 text-center outline-none flex-shrink-0"
                />
                {!isSizeAddon && (
                    <button type="button" onClick={() => set("required", !addon.required)}
                        className="text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0 transition-colors"
                        style={{
                            background: addon.required ? "var(--main-red)" : "#f3f4f6",
                            color: addon.required ? "white" : "#6b7280"
                        }}>
                        {addon.required ? "Obrig." : "Opcional"}
                    </button>
                )}
                <button type="button" onClick={onRemove}
                    className="p-1 rounded-lg hover:bg-red-50 flex-shrink-0">
                    <X size={14} style={{ color: "var(--main-red)" }} />
                </button>
            </div>

            {/* Options */}
            <div className="px-3 pb-2 pt-2 flex flex-col gap-2">
                {(addon.options ?? []).map((opt, i) => (
                    <div key={opt.id ?? opt._tempId} className="flex flex-col gap-1">
                        {/* Main option row */}
                        <div className="flex items-center gap-2">
                            <input type="text" value={opt.label} placeholder="Nome da opção"
                                onChange={e => updateOption(i, { ...opt, label: e.target.value })}
                                className="flex-1 border rounded-xl px-3 py-1.5 text-sm outline-none min-w-0" />
                            <span className="text-xs text-gray-400 flex-shrink-0">
                                {showSizePrices ? "padrão R$" : "+R$"}
                            </span>
                            <input type="number" value={opt.priceDelta} step="0.01"
                                onChange={e => updateOption(i, { ...opt, priceDelta: parseFloat(e.target.value) || 0 })}
                                className="w-16 border rounded-xl px-2 py-1.5 text-sm outline-none text-center flex-shrink-0" />
                            <button type="button" onClick={() => removeOption(i)}
                                className="p-1 rounded-lg hover:bg-red-50 flex-shrink-0">
                                <X size={13} style={{ color: "var(--main-red)" }} />
                            </button>
                        </div>
                        {/* Per-size price overrides */}
                        {showSizePrices && (
                            <div className="flex flex-col gap-1 pl-3 border-l-2 ml-2" style={{ borderColor: "#e5e7eb" }}>
                                {sizeOptions.map(sizeOpt => {
                                    const key = sizeOptKey(sizeOpt);
                                    const val = opt.sizePrices?.[key] ?? "";
                                    return (
                                        <div key={key} className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 flex-1 min-w-0 truncate text-right">{sizeOpt.label || "Tamanho"}</span>
                                            <span className="text-xs text-gray-400 flex-shrink-0">+R$</span>
                                            <input
                                                type="number" step="0.01"
                                                value={val}
                                                placeholder={String(opt.priceDelta)}
                                                onChange={e => {
                                                    const newSizePrices = { ...(opt.sizePrices ?? {}) };
                                                    if (e.target.value === "") {
                                                        delete newSizePrices[key];
                                                    } else {
                                                        newSizePrices[key] = parseFloat(e.target.value) || 0;
                                                    }
                                                    updateOption(i, { ...opt, sizePrices: newSizePrices });
                                                }}
                                                className="w-16 border rounded-xl px-2 py-1 text-sm outline-none text-center flex-shrink-0"
                                                style={{ borderColor: "#e5e7eb" }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addOption}
                    className="flex items-center gap-1 text-xs font-semibold mt-1 py-1.5 rounded-xl border border-dashed w-full justify-center transition-colors hover:bg-red-50"
                    style={{ borderColor: "var(--main-red)", color: "var(--main-red)" }}>
                    <Plus size={12} /> Adicionar opção
                </button>
            </div>
        </div>
    );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ label, onCancel, onConfirm }) {
    const [loading, setLoading] = useState(false);

    async function handle() {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    }

    return (
        <ModalOverlay onClose={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 p-6 text-center">
                <Trash2 size={36} className="mx-auto mb-3" style={{ color: "var(--main-red)" }} />
                <h3 className="font-bold text-lg mb-1" style={{ color: "var(--main-black)" }}>Excluir?</h3>
                <p className="text-sm text-gray-500 mb-1">
                    Tem certeza que quer excluir <strong>{label}</strong>?
                </p>
                <p className="text-xs text-gray-400 mb-5">Esta ação não pode ser desfeita.</p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-2 rounded-xl border font-semibold text-sm text-gray-600 hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={handle} disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
                        style={{ background: "var(--main-red)" }}>
                        {loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
                        Excluir
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            {children}
        </div>
    );
}

function ModalHeader({ title, onClose }) {
    return (
        <div className="flex items-center justify-between px-5 py-4"
            style={{ background: "var(--main-red)", color: "white" }}>
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                <X size={20} />
            </button>
        </div>
    );
}

function Field({ label, error, children, className, style }) {
    return (
        <div className={`flex flex-col gap-1 ${className ?? ""}`} style={style}>
            <label className="text-sm font-semibold text-gray-700">{label}</label>
            {children}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}

function ModalActions({ onCancel, saving, formId }) {
    return (
        <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel}
                className="flex-1 py-2 rounded-xl border font-semibold text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
            </button>
            <button type="submit" form={formId} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
                style={{ background: "var(--main-red)" }}>
                {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
                Salvar
            </button>
        </div>
    );
}

function formatPrice(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Addon sync helper ────────────────────────────────────────────────────────
// Handles create/update/delete of addons and their options against the API

async function syncAddons(itemId, newAddons, oldAddons) {
    const newIds = new Set(newAddons.filter(a => a.id).map(a => a.id));

    // Delete removed addons
    for (const old of oldAddons) {
        if (!newIds.has(old.id)) await deleteAddon(old.id);
    }

    // Save SIZE addons first so we have real IDs for size options before saving other addons
    const sizeAddons = newAddons.filter(a => a.type === "SIZE");
    const otherAddons = newAddons.filter(a => a.type !== "SIZE");

    // Map from local key (String(id) or _tempId) → saved real id
    const sizeOptionKeyToId = {};

    async function saveAddonAndOptions(addon, buildSizePrices) {
        const payload = {
            itemId,
            label: addon.label,
            type: addon.type,
            required: addon.required ?? false,
            maxSelections: addon.maxSelections ?? null,
            sortOrder: addon.sortOrder ?? 0,
        };
        const savedAddon = addon.id
            ? await updateAddon(addon.id, payload)
            : await createAddon(payload);

        const oldOptions = (oldAddons.find(a => a.id === addon.id)?.options) ?? [];
        const newOptions = addon.options ?? [];
        const newOptIds = new Set(newOptions.filter(o => o.id).map(o => o.id));

        for (const old of oldOptions) {
            if (!newOptIds.has(old.id)) await deleteAddonOption(old.id);
        }

        const savedOptions = [];
        for (const opt of newOptions) {
            const sizePricesPayload = buildSizePrices
                ? Object.entries(opt.sizePrices ?? {})
                    .filter(([, delta]) => delta !== "" && delta !== undefined)
                    .map(([key, delta]) => ({
                        sizeOptionId: sizeOptionKeyToId[key] ?? Number(key),
                        priceDelta: Number(delta),
                    }))
                : undefined;

            const optPayload = {
                addonId: savedAddon.id,
                label: opt.label,
                priceDelta: opt.priceDelta ?? 0,
                ...(sizePricesPayload !== undefined ? { sizePrices: sizePricesPayload } : {}),
            };

            const savedOpt = opt.id
                ? await updateAddonOption(opt.id, optPayload)
                : await createAddonOption(optPayload);

            // Register this size option's key → real id mapping
            if (!buildSizePrices) {
                const localKey = String(opt.id ?? opt._tempId);
                sizeOptionKeyToId[localKey] = savedOpt.id;
            }

            savedOptions.push(savedOpt);
        }

        return { ...savedAddon, options: savedOptions };
    }

    const result = [];
    for (const addon of sizeAddons) {
        result.push(await saveAddonAndOptions(addon, false));
    }
    for (const addon of otherAddons) {
        result.push(await saveAddonAndOptions(addon, true));
    }

    // Restore original order
    return newAddons.map(a =>
        result.find(r => r.id === a.id) ?? result.find(r => r.label === a.label)
    ).filter(Boolean);
}
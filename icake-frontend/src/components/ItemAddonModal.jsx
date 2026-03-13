import { useEffect, useState } from "react";
import { X, Check, LoaderCircle } from "lucide-react";
import { fetchItemAddons } from "@/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcExtraPrice(addons, selections) {
    let extra = 0;
    for (const addon of addons) {
        const sel = selections[addon.id];
        if (!sel) continue;
        const ids = Array.isArray(sel) ? sel : [sel];
        for (const optId of ids) {
            const opt = addon.options.find(o => o.id === optId);
            if (opt) extra += opt.priceDelta;
        }
    }
    return extra;
}

function isValid(addons, selections) {
    return addons
        .filter(a => a.required)
        .every(a => {
            const sel = selections[a.id];
            return sel && (Array.isArray(sel) ? sel.length > 0 : true);
        });
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ItemAddonModal
 *
 * Props:
 *   item         – the full item object { id, name, price, emoji, ... }
 *   initialSelections – existing selections when editing (optional)
 *   onClose      – called when modal is dismissed
 *   onConfirm    – called with { selections, note, addonSelectionIds }
 *                  selections: { [addonId]: optionId | optionId[] }
 *                  addonOptionIds: flat array of selected option IDs
 *                  note: free text observation
 */
export default function ItemAddonModal({ item, initialAddonOptionIds, initialNote, onClose, onConfirm }) {
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selections, setSelections] = useState({});
    const [note, setNote] = useState(initialNote ?? "");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 10);
        fetchItemAddons(item.id)
            .then(fetchedAddons => {
                setAddons(fetchedAddons);
                if (initialAddonOptionIds?.length > 0) {
                    const rebuilt = {};
                    for (const addon of fetchedAddons) {
                        if (addon.type === "SINGLE") {
                            const match = addon.options.find(o => initialAddonOptionIds.includes(o.id));
                            if (match) rebuilt[addon.id] = match.id;
                        } else {
                            const matches = addon.options.filter(o => initialAddonOptionIds.includes(o.id)).map(o => o.id);
                            if (matches.length > 0) rebuilt[addon.id] = matches;
                        }
                    }
                    setSelections(rebuilt);
                }
            })
            .finally(() => setLoading(false));
    }, [item.id]);

    function close() {
        setVisible(false);
        setTimeout(onClose, 280);
    }

    function toggle(addonId, optId, type, max) {
        setSelections(prev => {
            if (type === "SINGLE") return { ...prev, [addonId]: optId };
            const cur = prev[addonId] || [];
            if (cur.includes(optId)) return { ...prev, [addonId]: cur.filter(x => x !== optId) };
            if (max && cur.length >= max) return prev;
            return { ...prev, [addonId]: [...cur, optId] };
        });
    }

    function handleConfirm() {
        // Flatten all selected option IDs into a plain array
        const addonOptionIds = Object.values(selections).flat();
        onConfirm({ selections, addonOptionIds, note });
        close();
    }

    const extraPrice = calcExtraPrice(addons, selections);
    const totalPrice = (item.price + extraPrice) * 1; // qty handled outside
    const canConfirm = !loading && isValid(addons, selections);

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end" }}>
            {/* Backdrop */}
            <div
                onClick={close}
                style={{
                    position: "absolute", inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    opacity: visible ? 1 : 0, transition: "opacity 0.28s",
                }}
            />

            {/* Sheet */}
            <div style={{
                position: "relative", zIndex: 1,
                width: "100%", maxWidth: 540, margin: "0 auto",
                background: "white",
                borderRadius: "20px 20px 0 0",
                maxHeight: "88vh", display: "flex", flexDirection: "column",
                transform: visible ? "translateY(0)" : "translateY(100%)",
                transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
            }}>
                {/* Handle */}
                <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
                    <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e5e7eb" }} />
                </div>

                {/* Header */}
                <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 28 }}>{item.emoji}</span>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: "1rem", color: "#111", margin: 0 }}>{item.name}</p>
                            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0 }}>
                                {formatPrice(item.price)}
                                {extraPrice !== 0 && (
                                    <span style={{ color: "var(--main-red)", marginLeft: 4 }}>
                                        {extraPrice > 0 ? `+${formatPrice(extraPrice)}` : formatPrice(extraPrice)}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button onClick={close} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#6b7280", fontSize: "1rem" }}>✕</button>
                </div>

                {/* Scrollable body */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 16px" }}>
                    {loading && (
                        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                            <LoaderCircle size={28} className="animate-spin" style={{ color: "var(--main-red)" }} />
                        </div>
                    )}

                    {!loading && addons.length === 0 && (
                        <p style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0", fontSize: "0.9rem" }}>
                            Este item não possui opções configuradas.
                        </p>
                    )}

                    {!loading && addons.map(addon => (
                        <div key={addon.id} style={{ marginBottom: 20 }}>
                            {/* Addon header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111", margin: 0 }}>
                                    {addon.label}
                                    {addon.required && <span style={{ color: "var(--main-red)", marginLeft: 3 }}>*</span>}
                                </p>
                                <span style={{
                                    fontSize: "0.7rem", padding: "2px 8px", borderRadius: 99,
                                    background: addon.required ? "#fee2e2" : "#f3f4f6",
                                    color: addon.required ? "var(--main-red)" : "#6b7280",
                                }}>
                                    {addon.type === "MULTI"
                                        ? (addon.maxSelections ? `até ${addon.maxSelections}` : "múltiplos")
                                        : "escolha 1"
                                    }
                                    {addon.required ? " · obrigatório" : " · opcional"}
                                </span>
                            </div>

                            {/* Options */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {addon.options.filter(o => o.active).map(opt => {
                                    const sel = selections[addon.id];
                                    const active = addon.type === "SINGLE"
                                        ? sel === opt.id
                                        : (sel || []).includes(opt.id);

                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => toggle(addon.id, opt.id, addon.type, addon.maxSelections)}
                                            style={{
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                                padding: "10px 12px", borderRadius: 10, textAlign: "left",
                                                background: active ? "#fee2e2" : "#f9fafb",
                                                border: `1.5px solid ${active ? "var(--main-red)" : "#e5e7eb"}`,
                                                cursor: "pointer", transition: "all 0.12s",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 18, height: 18,
                                                    borderRadius: addon.type === "SINGLE" ? "50%" : 4,
                                                    border: `2px solid ${active ? "var(--main-red)" : "#d1d5db"}`,
                                                    background: active ? "var(--main-red)" : "transparent",
                                                    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                                                }}>
                                                    {active && <Check size={11} color="white" strokeWidth={3} />}
                                                </div>
                                                <span style={{ fontSize: "0.88rem", color: "#111" }}>{opt.label}</span>
                                            </div>
                                            {opt.priceDelta !== 0 && (
                                                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: opt.priceDelta > 0 ? "#374151" : "var(--main-red)", flexShrink: 0, marginLeft: 8 }}>
                                                    {opt.priceDelta > 0 ? `+${formatPrice(opt.priceDelta)}` : `-${formatPrice(Math.abs(opt.priceDelta))}`}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Note field */}
                    {!loading && (
                        <div style={{ marginTop: 4 }}>
                            <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111", marginBottom: 8 }}>
                                Observações <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: "0.8rem" }}>(opcional)</span>
                            </p>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Ex: menos açúcar, entrega antes das 18h..."
                                rows={3}
                                style={{
                                    width: "100%", padding: "10px 12px", borderRadius: 10,
                                    border: "1.5px solid #e5e7eb", background: "#f9fafb",
                                    fontSize: "0.88rem", color: "#111",
                                    resize: "vertical", outline: "none", boxSizing: "border-box",
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Confirm button */}
                <div style={{ padding: "12px 20px", borderTop: "1px solid #f3f4f6" }}>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        style={{
                            width: "100%", padding: "13px", borderRadius: 99,
                            border: "none",
                            background: canConfirm ? "var(--main-red)" : "#e5e7eb",
                            color: canConfirm ? "white" : "#9ca3af",
                            fontWeight: 700, fontSize: "0.95rem",
                            cursor: canConfirm ? "pointer" : "not-allowed",
                            transition: "all 0.15s",
                        }}
                    >
                        {addons.length === 0 && !loading
                            ? "Confirmar"
                            : `Confirmar · ${formatPrice(totalPrice)}`
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
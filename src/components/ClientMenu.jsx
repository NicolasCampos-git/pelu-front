import { useCallback, useEffect, useRef, useState } from "react";
import ButtonClientsList from "./ButtonClientsList";
import editClientImg from "../../assets/img/editClient.png";
import deleteClientImg from "../../assets/img/deleteClient.png";

function ClientMenu({ client, onEdit, onDelete }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) close();
        };
        document.addEventListener("pointerdown", handleClickOutside);
        return () =>
            document.removeEventListener("pointerdown", handleClickOutside);
    }, [open, close]);

    return (
        <div ref={menuRef} className="relative">
            <ButtonClientsList
                text="Acciones"
                functionOnClick={() => setOpen((v) => !v)}
                imgSource={null}
                className="btn-edit"
                icon={
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="opacity-90 transition-opacity hover:opacity-100"
                    >
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                }
            />

            {open && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[150px] overflow-hidden rounded-lg border border-divider bg-surface shadow-card">
                    <button
                        onClick={() => {
                            onEdit(client);
                            close();
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3 py-2.5 text-left text-sm text-content-primary transition-colors hover:bg-accent/15"
                    >
                        <img
                            src={editClientImg}
                            alt=""
                            className="h-4 w-4 opacity-80"
                        />
                        Editar
                    </button>
                    <button
                        onClick={() => {
                            onDelete(client);
                            close();
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/15"
                    >
                        <img
                            src={deleteClientImg}
                            alt=""
                            className="h-4 w-4 opacity-80"
                        />
                        Eliminar
                    </button>
                </div>
            )}
        </div>
    );
}

export default ClientMenu;

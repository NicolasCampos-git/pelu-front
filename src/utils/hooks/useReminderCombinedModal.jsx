import ThemedSwal from "../swalTheme";
import { ReminderCombinedPrompt } from "../NotificationWindows/ReminderCombinedPrompt.jsx";
import { createRoot } from "react-dom/client";
import { createRef } from "react";

/**
 * Hook para mostrar modal de edición de antelación de recordatorio
 * @returns {function} - Función que abre el modal: async (currentHours) => ({ hours } | null)
 */
export function useReminderCombinedModal() {
    return async (currentHours) => {
        return new Promise((resolve) => {
            const componentRef = createRef();
            let root = null;

            ThemedSwal.fire({
                title: "Configurar Recordatorio",
                html: '<div id="reminder-combined-container"></div>',
                confirmButtonText: "Guardar",
                cancelButtonText: "Cancelar",
                showCancelButton: true,
                reverseButtons: true,
                focusConfirm: false,
                width: 500,
                didOpen: async () => {
                    const container = document.getElementById("reminder-combined-container");

                    root = createRoot(container);
                    root.render(
                        <ReminderCombinedPrompt
                            ref={componentRef}
                            currentHours={currentHours}
                        />
                    );
                },
                preConfirm: () => {
                    if (!componentRef.current) {
                        return false;
                    }
                    const result = componentRef.current.validate();
                    if (!result) {
                        return false;
                    }
                    return result;
                },
                willClose: () => {
                    if (root) {
                        root.unmount();
                    }
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    resolve(result.value);
                } else {
                    resolve(null);
                }
            });
        });
    };
}

export default useReminderCombinedModal;

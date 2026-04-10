import ThemedSwal from "../swalTheme";
import { z } from "zod";

// Validación básica de teléfono (la validación estricta la hace el backend)
const isValidPhone = (phone) => {
    const cleanPhone = phone.replace(/^\+/, "");
    return /^\d{8,15}$/.test(cleanPhone);
};

// Schema de validación con Zod (basado en el DTO del backend)
const clientSchema = z.object({
    nombre_completo: z
        .string()
        .min(1, { message: "El nombre del cliente no puede estar vacío" })
        .min(2, {
            message:
                "El nombre del cliente debe contener al menos 2 caracteres",
        })
        .max(32, {
            message: "El nombre del cliente no debe exceder los 32 caracteres",
        })
        .transform((val) => val.trim()),
    telefono: z
        .string()
        .min(1, { message: "El teléfono del cliente no puede estar vacío" })
        .min(2, {
            message:
                "El teléfono del cliente debe contener al menos 2 caracteres",
        })
        .max(16, {
            message:
                "El teléfono del cliente no debe exceder los 16 caracteres",
        })
        .regex(/^\+?\d+$/, {
            message: "El teléfono solo puede contener números",
        })
        .transform((val) => {
            // Asegurar que siempre empiece con +
            const cleaned = val.replace(/\+/g, "");
            return `+${cleaned}`;
        })
        .refine(isValidPhone, {
            message: "El número de teléfono no es válido",
        }),
    fecha_nacimiento: z
        .string()
        .optional()
        .transform((val) => val || null),
});

const buildHtml = (name = "", phone = "", fechaNacimiento = "") => {
    // Remover el + del phone si existe para mostrarlo solo en el prefijo
    const phoneNumber = phone.startsWith("+") ? phone.slice(1) : phone;
    return `
  <div class="client-form-container">
    <div class="client-form-field">
      <label for="client-name" class="client-form-label">Nombre y apellido</label>
      <input
        type="text"
        id="client-name"
        class="swal2-input client-form-input"
        placeholder="Ej: Juan Pérez"
        value="${name.replace(/"/g, "&quot;")}">
    </div>
    <div class="client-form-field">
      <label for="client-phone" class="client-form-label">Teléfono</label>
      <input
        type="tel"
        id="client-phone"
        class="swal2-input client-form-input client-form-phone"
        placeholder="Ej: 5491112345678"
        value="${phoneNumber.replace(/"/g, "&quot;")}">
    </div>
    <div class="client-form-field">
      <label for="client-birthday" class="client-form-label">Fecha de nacimiento <span class="client-form-optional">(opcional)</span></label>
      <input
        type="date"
        id="client-birthday"
        class="swal2-input client-form-input"
        value="${fechaNacimiento.replace(/"/g, "&quot;")}">
    </div>
  </div>
`;
};

const handlePhoneInput = (phoneInput) => {
    // Evitar que se borre el + y solo permitir números
    phoneInput.addEventListener("input", (e) => {
        let value = e.target.value;
        // Remover cualquier carácter que no sea número
        value = value.replace(/[^\d]/g, "");
        e.target.value = value;
    });

    // Prevenir que se pegue contenido inválido
    phoneInput.addEventListener("paste", (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData(
            "text"
        );
        const cleaned = pastedText.replace(/[^\d]/g, "");
        phoneInput.value = cleaned;
    });
};

/**
 * Muestra un formulario para agregar un nuevo cliente
 * @returns {Promise<Object|null>} - Datos del cliente (nombre_completo, telefono) o null si se cancela
 */
export async function promptAddClient() {
    let nameInput, phoneInput, birthdayInput;
    const result = await ThemedSwal.fire({
        title: "Agregar Cliente",
        html: buildHtml(),
        confirmButtonText: "Agregar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        reverseButtons: true,
        focusConfirm: false,
        didOpen: () => {
            const popup = ThemedSwal.getPopup();
            nameInput = popup.querySelector("#client-name");
            phoneInput = popup.querySelector("#client-phone");
            birthdayInput = popup.querySelector("#client-birthday");

            handlePhoneInput(phoneInput);

            nameInput.onkeyup = (e) =>
                e.key === "Enter" && ThemedSwal.clickConfirm();
            phoneInput.onkeyup = (e) =>
                e.key === "Enter" && ThemedSwal.clickConfirm();
        },
        preConfirm: () => {
            const nombre_completo = nameInput.value.trim();
            const telefono = phoneInput.value.trim();
            const fecha_nacimiento = birthdayInput.value.trim();

            const validation = clientSchema.safeParse({
                nombre_completo,
                telefono,
                fecha_nacimiento,
            });

            if (!validation.success) {
                const errors = validation.error.flatten().fieldErrors;
                const firstError =
                    errors.nombre_completo?.[0] ||
                    errors.telefono?.[0] ||
                    "Error de validación";
                ThemedSwal.showValidationMessage(firstError);
                return false;
            }

            return validation.data;
        },
    });
    if (result.isConfirmed) return result.value;
    return null;
}

/**
 * Muestra un formulario para editar un cliente existente
 * @param {Object} initial - Datos iniciales del cliente
 * @param {string} initial.title - Nombre completo del cliente
 * @param {string} initial.phoneNumber - Número de teléfono del cliente
 * @returns {Promise<Object|null>} - Datos actualizados del cliente o null si se cancela/no hay cambios
 */
export async function promptEditClient(initial) {
    let nameInput, phoneInput, birthdayInput;
    const initialPhone = initial?.phoneNumber || "";
    const initialBirthday = initial?.fechaNacimiento || "";
    const result = await ThemedSwal.fire({
        title: "Editar Cliente",
        html: buildHtml(initial?.title || "", initialPhone, initialBirthday),
        confirmButtonText: "Actualizar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        reverseButtons: true,
        focusConfirm: true,
        didOpen: () => {
            const popup = ThemedSwal.getPopup();
            nameInput = popup.querySelector("#client-name");
            phoneInput = popup.querySelector("#client-phone");
            birthdayInput = popup.querySelector("#client-birthday");

            handlePhoneInput(phoneInput);

            nameInput.onkeyup = (e) =>
                e.key === "Enter" && ThemedSwal.clickConfirm();
            phoneInput.onkeyup = (e) =>
                e.key === "Enter" && ThemedSwal.clickConfirm();
        },
        preConfirm: () => {
            const nombre_completo = nameInput.value.trim();
            const telefono = phoneInput.value.trim();
            const fecha_nacimiento = birthdayInput.value.trim();

            const validation = clientSchema.safeParse({
                nombre_completo,
                telefono,
                fecha_nacimiento,
            });

            if (!validation.success) {
                const errors = validation.error.flatten().fieldErrors;
                const firstError =
                    errors.nombre_completo?.[0] ||
                    errors.telefono?.[0] ||
                    "Error de validación";
                ThemedSwal.showValidationMessage(firstError);
                return false;
            }

            // Solo enviar los campos que cambiaron
            const normalizedInitialPhone = initialPhone.startsWith("+")
                ? initialPhone
                : `+${initialPhone}`;
            const changes = {};

            if (validation.data.nombre_completo !== (initial?.title || "")) {
                changes.nombre_completo = validation.data.nombre_completo;
            }
            if (validation.data.telefono !== normalizedInitialPhone) {
                changes.telefono = validation.data.telefono;
            }
            if ((validation.data.fecha_nacimiento || "") !== initialBirthday) {
                changes.fecha_nacimiento =
                    validation.data.fecha_nacimiento || null;
            }

            if (Object.keys(changes).length === 0) {
                ThemedSwal.showValidationMessage("No hay cambios para guardar");
                return false;
            }

            return changes;
        },
    });
    if (result.isConfirmed) return result.value;
    return null;
}

export default { promptAddClient, promptEditClient };

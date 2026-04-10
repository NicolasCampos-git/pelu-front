import { useState, useImperativeHandle, forwardRef } from 'react';
import { ReminderAntelacionPrompt } from './ReminderAntelacionPrompt.jsx';

/**
 * Componente para editar la antelación de recordatorio
 * @param {number} currentHours - Horas de antelación actuales
 * @param {function} onCancel - Callback al cancelar: () => void
 */
export const ReminderCombinedPrompt = forwardRef(function ReminderCombinedPrompt(
    { currentHours },
    ref
) {
    const [hours, setHours] = useState(currentHours);
    const [errors, setErrors] = useState([]);

    useImperativeHandle(ref, () => ({
        validate: () => {
            const newErrors = [];

            const hoursChanged = hours !== currentHours;

            if (!hoursChanged) {
                newErrors.push("No hay cambios para guardar");
            }

            if (newErrors.length > 0) {
                setErrors(newErrors);
                return null;
            }

            setErrors([]);
            return { hours };
        }
    }));

    return (
        <div className="reminder-combined-container">
            <div className="reminder-section">
                <ReminderAntelacionPrompt
                    currentHours={currentHours}
                    onSave={setHours}
                />
            </div>

            {errors.length > 0 && (
                <div className="reminder-errors">
                    {errors.map((error, index) => (
                        <div key={index} className="error-message">
                            {error}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default ReminderCombinedPrompt;

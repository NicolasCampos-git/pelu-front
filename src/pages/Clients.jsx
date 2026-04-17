import { useEffect, useState } from "react";
import clientsService from "../services/clients";
import ButtonClientsList from "../components/ButtonClientsList";
import ClientList from "../components/ClientList";
import Calendar from "../components/FullCalendar";
import DeleteZone from "../components/DeleteZone";
import { createDynamicMessage } from "../utils/toastify/toastMessages";
import { promiseToast, showToast } from "../utils/toastify/toastConfig";
import { useAuth } from "../auth/AuthContext";
import {
    promptAddClient,
    promptEditClient,
} from "../utils/NotificationWindows/ClientFormPrompt";
import { useReminderCombinedModal } from "../utils/hooks/useReminderCombinedModal.jsx";
import windowDelete from "../utils/NotificationWindows/ConfirmDelete";
import windowLogOut from "../utils/NotificationWindows/ConfirmLogOut";
import remindersService from "../services/reminders";
import addClientImg from "../../assets/img/addClient.png";
import logoutImg from "../../assets/img/logout.png";

const LoadingSkeleton = () => (
    <div className="flex animate-pulse flex-col gap-3 py-2">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-1">
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-base" />
                    <div className="h-3 w-1/2 rounded bg-base" />
                </div>
                <div className="flex gap-1">
                    <div className="h-8 w-8 rounded-full bg-base" />
                    <div className="h-8 w-8 rounded-full bg-base" />
                </div>
            </div>
        ))}
    </div>
);

const Clients = () => {
    const { logout, user } = useAuth();
    const [client, setClient] = useState([]);
    const [filter, setFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [isDraggingEvent, setIsDraggingEvent] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dataLoaded, setDataLoaded] = useState({
        clients: false,
        shifts: false,
    });
    const openReminderModal = useReminderCombinedModal();

    useEffect(() => {
        const fetchClients = async () => {
            setIsLoadingData(true);
            try {
                const clientsData = await clientsService.getClients();
                const formattedClients = clientsData.listado_clientes.map(
                    (c) => ({
                        id: c.id,
                        title: c.nombre_completo,
                        phoneNumber: c.telefono,
                        fechaNacimiento: c.fecha_nacimiento ?? "",
                        editable: true,
                        esta_eliminado: c.esta_eliminado,
                    })
                );
                setClient(formattedClients);
                setIsLoadingData(false);
                setDataLoaded((prev) => ({ ...prev, clients: true }));
            } catch (error) {
                console.error("Error fetching clients:", error);
                setIsLoadingData(false);
            }
        };
        fetchClients();
    }, []);

    useEffect(() => {
        if (dataLoaded.clients && dataLoaded.shifts) {
            const timer = setTimeout(() => {
                const userName = user?.email?.split("@")[0] || "usuario";
                showToast(
                    "success",
                    `Bienvenido, ${userName}! Datos cargados correctamente`,
                    {
                        autoClose: 3000,
                        toastId: "welcome-message",
                    }
                );
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [dataLoaded, user]);

    const handleAddClient = async () => {
        const values = await promptAddClient();
        if (!values) return;
        try {
            const created = await promiseToast(
                clientsService.createClient(values),
                createDynamicMessage.clientAdd(values.nombre_completo)
            );
            setClient((prev) => [
                ...prev,
                {
                    id: created.data.id,
                    title: created.data.nombre_completo,
                    phoneNumber: created.data.telefono,
                    fechaNacimiento: created.data.fecha_nacimiento ?? "",
                    editable: true,
                    esta_eliminado: created.data.esta_eliminado,
                },
            ]);
        } catch (error) {
            console.error("Error al crear cliente:", error);
        }
    };

    const handleEditClientForm = async (clientData) => {
        const values = await promptEditClient(clientData);
        if (!values) return;
        try {
            const updated = await promiseToast(
                clientsService.updateClient(clientData.id, values),
                createDynamicMessage.clientEdit(clientData.title)
            );
            const updatedClients = client.map((c) =>
                c.id === clientData.id
                    ? {
                          ...c,
                          title: updated.data.nombre_completo,
                          phoneNumber: updated.data.telefono,
                          fechaNacimiento: updated.data.fecha_nacimiento ?? "",
                      }
                    : c
            );
            setClient(updatedClients);
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
        }
    };

    const handleDeleteClient = async (clientData) => {
        const confirmDelete = await windowDelete(clientData.title);
        if (!confirmDelete) return;

        try {
            await promiseToast(
                clientsService.deleteClient(clientData.id),
                createDynamicMessage.clientDeleted(clientData.title)
            );
            const updatedClients = client.filter((c) => c.id !== clientData.id);
            setClient(updatedClients);
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
        }
    };

    const handleReminderSettings = async () => {
        try {
            const antelacionResponse = await remindersService.getAntelacion();
            const currentHours = antelacionResponse.data?.horas_antelacion ?? antelacionResponse.horas_antelacion ?? 1;

            const result = await openReminderModal(currentHours);
            if (!result) return;

            await remindersService.updateAntelacion(result.hours);
            showToast("success", "Recordatorio actualizado correctamente");
        } catch (error) {
            console.error("Error con configuración de recordatorio:", error);
            showToast("error", "Error al actualizar configuración de recordatorio");
        }
    };

    const handleLogOut = async () => {
        const confirmLogout = await windowLogOut({
            title: "¿Estas seguro de que deseas cerrar sesion?",
        });
        if (!confirmLogout) return;
        logout();
    };

    const activeClients = client.filter((c) => c.esta_eliminado === false);

    const filteredClients = activeClients
        .filter((c) =>
            c.title.toLowerCase().includes(filter.toLowerCase())
        )
        .slice()
        .sort((a, b) => {
            const cmp = a.title.localeCompare(b.title, "es", {
                sensitivity: "base",
                ignorePunctuation: true,
            });
            return sortOrder === "asc" ? cmp : -cmp;
        });

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    const handleSearch = (e) => {
        setFilter(e.target.value);
    };

    return (
        <div className="flex h-screen gap-4 p-3 max-xl:gap-3 max-xl:p-2.5 max-lg:gap-2.5 max-lg:p-2 max-md:gap-2 max-md:p-1.5 max-sm:gap-1.5 max-sm:p-1">
            {/* Panel lateral de clientes */}
            <div
                className="relative flex min-h-0 shrink-0 flex-col overflow-hidden rounded-lg border border-divider bg-surface text-content-primary shadow-strong transition-[width] duration-300 ease-in-out"
                style={{ width: sidebarOpen ? 300 : 44 }}
            >
                {isDraggingEvent && sidebarOpen ? (
                    <DeleteZone isVisible={isDraggingEvent} />
                ) : (
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        {/* Botón hamburguesa (siempre visible) */}
                        <div className="flex shrink-0 items-center justify-center p-1">
                            <button
                                onClick={() => setSidebarOpen((v) => !v)}
                                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-content-primary transition-all duration-200 hover:bg-accent/20 active:scale-95"
                                aria-label={sidebarOpen ? "Ocultar clientes" : "Mostrar clientes"}
                                title={sidebarOpen ? "Ocultar clientes" : "Mostrar clientes"}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-transform duration-300"
                                    style={{ transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)" }}
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido colapsable */}
                        <div
                            className="flex min-h-0 flex-1 flex-col px-3 pb-3 transition-opacity duration-200 max-md:px-2 max-md:pb-2 max-sm:px-1.5 max-sm:pb-1.5"
                            style={{
                                opacity: sidebarOpen ? 1 : 0,
                                pointerEvents: sidebarOpen ? "auto" : "none",
                            }}
                        >
                            {/* Header: Add + Reminder + Logout */}
                            <div className="sticky top-0 z-2 flex items-center justify-between gap-2 border-b border-divider bg-surface pb-2">
                                <div className="flex items-center gap-1">
                                    <ButtonClientsList
                                        text={"Agregar Cliente"}
                                        imgSource={addClientImg}
                                        functionOnClick={handleAddClient}
                                        className="btn-add"
                                    />
                                    <button
                                        onClick={handleReminderSettings}
                                        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-all duration-200 hover:bg-accent/20 active:scale-95 max-lg:h-10 max-lg:w-10 max-md:h-9 max-md:w-9 max-sm:h-8 max-sm:w-8"
                                        aria-label="Configurar Recordatorio"
                                        title="Configurar Recordatorio"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-6 w-6 text-content-primary opacity-90 transition-opacity hover:opacity-100 max-md:h-5 max-md:w-5 max-sm:h-[18px] max-sm:w-[18px]"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                        </svg>
                                    </button>
                                </div>
                                <ButtonClientsList
                                    text={"Cerrar Sesion"}
                                    imgSource={logoutImg}
                                    functionOnClick={handleLogOut}
                                    className="btn-logout"
                                />
                            </div>

                            {/* Titulo + contador */}
                            <div className="my-2 flex items-center justify-center gap-2">
                                <h2 className="text-center font-title font-bold text-content-primary max-lg:text-lg max-md:text-base max-sm:text-sm">
                                    Clientes
                                </h2>
                                {!isLoadingData && (
                                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                                        {activeClients.length}
                                    </span>
                                )}
                            </div>

                            {/* Busqueda + Sort */}
                            <div className="mb-3 flex w-full min-w-0 gap-2 max-sm:mb-2 max-sm:gap-1">
                                <input
                                    type="text"
                                    value={filter}
                                    placeholder="Buscar cliente..."
                                    onChange={handleSearch}
                                    className="min-w-0 flex-1 rounded-md border border-divider bg-base px-2.5 py-2 text-sm text-content-primary placeholder-content-secondary transition-colors focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/18 max-lg:px-2 max-lg:py-1.5 max-lg:text-[13px] max-md:text-xs max-sm:p-1 max-sm:text-[11px]"
                                />
                                <button
                                    type="button"
                                    onClick={toggleSortOrder}
                                    className="flex min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-divider bg-base px-2 py-2 text-base text-content-primary transition-colors hover:border-accent/30 hover:bg-accent/10 max-lg:min-w-8 max-lg:text-sm max-sm:min-w-6 max-sm:p-1 max-sm:text-[13px]"
                                    title={sortOrder === "asc" ? "A-Z (ascendente)" : "Z-A (descendente)"}
                                >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                </button>
                            </div>

                            {/* Lista de clientes o skeleton */}
                            {isLoadingData ? (
                                <LoadingSkeleton />
                            ) : (
                                <ClientList
                                    client={filteredClients}
                                    handleEditClientForm={handleEditClientForm}
                                    handleDeleteClient={handleDeleteClient}
                                    onAddClient={handleAddClient}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Calendario */}
            <div className="min-w-0 flex-1">
                <Calendar
                    clientList={client}
                    setIsDraggingEvent={setIsDraggingEvent}
                    sidebarOpen={sidebarOpen}
                    onShiftsLoaded={() =>
                        setDataLoaded((prev) => ({ ...prev, shifts: true }))
                    }
                />
            </div>
        </div>
    );
};

export default Clients;

import axios from "../utils/axiosConfig";

const getAntelacion = async () => {
    const response = await axios.get("/api/recordatorio/antelacion");
    return response.data;
};

const updateAntelacion = async (antelacion) => {
    const response = await axios.put("/api/recordatorio/antelacion", {
        horas_antelacion: antelacion,
    });
    return response.data;
};

export default {
    getAntelacion,
    updateAntelacion,
};

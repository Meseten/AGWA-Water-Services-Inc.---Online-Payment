const naicDistricts = {
    "Poblacion (Town Center)": ["Poblacion", "Ibayo Silangan", "Ibayo Estacion", "Zamora", "Gomez", "Mabini", "Burgos"],
    "Coastal District": ["Bagong Kalsada", "Munting Mapino", "Bucana Sasahan", "Bucana Malaki", "Labac", "Timalan Concepcion", "Timalan Balsahan"],
    "Western District": ["Balayungan", "Balsahan", "Calubcob", "Halang", "Kanluran", "Sabang", "San Roque"],
    "Eastern District": ["Bancaan", "Malainen Bago", "Malainen Luma", "Sapa", "Palangue Central", "Palangue 2 & 3"],
    "Upland District": ["Bulacan", "Makina", "Muzon", "Latoria", "Humbac", "Santulan", "Tres Cruses"]
};

export const getDistricts = () => Object.keys(naicDistricts);

export const getBarangaysInDistrict = (district) => naicDistricts[district] || [];
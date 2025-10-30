const { Ubicacion } = require('../Models/Index');

async function seedUbicaciones() {
    const ubicaciones = [
        // Buenos Aires
        { localidad: 'San Pedro', provincia: 'Buenos Aires' },
        { localidad: 'Ramallo', provincia: 'Buenos Aires' },
        { localidad: 'Baradero', provincia: 'Buenos Aires' },
        { localidad: 'San Nicolás', provincia: 'Buenos Aires' },
        { localidad: 'Pergamino', provincia: 'Buenos Aires' },
        { localidad: 'La Plata', provincia: 'Buenos Aires' },
        { localidad: 'Mar del Plata', provincia: 'Buenos Aires' },
        { localidad: 'Bahía Blanca', provincia: 'Buenos Aires' },
        { localidad: 'Tandil', provincia: 'Buenos Aires' },
        { localidad: 'Zárate', provincia: 'Buenos Aires' },
        { localidad: 'Campana', provincia: 'Buenos Aires' },
        { localidad: 'Pilar', provincia: 'Buenos Aires' },
        { localidad: 'Escobar', provincia: 'Buenos Aires' },
        { localidad: 'Tigre', provincia: 'Buenos Aires' },
        { localidad: 'San Isidro', provincia: 'Buenos Aires' },

        // CABA
        { localidad: 'Ciudad Autónoma de Buenos Aires', provincia: 'CABA' },

        // Córdoba
        { localidad: 'Córdoba', provincia: 'Córdoba' },
        { localidad: 'Villa Carlos Paz', provincia: 'Córdoba' },
        { localidad: 'Río Cuarto', provincia: 'Córdoba' },
        { localidad: 'Villa María', provincia: 'Córdoba' },

        // Santa Fe
        { localidad: 'Rosario', provincia: 'Santa Fe' },
        { localidad: 'Santa Fe', provincia: 'Santa Fe' },
        { localidad: 'Rafaela', provincia: 'Santa Fe' },
        { localidad: 'Venado Tuerto', provincia: 'Santa Fe' },

        // Mendoza
        { localidad: 'Mendoza', provincia: 'Mendoza' },
        { localidad: 'San Rafael', provincia: 'Mendoza' },
        { localidad: 'Godoy Cruz', provincia: 'Mendoza' },

        // Tucumán
        { localidad: 'San Miguel de Tucumán', provincia: 'Tucumán' },
        { localidad: 'Yerba Buena', provincia: 'Tucumán' },

        // Salta
        { localidad: 'Salta', provincia: 'Salta' },

        // Entre Ríos
        { localidad: 'Paraná', provincia: 'Entre Ríos' },
        { localidad: 'Concordia', provincia: 'Entre Ríos' },

        // Neuquén
        { localidad: 'Neuquén', provincia: 'Neuquén' },

        // Chaco
        { localidad: 'Resistencia', provincia: 'Chaco' },

        // Misiones
        { localidad: 'Posadas', provincia: 'Misiones' }
    ];

    for (const ubicacion of ubicaciones) {
        await Ubicacion.findOrCreate({
            where: {
                localidad: ubicacion.localidad,
                provincia: ubicacion.provincia
            },
            defaults: ubicacion
        });
    }
    console.log(`${ubicaciones.length} ubicaciones insertadas`);
}

module.exports = seedUbicaciones;
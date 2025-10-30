const { Categoria } = require('../Models/Index');

async function seedCategorias() {
    const categorias = [
        {
            nombre: 'Plomería',
            descripcion: 'Instalación y reparación de sistemas de agua y desagües'
        },
        {
            nombre: 'Electricidad',
            descripcion: 'Instalación y reparación de sistemas eléctricos'
        },
        {
            nombre: 'Albañilería',
            descripcion: 'Construcción y reparación de estructuras de obra'
        },
        {
            nombre: 'Pintura',
            descripcion: 'Pintura de interiores y exteriores'
        },
        {
            nombre: 'Carpintería',
            descripcion: 'Fabricación y reparación de muebles y estructuras de madera'
        },
        {
            nombre: 'Jardinería',
            descripcion: 'Mantenimiento de jardines y espacios verdes'
        },
        {
            nombre: 'Limpieza',
            descripcion: 'Servicios de limpieza doméstica y comercial'
        },
        {
            nombre: 'Aire Acondicionado',
            descripcion: 'Instalación y mantenimiento de sistemas de climatización'
        },
        {
            nombre: 'Cerrajería',
            descripcion: 'Servicios de cerrajería y seguridad'
        },
        {
            nombre: 'Gasista',
            descripcion: 'Instalación y reparación de sistemas de gas'
        },
        {
            nombre: 'Techista',
            descripcion: 'Reparación e instalación de techos'
        },
        {
            nombre: 'Herrería',
            descripcion: 'Trabajos en hierro y metal'
        },
        {
            nombre: 'Mudanzas',
            descripcion: 'Servicios de mudanza y transporte'
        },
        {
            nombre: 'Fumigación',
            descripcion: 'Control de plagas y fumigación'
        },
        {
            nombre: 'Vidriería',
            descripcion: 'Instalación y reparación de vidrios'
        },
        {
            nombre: 'Tapicería',
            descripcion: 'Tapizado de muebles'
        },
        {
            nombre: 'Mecánica',
            descripcion: 'Reparación de vehículos'
        },
        {
            nombre: 'Informática',
            descripcion: 'Reparación de computadoras y soporte técnico'
        }
    ];

    for (const categoria of categorias) {
        await Categoria.findOrCreate({
            where: { nombre: categoria.nombre },
            defaults: categoria
        });
    }

    console.log(`   ✓ ${categorias.length} categorías insertadas`);
}

module.exports = seedCategorias;
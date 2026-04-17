import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
    { id: 1, nombre: 'Batería 5V con timbales', precio: 59.99, imagen: 'bateria-timbales.jpg', descripcion: 'Ideal para músicos electrónicos y eléctricos. ¡No incluye baquetas ni pilas!' },
    { id: 2, nombre: 'Vela a babor con mecha ecológica', precio: 12.00, imagen: 'vela-babor.jpg', descripcion: 'Navega y alumbra al mismo tiempo, sin contaminar el mar ni la mesa.' },
    { id: 3, nombre: 'Ratón inalámbrico para gatos', precio: 8.99, imagen: 'raton-gato.jpg', descripcion: 'El único ratón que no necesita pilas ni queso. Diversión felina garantizada.' },
    { id: 4, nombre: 'Banco de peces portátil', precio: 25.00, imagen: 'banco-peces.jpg', descripcion: 'Llévate tus ahorros a nadar. No apto para tiburones financieros.' },
    { id: 5, nombre: 'Llave inglesa bilingüe', precio: 14.50, imagen: 'llave-bilingue.jpg', descripcion: 'Aprieta tuercas en dos idiomas. Compatible con tornillos políglotas.' },
    { id: 6, nombre: 'Caña de pescar WiFi', precio: 33.33, imagen: 'cana-wifi.jpg', descripcion: 'Pesca datos y peces a la vez. Señal variable según la marea.' },
    { id: 7, nombre: 'Sillon', precio: 69.69, imagen: 'puto-sillon.png', descripcion: 'Es un puto sillon.' },
    { id: 8, nombre: 'Cartera con fondos reservados', precio: 99.99, imagen: 'cartera.jpg', descripcion: 'Siempre parece llena, pero nunca puedes sacar nada. Ideal para ahorrar.' },
    { id: 9, nombre: 'Gato hidráulico de peluche', precio: 18.18, imagen: 'gato-peluche.jpg', descripcion: 'Levanta tu ánimo y tu coche. No recomendado para alérgicos a los peluches.' },
    { id: 10, nombre: 'Cinta métrica de cassette', precio: 7.77, imagen: 'cinta-cassette.jpg', descripcion: 'Mide tus éxitos musicales y tus muebles. Rebobina para empezar de nuevo.' },
    { id: 11, nombre: 'Ratón óptico de biblioteca', precio: 6.66, imagen: 'raton-biblioteca.jpg', descripcion: 'Lee libros y mueve el cursor. Solo funciona en silencio.' },
    { id: 12, nombre: 'Silla eléctrica de jardín solar', precio: 120.00, imagen: 'silla-electrica.jpg', descripcion: 'Se carga al sol y descarga a los invitados. No usar en días nublados.' },
    { id: 13, nombre: 'Aire enlatado del Everest', precio: 49.99, imagen: 'aire.jpg', descripcion: 'Respira profundo, sabor a aventura. No apto para alpinistas con vértigo.' },
    { id: 14, nombre: 'Calcetín sin pareja', precio: 2.50, imagen: 'calcetin.jpg', descripcion: 'Ideal para solteros y lavadoras hambrientas.' },
    { id: 15, nombre: 'Manual para entender manuales', precio: 15.00, imagen: 'manual.jpg', descripcion: 'Incluye instrucciones para leer instrucciones.' },
    { id: 16, nombre: 'Cuchara invisible', precio: 0.00, imagen: 'cuchara.jpg', descripcion: 'Perfecta para dietas imaginarias. No la pierdas de vista.' },
    { id: 17, nombre: 'Cable inalámbrico', precio: 5.99, imagen: 'cable.jpg', descripcion: 'Conecta nada a ninguna parte. Garantía de desconexión total.' },
    { id: 18, nombre: 'Agua deshidratada', precio: 1.99, imagen: 'agua.jpg', descripcion: 'Solo añade agua. Ideal para viajeros ligeros.' },
    { id: 19, nombre: 'Ladrillo Bluetooth', precio: 79.99, imagen: 'ladrillo.jpg', descripcion: 'Construye tu red sin cables. Compatible con paredes inteligentes.' },
    { id: 20, nombre: 'Silla plegable de aire', precio: 12.00, imagen: 'silla.jpg', descripcion: 'Llévala a todas partes, siéntate en ninguna.' },
    { id: 21, nombre: 'Cargador solar nocturno', precio: 25.00, imagen: 'cargador.jpg', descripcion: 'Carga tus dispositivos mientras duermes... o no.' },
    { id: 22, nombre: 'Kit de invisibilidad para gatos', precio: 199.99, imagen: 'gato.jpg', descripcion: 'Haz que tu gato desaparezca (bajo su propio criterio).' },
    { id: 23, nombre: 'Cinta adhesiva líquida', precio: 3.50, imagen: 'cinta.jpg', descripcion: 'Pega lo que quieras, si lo encuentras.' },
    { id: 24, nombre: 'Linterna solar para cuevas', precio: 18.00, imagen: 'linterna.jpg', descripcion: 'Ilumina donde nunca llega el sol.' },
    { id: 25, nombre: 'Paraguas para interiores', precio: 7.25, imagen: 'paraguas.jpg', descripcion: 'Protégete de lluvias imaginarias y goteras emocionales.' },
    { id: 26, nombre: 'Despertador silencioso', precio: 14.99, imagen: 'despertador.jpg', descripcion: 'No suena nunca. Perfecto para dormilones profesionales.' },
    { id: 27, nombre: 'Tijeras para zurdos diestros', precio: 6.66, imagen: 'tijeras.jpg', descripcion: 'Cortan igual de mal con cualquier mano.' },
    { id: 28, nombre: 'Adaptador USB-A a carbón', precio: 15.15, imagen: 'cargador-carbon.jpg', descripcion: 'Convierte energía digital en barbacoa.' },
    { id: 29, nombre: 'Gafas de sol nocturnas', precio: 9.99, imagen: 'gafas-sol.jpg', descripcion: 'Oscurecen la noche para dormir mejor.' },
    { id: 30, nombre: 'Reloj de arena digital', precio: 13.13, imagen: 'reloj-arena.jpg', descripcion: 'Cuenta el tiempo en bits de arena.' },
];

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

async function main() {
    // Upsert default category so the seed is idempotent
    const category = await prisma.category.upsert({
        where: { slug: 'general' },
        update: {},
        create: {
            name: 'General',
            slug: 'general',
            description: 'Productos generales Parabox',
        },
    });

    for (const item of items) {
        await prisma.product.upsert({
            where: { id: String(item.id) },
            update: {
                name: item.nombre,
                description: item.descripcion,
                price: item.precio,
                images: [`/items_imgs/${item.imagen}`],
            },
            create: {
                id: String(item.id),
                name: item.nombre,
                slug: slugify(item.nombre),
                description: item.descripcion,
                price: item.precio,
                categoryId: category.id,
                images: [`/items_imgs/${item.imagen}`],
            },
        });
    }

    console.log(`Seeded ${items.length} products.`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());

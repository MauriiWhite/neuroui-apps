import { Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    name: "NVIDIA GeForce RTX 4090",
    category: "Componentes",
    tags: ["gpu", "gaming", "render", "ia", "4k", "trazado de rayos"],
    price: 1599.99,
    image: "https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/ada/rtx-4090/geforce-ada-4090-web-og-1200x630.jpg"
  },
  {
    id: 2,
    name: "Intel Core i9-14900K",
    category: "Procesadores",
    tags: ["cpu", "intel", "overclock", "gaming", "multihilo"],
    price: 599.00,
    image: "https://m.media-amazon.com/images/I/61ujd7RN-3L._AC_SL1500_.jpg"
  },
  {
    id: 3,
    name: "Monitor Alienware OLED 34",
    category: "Pantallas",
    tags: ["monitor", "oled", "175hz", "gaming", "ultrawide", "hdr"],
    price: 999.00,
    image: "https://m.media-amazon.com/images/I/61GmLXrqJ-L._AC_SL1500_.jpg"
  },
  {
    id: 4,
    name: "Teclado Keychron Q1 Pro",
    category: "Periféricos",
    tags: ["teclado", "mecánico", "inalámbrico", "aluminio", "custom"],
    price: 199.00,
    image: "https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/24430021/236525_keychron_Q1_Pro_JPorter_0002.jpg?quality=90&strip=all&crop=0,0,100,100"
  },
  {
    id: 5,
    name: "Sony WH-1000XM5",
    category: "Audio",
    tags: ["auriculares", "cancelación ruido", "inalámbrico", "sonido", "bluetooth"],
    price: 348.00,
    image: "https://www.sony.com/is/image/gwtprod/4e4154f981a0c362a20d5a3eaea6605e?fmt=pjpg&op_sharpen=1&hei=400&bgcolor=f1f5f9"
  },
  {
    id: 6,
    name: "Meta Quest 3",
    category: "VR/AR",
    tags: ["vr", "realidad virtual", "metaverso", "juegos", "3d"],
    price: 499.99,
    image: "https://lookaside.fbsbx.com/elementpath/media/?media_id=157327897433582&version=1763475011&transcode_extension=webp"
  },
  {
    id: 7,
    name: "MacBook Pro M3 Max",
    category: "Laptops",
    tags: ["apple", "laptop", "profesional", "edición", "portátil"],
    price: 3199.00,
    image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mbp-og-202510?wid=1200&hei=630&fmt=jpeg&qlt=90&.v=1758663225828"
  },
  {
    id: 8,
    name: "Logitech MX Master 3S",
    category: "Periféricos",
    tags: ["mouse", "productividad", "ergonómico", "inalámbrico", "oficina"],
    price: 99.99,
    image: "https://cdn.mos.cms.futurecdn.net/6UDVYtsY3UkCDJx6F5pTBm.jpg"
  },
  {
    id: 9,
    name: "Samsung 990 PRO 2TB",
    category: "Almacenamiento",
    tags: ["ssd", "nvme", "rápido", "almacenamiento", "pcie"],
    price: 169.99,
    image: "https://www.storagereview.com/wp-content/uploads/2022/10/StorageReview-Samsung-990-Pro-3.jpg"
  },
  {
    id: 10,
    name: "Raspberry Pi 5 8GB",
    category: "Componentes",
    tags: ["mini pc", "desarrollo", "linux", "diy", "iot"],
    price: 80.00,
    image: "https://hardzone.es/app/uploads-hardzone.es/2023/09/nueva-raspberry-pi-5.jpg"
  },
  {
    id: 11,
    name: "Elgato Stream Deck MK.2",
    category: "Streaming",
    tags: ["streaming", "creador", "accesorio", "control", "macros"],
    price: 149.99,
    image: "https://etchile.net/wp-content/uploads/2024/02/B09738CV2G.Main-PhotoRoom.jpg"
  },
  {
    id: 12,
    name: "Unifi Dream Machine SE",
    category: "Redes",
    tags: ["router", "red", "profesional", "internet", "seguridad"],
    price: 499.00,
    image: "https://9to5toys.com/wp-content/uploads/sites/5/2021/07/Ubiquiti-Dream-Machine-Pro-SE.jpg"
  },
];

// Helper to extract unique vocab
export const getVocabulary = (products: Product[]): string[] => {
  const set = new Set<string>();
  products.forEach(p => {
    p.tags.forEach(t => set.add(t.toLowerCase()));
    set.add(p.category.toLowerCase());
  });
  return Array.from(set);
};
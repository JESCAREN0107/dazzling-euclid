import { BusinessInfo, Service, Specialist, Review, BeforeAfterItem } from '../models/types';

export const BUSINESS_CONFIG: BusinessInfo = {
  name: "Lumière Skin & Spa",
  tagline: "El arte de resaltar la luminosidad natural de tu piel",
  description: "Clínica especializada en tratamientos faciales avanzados, dermocosmética y rituales de rejuvenecimiento. Diseñamos cada sesión a la medida de las necesidades de tu piel.",
  phone: "+52 899 527 6969",
  whatsapp: "528995276969",
  whatsappDisplay: "899 527 6969",
  email: "citas@lumierespa.mx",
  address: "Ubicación Local",
  colonia: "Zona Centro",
  city: "Río Bravo / Reynosa, Tamaulipas",
  googleMapsEmbedUrl: "https://maps.google.com/maps?q=25.983294863816297,-98.10022678386305&hl=es&z=16&output=embed",
  instagram: "https://instagram.com/lumiereskin.spa",
  facebook: "https://facebook.com/lumiereskin.spa",
  openingHours: {
    weekdays: "Lunes a Viernes: 9:00 AM - 8:00 PM",
    saturday: "Sábados: 9:00 AM - 6:00 PM",
    sunday: "Domingos: 10:00 AM - 3:00 PM (Previa Cita)"
  },
  adminPin: "1234" // PIN por defecto para el panel de administración
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: "limpieza-profunda-lumiere",
    name: "Limpieza Facial Profunda con Hidrodermoabrasión",
    category: "limpieza",
    shortDescription: "Eliminación profunda de impurezas, puntos negros y células muertas con infusión de sueros hidratantes.",
    fullDescription: "Nuestro tratamiento estrella de higiene cutánea. Incluye desmaquillado botánico, vapor de ozono, peeling ultrasónico, extracción suave con hidrodermoabrasión, mascarilla calmante de velo de colágeno y fototerapia LED regenerativa.",
    durationMinutes: 60,
    priceMXN: 850,
    popular: true,
    benefits: [
      "Extracción indolora sin marcas ni rojeces",
      "Piel suave, limpia y poros refinados",
      "Infusión de antioxidantes y ácido hialurónico",
      "Terapia con luz LED para calmar la piel"
    ],
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    active: true
  },
  {
    id: "hidrafacial-glow-express",
    name: "Glow HidraFacial 3 en 1",
    category: "hidratacion",
    shortDescription: "Renovación celular instantánea y luminosidad radiante para eventos especiales o cuidado mensual.",
    fullDescription: "Tratamiento no invasivo que combina exfoliación suave con puntas de diamante, succión de impurezas y nutrición intensiva mediante electroporación de péptidos y vitamina C liposomal.",
    durationMinutes: 50,
    priceMXN: 1100,
    popular: true,
    benefits: [
      "Brillo natural 'efecto porcelana' al instante",
      "Hidratación multicapa de larga duración",
      "Ideal antes de eventos, bodas o sesiones de fotos",
      "Apto para todo tipo de piel, incluso sensible"
    ],
    imageUrl: "https://images.unsplash.com/photo-1512290900672-1f4a9b5f9215?auto=format&fit=crop&w=800&q=80",
    active: true
  },
  {
    id: "dermaplaning-mascarilla-oro",
    name: "Dermaplaning Facial + Mascarilla de Oro 24K",
    category: "antiedad",
    shortDescription: "Exfoliación física con bisturí quirúrgico estéril para eliminar vello fino (pelusa) y capas muertas.",
    fullDescription: "Técnica de raspado médico controlado que deja la textura de la piel 100% lisa y uniforme. Potencia la absorción de principios activos en un 400% y finaliza con una mascarilla hidroplástica de oro coloidal y masaje criofacial con esferas frías.",
    durationMinutes: 75,
    priceMXN: 1350,
    popular: false,
    benefits: [
      "Eliminación total del vellito facial y asperezas",
      "El maquillaje queda impecable sin parches",
      "Estimula la síntesis de colágeno natural",
      "Masaje desinflamatorio con esferas de hielo"
    ],
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    active: true
  },
  {
    id: "anti-acne-terapia-ozono",
    name: "Tratamiento Purificante Anti-Acné & Control Sebo",
    category: "acne",
    shortDescription: "Protocolo médico-estético diseñado para desinflamar brotes, regular la grasa y cicatrizar lesiones.",
    fullDescription: "Protocolo especializado con ácido salicílico al 2%, alta frecuencia bactericida, aplicación de gas ozonizado para erradicar la bacteria del acné, mascarilla de arcilla volcánica purificante y fototerapia LED azul antibacterial.",
    durationMinutes: 70,
    priceMXN: 950,
    popular: false,
    benefits: [
      "Desinflamación inmediata de pápulas y brotes activos",
      "Regulación de glándulas sebáceas sin resecar",
      "Atenuación de manchas post-inflamatorias",
      "Asesoría de rutina domiciliaria incluida"
    ],
    imageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
    active: true
  },
  {
    id: "lifting-radiofrecuencia-antiedad",
    name: "Lifting Facial Tensor con Radiofrecuencia Tripolar",
    category: "antiedad",
    shortDescription: "Efecto tensor no quirúrgico para combatir la flacidez facial, líneas de expresión y papada.",
    fullDescription: "Ondas de calor controlado que penetran en la dermis profunda para compactar las fibras elásticas existentes y activar la generación de nuevo colágeno. Incluye ampolleta de células madre vegetales y drenaje linfático facial.",
    durationMinutes: 60,
    priceMXN: 1450,
    popular: true,
    benefits: [
      "Redefinición del óvalo facial y pómulos",
      "Atenuación visible de líneas de marioneta y surcos",
      "Efecto lifting progresivo y acumulativo",
      "Tratamiento relajante y completamente indoloro"
    ],
    imageUrl: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80",
    active: true
  },
  {
    id: "paquete-lumiere-reina",
    name: "Ritual Completo 'Reina Lumière' (Facial + Espalda + Masaje)",
    category: "paquetes",
    shortDescription: "Experiencia de 2 horas de desconexión total con facial prémium, exfoliación de espalda y aromaterapia.",
    fullDescription: "La experiencia VIP definitiva. Comienza con una limpieza profunda de espalda con exfoliante de sales del Himalaya, continúa con el tratamiento facial Hidrafacial Glow completo, velo de ácido hialurónico, masaje craneofacial y aromaterapia con aceites esenciales orgánicos de lavanda y jazmín.",
    durationMinutes: 110,
    priceMXN: 2200,
    popular: true,
    benefits: [
      "Cuidado integral de rostro, cuello, escote y espalda",
      "Masaje relajante descontracturante craneocervical",
      "Copa de infusión detox de frutos rojos de cortesía",
      "Kit de muestras dermatológicas para tu casa"
    ],
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    active: true
  }
];

export const SPECIALISTS: Specialist[] = [
  {
    id: "dra-sofia-navarro",
    name: "Dra. Sofía Navarro",
    role: "Cosmiatra & Especialista en Dermoestética Facial",
    bio: "Más de 8 años de experiencia en aparatología de vanguardia, peelings químicos y diagnóstico cutáneo personalizado.",
    avatarUrl: "https://images.unsplash.com/photo-1594824813689-d9183413cfbf?auto=format&fit=crop&w=400&q=80",
    specialties: ["Hidrodermoabrasión", "Peelings Médicos", "Lifting Facial"]
  },
  {
    id: "lic-valeria-morales",
    name: "Lic. Valeria Morales",
    role: "Terapeuta Holística & Cosmetóloga",
    bio: "Experta en técnicas de masaje facial Kobido, drenaje linfático y tratamiento de pieles sensibles o con rosácea.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    specialties: ["Dermaplaning", "Anti-Acné", "Masaje Facial Kobido"]
  }
];

export const REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Fernanda Castillo",
    rating: 5,
    comment: "¡La mejor experiencia de mi vida! Me hice la Limpieza Profunda con Hidrodermoabrasión y mi piel quedó como filtro de Instagram, súper suave y luminosa. La atención de Sofía fue impecable.",
    serviceName: "Limpieza Facial Profunda",
    date: "Hace 3 días",
    verified: true
  },
  {
    id: "rev-2",
    author: "Mariana Rivas",
    rating: 5,
    comment: "Tenía un evento el fin de semana y me recomendaron el Glow HidraFacial. El maquillaje me duró toda la noche intacto y recibí muchísimos cumplidos de mi piel. El lugar es hermoso y huele delicioso.",
    serviceName: "Glow HidraFacial 3 en 1",
    date: "Hace 1 semana",
    verified: true
  },
  {
    id: "rev-3",
    author: "Rodrigo Almonte",
    rating: 5,
    comment: "Como hombre a veces da pena ir a estos lugares, pero el trato fue 10/10 súper profesional. El tratamiento para acné y control de grasa me ayudó muchísimo desde la primera sesión.",
    serviceName: "Tratamiento Purificante Anti-Acné",
    date: "Hace 2 semanas",
    verified: true
  }
];

export const BEFORE_AFTER_ITEMS: BeforeAfterItem[] = [
  {
    id: "ba-1",
    title: "Tratamiento Anti-Acné y Poros Dilatados",
    description: "Reducción visible de brotes activos, rojez y puntos negros tras 3 sesiones combinadas con fototerapia LED.",
    serviceName: "Anti-Acné & Control Sebo",
    sessions: "3 Sesiones (4 semanas)",
    beforeImage: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80",
    afterImage: "https://images.unsplash.com/photo-1512290900672-1f4a9b5f9215?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "ba-2",
    title: "Luminosidad e Hidratación Profunda",
    description: "Restauración de la barrera cutánea en piel deshidratada y opaca con protocolo HidraFacial Glow.",
    serviceName: "Glow HidraFacial 3 en 1",
    sessions: "1 Sola Sesión",
    beforeImage: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80",
    afterImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
  }
];

export const AVAILABLE_TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:15 AM",
  "12:30 PM",
  "02:00 PM",
  "03:15 PM",
  "04:30 PM",
  "05:45 PM",
  "07:00 PM"
];

export const FAQS = [
  {
    question: "¿Con cuánta anticipación debo agendar mi cita?",
    answer: "Recomendamos agendar con al menos 24 a 48 horas de anticipación para asegurar el horario y especialista de tu preferencia. Si requieres cita el mismo día, puedes escribirnos directo a nuestro WhatsApp."
  },
  {
    question: "¿Los tratamientos causan dolor o dejan marcas?",
    answer: "No, en Lumière utilizamos aparatología no invasiva de última generación y técnicas indoloras. Tu piel saldrá fresca, iluminada y lista para continuar tu día."
  },
  {
    question: "¿Qué formas de pago aceptan?",
    answer: "Aceptamos efectivo, transferencias bancarias (SPEI), tarjetas de crédito y débito (Visa, Mastercard, AMEX), y pagos con link de Mercado Pago."
  },
  {
    question: "¿Puedo maquillarme después de un facial?",
    answer: "Recomendamos dejar respirar los poros y absorber los nutrientes por al menos 6 a 12 horas posteriores al tratamiento para maximizar los beneficios de los sueros."
  }
];

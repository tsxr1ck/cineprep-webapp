import type { Movie } from "tmdb-ts";

// Mock de resúmenes generados por IA para películas populares
export const mockLoreAnalysis: Record<number, any> = {
    // Dune: Part Two
    693134: {
        status: "ready",
        generated_at: new Date().toISOString(),
        required_movies: [
            {
                tmdb_id: 438631,
                title: "Dune (2021)",
                poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
                priority: "essential",
                watch_time: "155 min",
                summary: {
                    narrative: "Paul Atreides, heredero de la Casa Atreides, llega al peligroso planeta desértico Arrakis con su familia para supervisar la extracción de la 'especia', la sustancia más valiosa del universo. Pero cuando una traición brutal de la Casa Harkonnen destruye a los Atreides, Paul debe huir al desierto donde los Fremen lo acogen. Allí comienza su transformación de noble exiliado a líder mesiánico, mientras descubre que su destino está entrelazado con el futuro del universo entero.",
                    tone: "épico, místico, político",
                    key_facts: [
                        { id: 1, text: "La especia (melange) es la sustancia más valiosa del universo, solo existe en Arrakis y permite viajar entre planetas.", importance: "critical" },
                        { id: 2, text: "Paul tiene visiones proféticas debido a su entrenamiento Bene Gesserit y la genética especial de su madre Lady Jessica.", importance: "critical" },
                        { id: 3, text: "Los Fremen creen en la profecía del Lisan al-Gaib (La Voz del Otro Mundo) que los liberará, y Paul encaja en esa descripción.", importance: "critical" },
                        { id: 4, text: "Duncan Idaho murió protegiendo a Paul de los Harkonnen.", importance: "important" },
                        { id: 5, text: "El Duque Leto Atreides (padre de Paul) fue asesinado por el Barón Harkonnen mediante una traición del Dr. Yueh.", importance: "important" }
                    ],
                    emotional_beats: [
                        "💔 La brutal traición que aniquila a la Casa Atreides",
                        "🏜️ Paul y Jessica sobreviven milagrosamente en el desierto",
                        "⚔️ El primer combate de Paul con un Fremen y ganar su respeto",
                        "👁️ Las visiones cada vez más intensas sobre Chani y el futuro",
                        "🐛 Paul montando por primera vez un gusano de arena gigante"
                    ]
                },
                audio: {
                    status: "ready",
                    duration: "2:15",
                    voice_name: "Narrador Premium"
                }
            }
        ],
        spoiler_free_guarantee: {
            enabled: true,
            message: "Este resumen NO contiene spoilers de Dune: Parte Dos. Solo cubre eventos de la primera película."
        },
        preparation_time: "2 min de lectura • 2:15 de audio"
    },

    // Inside Out 2
    1022789: {
        status: "ready",
        required_movies: [
            {
                tmdb_id: 150540,
                title: "Intensa-Mente (2015)",
                poster_path: "/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg",
                priority: "essential",
                watch_time: "95 min",
                summary: {
                    narrative: "Riley es una niña de 11 años cuya vida cambia drásticamente cuando su familia se muda de Minnesota a San Francisco. Dentro de su mente, en el 'Cuartel General', cinco emociones personificadas—Alegría, Tristeza, Furia, Temor y Desagrado—guían sus acciones diarias. Cuando Alegría y Tristeza son expulsadas accidentalmente del Cuartel, deben atravesar el complejo laberinto de la mente de Riley para regresar, mientras las Islas de Personalidad de Riley colapsan una por una.",
                    tone: "emotivo, nostálgico, esperanzador",
                    key_facts: [
                        { id: 1, text: "Las 5 emociones básicas son: Alegría (líder), Tristeza, Furia, Temor y Desagrado.", importance: "critical" },
                        { id: 2, text: "Los 'Recuerdos Esenciales' alimentan las 'Islas de Personalidad': Familia, Hockey, Honestidad, Amistad y Payasadas.", importance: "critical" },
                        { id: 3, text: "Bing Bong era el amigo imaginario de Riley que se sacrificó para que Alegría pudiera salvar todo.", importance: "important" },
                        { id: 4, text: "Alegría aprendió que Tristeza tiene un propósito vital: procesar pérdidas y conectar con otros pidiendo ayuda.", importance: "critical" }
                    ],
                    emotional_beats: [
                        "😢 Riley casi se escapa de casa por no poder procesar su tristeza",
                        "💙 El sacrificio de Bing Bong en el vertedero de recuerdos",
                        "💛💙 Alegría permitiendo finalmente que Tristeza tome el control",
                        "👨‍👩‍👧 La reconciliación familiar cuando Riley admite que está triste"
                    ]
                },
                audio: {
                    status: "ready",
                    duration: "1:55",
                    voice_name: "Narrador Cálido"
                }
            }
        ],
        spoiler_free_guarantee: {
            enabled: true,
            message: "Sin spoilers de Intensa-Mente 2."
        },
        preparation_time: "2 min de lectura • 1:55 de audio"
    },

    // Avatar 2
    76600: {
        status: "ready",
        required_movies: [
            {
                tmdb_id: 19995,
                title: "Avatar (2009)",
                poster_path: "/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
                priority: "essential",
                watch_time: "162 min",
                summary: {
                    narrative: "Jake Sully, un marine parapléjico, llega a Pandora como parte del programa Avatar, donde su mente controla un cuerpo Na'vi genéticamente diseñado. Mientras explora la exuberante luna alienígena y se infiltra en la tribu Omaticaya, Jake se enamora de Neytiri y de su forma de vida conectada con la naturaleza. Cuando la corporación RDA amenaza con destruir el hogar de los Na'vi por un mineral valioso, Jake debe elegir entre su misión original y proteger a su nueva familia.",
                    tone: "épico, espiritual, ecológico",
                    key_facts: [
                        { id: 1, text: "Pandora es una luna del planeta Polifemo, con gravedad reducida y flora/fauna bioluminiscente.", importance: "critical" },
                        { id: 2, text: "Los Na'vi se conectan con animales y plantas a través de su 'tsaheylu' (enlace neural con su trenza).", importance: "critical" },
                        { id: 3, text: "Eywa es la deidad/red neural de Pandora que conecta a todos los seres vivos.", importance: "important" },
                        { id: 4, text: "Jake renunció permanentemente a su cuerpo humano y se convirtió en Na'vi completo al final.", importance: "critical" },
                        { id: 5, text: "Los humanos fueron expulsados de Pandora tras perder la batalla.", importance: "important" }
                    ],
                    emotional_beats: [
                        "🌿 Jake volando por primera vez en su ikran (banshee)",
                        "💕 La ceremonia de unión entre Jake y Neytiri",
                        "🌳 La destrucción del Árbol Hogar de los Omaticaya",
                        "⚔️ La batalla final con todos los clanes unidos",
                        "✨ El ritual de transferencia permanente de Jake"
                    ]
                },
                audio: {
                    status: "ready",
                    duration: "2:45",
                    voice_name: "Narrador Épico"
                }
            }
        ],
        spoiler_free_guarantee: {
            enabled: true,
            message: "Sin spoilers de Avatar: El Camino del Agua."
        },
        preparation_time: "3 min de lectura • 2:45 de audio"
    },

    // Gladiator 2
    558449: {
        status: "ready",
        required_movies: [
            {
                tmdb_id: 98,
                title: "Gladiator (2000)",
                poster_path: "/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
                priority: "essential",
                watch_time: "155 min",
                summary: {
                    narrative: "Máximo Décimo Meridio, el general más respetado de Roma, es traicionado por Cómodo, el nuevo emperador que asesina a su padre Marco Aurelio. Máximo escapa de su ejecución pero llega tarde para salvar a su familia, que ha sido masacrada. Convertido en esclavo gladiador, Máximo asciende por los coliseos del imperio hasta llegar al Coliseo de Roma, donde busca venganza contra Cómodo frente a miles de espectadores.",
                    tone: "épico, trágico, vengativo",
                    key_facts: [
                        { id: 1, text: "Marco Aurelio quería que Máximo restaurara la República Romana, no que Cómodo heredara el trono.", importance: "critical" },
                        { id: 2, text: "Cómodo asesinó a su propio padre Marco Aurelio por celos hacia Máximo.", importance: "critical" },
                        { id: 3, text: "Lucila, hermana de Cómodo, ayudó secretamente a Máximo en su plan de derrocar al emperador.", importance: "important" },
                        { id: 4, text: "Máximo muere al final, pero logra matar a Cómodo y liberar a Roma.", importance: "critical" },
                        { id: 5, text: "El sueño recurrente de Máximo: caminar por campos de trigo hacia su familia en el más allá.", importance: "important" }
                    ],
                    emotional_beats: [
                        "💔 Máximo descubriendo los cuerpos de su esposa e hijo",
                        "⚔️ 'Mi nombre es Máximo Décimo Meridio' - la revelación en el Coliseo",
                        "🤝 La lealtad inquebrantable de sus compañeros gladiadores",
                        "👑 El enfrentamiento final con Cómodo herido",
                        "🌾 Máximo reuniéndose con su familia en los Campos Elíseos"
                    ]
                },
                audio: {
                    status: "ready",
                    duration: "2:30",
                    voice_name: "Narrador Dramático"
                }
            }
        ],
        spoiler_free_guarantee: {
            enabled: true,
            message: "Sin spoilers de Gladiator 2."
        },
        preparation_time: "2 min de lectura • 2:30 de audio"
    }
};

// Función para obtener análisis de lore
export function getLoreAnalysis(movieId: number) {
    return mockLoreAnalysis[movieId] || null;
}

// Función para generar resumen con IA (placeholder)
export async function generateLoreSummary(movieId: number, movieTitle: string, collectionMovies: Movie[]) {
    // Simular delay de generación
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Si tenemos datos mock, retornarlos
    if (mockLoreAnalysis[movieId]) {
        return mockLoreAnalysis[movieId];
    }

    // Generar estructura básica para películas no conocidas
    return {
        status: "generated",
        required_movies: collectionMovies.map((movie, index) => ({
            tmdb_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            priority: index === 0 ? "essential" : "recommended",
            watch_time: "~120 min",
            summary: {
                narrative: `Resumen de ${movie.title} pendiente de generar con IA.`,
                tone: "por determinar",
                key_facts: [
                    { id: 1, text: "Esta película es parte importante de la saga.", importance: "critical" }
                ],
                emotional_beats: ["🎬 Momentos clave por analizar"]
            },
            audio: {
                status: "pending",
                duration: "~2:00",
                voice_name: "Narrador AI"
            }
        })),
        spoiler_free_guarantee: {
            enabled: true,
            message: `Sin spoilers de ${movieTitle}.`
        },
        preparation_time: "~3 min de lectura"
    };
}

export default mockLoreAnalysis;
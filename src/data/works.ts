// Mock catalog. Tag names are lowercase so filters can match them exactly.
// Both the tag suggestions and the search results come from this list.

export type Format = "book" | "tv" | "movie" | "comic";

export interface Work {
  id: number;
  title: string;
  format: Format;
  year: number;
  rating: number; // 1–10
  addedAt: string; // ISO date the work was added to the catalog
  authors: string[]; // for screen works: the writer of the source book
  directors: string[];
  series?: string;
  characters: string[];
  genres: string[];
  languages: string[];
  plot: string;
}

type Draft = Omit<Work, "id" | "authors" | "directors" | "characters" | "genres" | "languages"> &
  Partial<Pick<Work, "authors" | "directors" | "characters" | "genres" | "languages">>;

const DRAFTS: Draft[] = [
  {
    title: "Alien", format: "movie", year: 1979, rating: 8.5, addedAt: "2026-10-28",
    directors: ["ridley scott"], series: "alien", characters: ["ellen ripley"], genres: ["space horror"],
    plot: "A mining crew answers a distress call and brings something deadly aboard their ship.",
  },
  {
    title: "Aliens", format: "movie", year: 1986, rating: 8.4, addedAt: "2026-09-14",
    directors: ["james cameron"], series: "alien", characters: ["ellen ripley"], genres: ["space horror", "military sf"],
    plot: "Ripley returns to the colony world with a squad of marines, and the colony has gone silent.",
  },
  {
    title: "Blade Runner", format: "movie", year: 1982, rating: 8.1, addedAt: "2026-11-02",
    authors: ["philip k dick"], directors: ["ridley scott"], characters: ["rick deckard"], genres: ["cyberpunk", "robots"],
    plot: "In a rain-soaked future city, a hunter tracks down four escaped artificial humans.",
  },
  {
    title: "The Martian", format: "movie", year: 2015, rating: 8.0, addedAt: "2026-06-20",
    authors: ["andy weir"], directors: ["ridley scott"], characters: ["mark watney"], genres: ["hard sf", "survival"],
    plot: "An astronaut left for dead on Mars must science his way to survival until rescue comes.",
  },
  {
    title: "The Martian", format: "book", year: 2011, rating: 8.3, addedAt: "2026-06-18",
    authors: ["andy weir"], characters: ["mark watney"], genres: ["hard sf", "survival"],
    plot: "A stranded botanist logs his fight to stay alive alone on Mars.",
  },
  {
    title: "Do Androids Dream of Electric Sheep?", format: "book", year: 1968, rating: 8.0, addedAt: "2026-03-11",
    authors: ["philip k dick"], characters: ["rick deckard"], genres: ["robots", "dystopia"],
    languages: ["english", "french"],
    plot: "A bounty hunter on a dying Earth questions what separates people from the androids he retires.",
  },
  {
    title: "Dune", format: "book", year: 1965, rating: 9.0, addedAt: "2026-01-05",
    authors: ["frank herbert"], series: "dune", characters: ["paul atreides"], genres: ["space opera"],
    languages: ["english", "french", "chinese"],
    plot: "The heir of a noble house is betrayed on a desert planet that holds the most valuable substance in the universe.",
  },
  {
    title: "Dune: Part One", format: "movie", year: 2021, rating: 8.0, addedAt: "2026-10-30",
    authors: ["frank herbert"], directors: ["denis villeneuve"], series: "dune", characters: ["paul atreides"],
    genres: ["space opera"],
    plot: "House Atreides takes control of Arrakis and walks into a trap.",
  },
  {
    title: "Arrival", format: "movie", year: 2016, rating: 7.9, addedAt: "2026-08-09",
    authors: ["ted chiang"], directors: ["denis villeneuve"], characters: ["louise banks"], genres: ["first contact"],
    plot: "A linguist races to understand alien visitors before nations turn on each other.",
  },
  {
    title: "Story of Your Life", format: "book", year: 1998, rating: 8.6, addedAt: "2026-08-01",
    authors: ["ted chiang"], characters: ["louise banks"], genres: ["first contact"],
    plot: "Learning an alien language changes how a linguist experiences time.",
  },
  {
    title: "Foundation", format: "book", year: 1951, rating: 8.2, addedAt: "2026-02-14",
    authors: ["isaac asimov"], series: "foundation", characters: ["hari seldon"], genres: ["space opera"],
    languages: ["english", "french", "chinese"],
    plot: "A mathematician predicts the fall of a galactic empire and plans to shorten the dark age after it.",
  },
  {
    title: "Foundation", format: "tv", year: 2021, rating: 7.3, addedAt: "2026-10-12",
    authors: ["isaac asimov"], series: "foundation", characters: ["hari seldon"], genres: ["space opera"],
    plot: "Exiles at the edge of the galaxy guard a plan to save civilization from collapse.",
  },
  {
    title: "I, Robot", format: "book", year: 1950, rating: 7.9, addedAt: "2026-04-22",
    authors: ["isaac asimov"], genres: ["robots"],
    plot: "Linked stories about robots bound by three laws, and the odd ways those laws fail.",
  },
  {
    title: "The Left Hand of Darkness", format: "book", year: 1969, rating: 8.4, addedAt: "2026-05-03",
    authors: ["ursula k le guin"], genres: ["first contact"],
    plot: "An envoy tries to bring an icy world into an interstellar league and must first understand its people.",
  },
  {
    title: "The Dispossessed", format: "book", year: 1974, rating: 8.5, addedAt: "2026-05-04",
    authors: ["ursula k le guin"], genres: ["utopia"],
    plot: "A physicist leaves his anarchist moon to visit the rich planet his people fled.",
  },
  {
    title: "Ender's Game", format: "book", year: 1985, rating: 8.3, addedAt: "2026-07-19",
    authors: ["orson scott card"], characters: ["ender wiggin"], genres: ["military sf"],
    plot: "A gifted child is trained through war games to lead humanity against an alien threat.",
  },
  {
    title: "Kindred", format: "book", year: 1979, rating: 8.4, addedAt: "2026-09-02",
    authors: ["octavia butler"], genres: ["time travel"],
    plot: "A writer in 1976 is pulled back again and again to a plantation in the antebellum South.",
  },
  {
    title: "Parable of the Sower", format: "book", year: 1993, rating: 8.3, addedAt: "2026-09-03",
    authors: ["octavia butler"], genres: ["dystopia"],
    plot: "A teenager with hyperempathy flees a collapsing California and builds a new faith.",
  },
  {
    title: "The Three-Body Problem", format: "book", year: 2008, rating: 8.1, addedAt: "2026-10-25",
    authors: ["liu cixin"], genres: ["first contact", "hard sf"], languages: ["chinese", "english"],
    plot: "A secret signal sent during the Cultural Revolution gets an answer.",
  },
  {
    title: "2001: A Space Odyssey", format: "movie", year: 1968, rating: 8.3, addedAt: "2026-03-30",
    authors: ["arthur c clarke"], directors: ["stanley kubrick"], characters: ["hal 9000"],
    genres: ["first contact", "hard sf"],
    plot: "A mysterious monolith leads a crew toward Jupiter, with a calm computer at the helm.",
  },
  {
    title: "Star Trek", format: "tv", year: 1966, rating: 8.3, addedAt: "2026-01-20",
    series: "star trek", characters: ["spock", "james t kirk"], genres: ["space opera"],
    plot: "The starship Enterprise explores strange new worlds on a five-year mission.",
  },
  {
    title: "Star Trek: The Next Generation", format: "tv", year: 1987, rating: 8.7, addedAt: "2026-01-21",
    series: "star trek", characters: ["data", "jean-luc picard"], genres: ["space opera"],
    plot: "A new Enterprise crew, led by a diplomat captain, goes where no one has gone before.",
  },
  {
    title: "The Expanse", format: "tv", year: 2015, rating: 8.5, addedAt: "2026-11-05",
    authors: ["james s a corey"], series: "the expanse", characters: ["james holden"], genres: ["space opera", "hard sf"],
    plot: "A detective, an ice-hauler crew and a UN official uncover a conspiracy in a colonized solar system.",
  },
  {
    title: "Leviathan Wakes", format: "book", year: 2011, rating: 8.2, addedAt: "2026-11-04",
    authors: ["james s a corey"], series: "the expanse", characters: ["james holden"], genres: ["space opera"],
    plot: "A missing heiress and a derelict ship pull two men into a war across the solar system.",
  },
  {
    title: "The Terminator", format: "movie", year: 1984, rating: 8.1, addedAt: "2026-07-07",
    directors: ["james cameron"], characters: ["sarah connor"], genres: ["robots", "time travel"],
    plot: "A cyborg assassin is sent back in time to kill the mother of a future rebel leader.",
  },
  {
    title: "Terminator 2: Judgment Day", format: "movie", year: 1991, rating: 8.6, addedAt: "2026-07-08",
    directors: ["james cameron"], characters: ["sarah connor"], genres: ["robots", "time travel"],
    plot: "A reprogrammed cyborg protects a boy from a shape-shifting killer.",
  },
  {
    title: "Neuromancer", format: "book", year: 1984, rating: 7.9, addedAt: "2026-02-28",
    authors: ["william gibson"], genres: ["cyberpunk"],
    plot: "A burned-out hacker gets one last job inside cyberspace.",
  },
  {
    title: "The Matrix", format: "movie", year: 1999, rating: 8.7, addedAt: "2026-04-01",
    directors: ["lana wachowski", "lilly wachowski"], characters: ["neo"], genres: ["cyberpunk"],
    plot: "A hacker learns his world is a simulation and joins the people fighting it.",
  },
  {
    title: "Interstellar", format: "movie", year: 2014, rating: 8.7, addedAt: "2026-08-15",
    directors: ["christopher nolan"], genres: ["hard sf", "time travel"],
    plot: "Explorers travel through a wormhole to find a new home for a dying Earth.",
  },
  {
    title: "Solaris", format: "book", year: 1961, rating: 8.0, addedAt: "2026-06-01",
    authors: ["stanislaw lem"], genres: ["first contact"], languages: ["polish", "english", "french"],
    plot: "Scientists orbiting an ocean planet are visited by people from their own pasts.",
  },
  {
    title: "Akira", format: "comic", year: 1982, rating: 8.8, addedAt: "2026-10-18",
    authors: ["katsuhiro otomo"], characters: ["kaneda", "tetsuo"], genres: ["cyberpunk"],
    languages: ["japanese", "english"],
    plot: "In Neo-Tokyo, a biker gang member gains psychic powers he cannot control.",
  },
  {
    title: "Saga", format: "comic", year: 2012, rating: 8.6, addedAt: "2026-10-20",
    authors: ["brian k vaughan"], characters: ["alana", "marko"], genres: ["space opera"],
    plot: "Two soldiers from opposite sides of a galactic war run away to raise their daughter.",
  },
];

export const WORKS: Work[] = DRAFTS.map((d, i) => ({
  authors: [],
  directors: [],
  characters: [],
  genres: [],
  languages: ["english"],
  ...d,
  id: i + 1,
}));

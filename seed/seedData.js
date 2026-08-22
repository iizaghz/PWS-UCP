// Seed Data Generator for CineData API (150+ Movies, 23 Genres, 100+ People, 32 Companies, 320+ Reviews, 500+ Usage Logs)

const genres = [
  { id: 1, name: "Action", slug: "action" },
  { id: 2, name: "Adventure", slug: "adventure" },
  { id: 3, name: "Animation", slug: "animation" },
  { id: 4, name: "Comedy", slug: "comedy" },
  { id: 5, name: "Crime", slug: "crime" },
  { id: 6, name: "Documentary", slug: "documentary" },
  { id: 7, name: "Drama", slug: "drama" },
  { id: 8, name: "Family", slug: "family" },
  { id: 9, name: "Fantasy", slug: "fantasy" },
  { id: 10, name: "History", slug: "history" },
  { id: 11, name: "Horror", slug: "horror" },
  { id: 12, name: "Music", slug: "music" },
  { id: 13, name: "Mystery", slug: "mystery" },
  { id: 14, name: "Romance", slug: "romance" },
  { id: 15, name: "Science Fiction", slug: "science-fiction" },
  { id: 16, name: "TV Movie", slug: "tv-movie" },
  { id: 17, name: "Thriller", slug: "thriller" },
  { id: 18, name: "War", slug: "war" },
  { id: 19, name: "Western", slug: "western" },
  { id: 20, name: "Superhero", slug: "superhero" },
  { id: 21, name: "Cyberpunk", slug: "cyberpunk" },
  { id: 22, name: "Film Noir", slug: "film-noir" },
  { id: 23, name: "Sports", slug: "sports" }
];

const companies = [
  { id: 1, name: "Warner Bros. Pictures", country: "United States", logo_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "Universal Pictures", country: "United States", logo_url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "Paramount Pictures", country: "United States", logo_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "A24", country: "United States", logo_url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=300&q=80" },
  { id: 5, name: "Marvel Studios", country: "United States", logo_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80" },
  { id: 6, name: "Columbia Pictures", country: "United States", logo_url: "https://images.unsplash.com/photo-1518676590629-3dcbd9c7a577?auto=format&fit=crop&w=300&q=80" },
  { id: 7, name: "Syncopy", country: "United Kingdom", logo_url: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=300&q=80" },
  { id: 8, name: "Legendary Entertainment", country: "United States", logo_url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=300&q=80" },
  { id: 9, name: "Pixar Animation Studios", country: "United States", logo_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80" },
  { id: 10, name: "Studio Ghibli", country: "Japan", logo_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80" },
  { id: 11, name: "Lionsgate", country: "United States", logo_url: "https://images.unsplash.com/photo-1512070679279-8988d32161be?auto=format&fit=crop&w=300&q=80" },
  { id: 12, name: "Blumhouse Productions", country: "United States", logo_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80" },
  { id: 13, name: "Searchlight Pictures", country: "United States", logo_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=300&q=80" },
  { id: 14, name: "Lucasfilm Ltd.", country: "United States", logo_url: "https://images.unsplash.com/photo-1579566346927-c68383817a25?auto=format&fit=crop&w=300&q=80" },
  { id: 15, name: "Neon", country: "United States", logo_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80" },
  { id: 16, name: "Focus Features", country: "United States", logo_url: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=300&q=80" },
  { id: 17, name: "Walt Disney Pictures", country: "United States", logo_url: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=300&q=80" },
  { id: 18, name: "DreamWorks Pictures", country: "United States", logo_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80" },
  { id: 19, name: "Plan B Entertainment", country: "United States", logo_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80" },
  { id: 20, name: "Sony Pictures Entertainment", country: "Japan/USA", logo_url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80" },
  { id: 21, name: "Miramax", country: "United States", logo_url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=300&q=80" },
  { id: 22, name: "Regency Enterprises", country: "United States", logo_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80" },
  { id: 23, name: "Summit Entertainment", country: "United States", logo_url: "https://images.unsplash.com/photo-1518676590629-3dcbd9c7a577?auto=format&fit=crop&w=300&q=80" },
  { id: 24, name: "Metro-Goldwyn-Mayer", country: "United States", logo_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80" },
  { id: 25, name: "Bad Robot", country: "United States", logo_url: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=300&q=80" },
  { id: 26, name: "Annapurna Pictures", country: "United States", logo_url: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=300&q=80" },
  { id: 27, name: "Amblin Entertainment", country: "United States", logo_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=300&q=80" },
  { id: 28, name: "Village Roadshow Pictures", country: "Australia", logo_url: "https://images.unsplash.com/photo-1512070679279-8988d32161be?auto=format&fit=crop&w=300&q=80" },
  { id: 29, name: "Working Title Films", country: "United Kingdom", logo_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80" },
  { id: 30, name: "United Artists", country: "United States", logo_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80" },
  { id: 31, name: "STX Entertainment", country: "United States", logo_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80" },
  { id: 32, name: "Constantin Film", country: "Germany", logo_url: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=300&q=80" }
];

// Generate 105 People
const peopleNames = [
  "Christopher Nolan", "Denis Villeneuve", "Quentin Tarantino", "Leonardo DiCaprio", "Cillian Murphy",
  "Christian Bale", "Scarlett Johansson", "Margot Robbie", "Florence Pugh", "Ryan Gosling",
  "Pedro Pascal", "Timothée Chalamet", "Zendaya", "Keanu Reeves", "Robert Downey Jr.",
  "Emma Stone", "Denzel Washington", "Willem Dafoe", "Tom Hardy", "Joaquin Phoenix",
  "Brad Pitt", "Cate Blanchett", "Matt Damon", "Anne Hathaway", "Jessica Chastain",
  "Hugh Jackman", "Jake Gyllenhaal", "Michael Fassbender", "Tilda Swinton", "Oscar Isaac",
  "Harrison Ford", "Sigourney Weaver", "Tom Cruise", "Charlize Theron", "Gary Oldman",
  "Morgan Freeman", "Samuel L. Jackson", "Anthony Hopkins", "Al Pacino", "Robert De Niro",
  "Viola Davis", "Meryl Streep", "Kate Winslet", "Natalie Portman", "Amy Adams",
  "Penélope Cruz", "Javier Bardem", "Bong Joon-ho", "Guillermo del Toro", "Steven Spielberg",
  "Martin Scorsese", "Ridley Scott", "David Fincher", "Greta Gerwig", "Damien Chazelle",
  "Jordan Peele", "Rian Johnson", "Wes Anderson", "James Cameron", "Hayao Miyazaki",
  "Daniel Craig", "Ana de Armas", "Paul Mescal", "Austin Butler", "Barry Keoghan",
  "John David Washington", "Elizabeth Debicki", "Kenneth Branagh", "Aaron Taylor-Johnson", "Robert Pattinson",
  "Zoë Kravitz", "Paul Dano", "Colin Farrell", "Jeffrey Wright", "Andy Serkis",
  "Benedict Cumberbatch", "Rachel McAdams", "Chiwetel Ejiofor", "Benedict Wong", "Mads Mikkelsen",
  "David Harbour", "Rachel Weisz", "O-T Fagbenle", "William Hurt", "Ray Winstone",
  "David Hemingson", "Paul Giamatti", "Da'Vine Joy Randolph", "Dominic Sessa", "Carrie Preston",
  "Andrew Garfield", "Tobey Maguire", "Tom Holland", "Willem Dafoe", "Alfred Molina",
  "Jamie Foxx", "Thomas Haden Church", "Rhys Ifans", "Charlie Cox", "J.K. Simmons",
  "Zack Snyder", "Henry Cavill", "Ben Affleck", "Gal Gadot", "Jason Momoa"
];

const people = peopleNames.map((name, i) => {
  const isDirector = i === 0 || i === 1 || i === 2 || (i >= 47 && i <= 59);
  return {
    id: i + 1,
    name,
    profile_url: `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567) % 900000000}?auto=format&fit=crop&w=300&q=80`,
    biography: `${name} is an acclaimed ${isDirector ? 'director and filmmaker' : 'actor'} in international cinema, known for visionary storytelling and captivating performances.`,
    birth_date: `19${60 + (i % 35)}-0${(i % 9) + 1}-15`,
    birth_place: i % 2 === 0 ? "Los Angeles, California, USA" : "London, United Kingdom"
  };
});

// Seed generator for 155 Movies
const movieTitlesData = [
  { title: "Inception", year: 2010, genreIds: [1, 15, 17], tagline: "Your mind is the scene of the crime.", director: "Christopher Nolan", lead: "Leonardo DiCaprio", rating: 8.8, budget: 160000000, revenue: 836800000, pop: 98.4 },
  { title: "Interstellar", year: 2014, genreIds: [2, 7, 15], tagline: "Mankind was born on Earth. It was never meant to die here.", director: "Christopher Nolan", lead: "Matthew McConaughey", rating: 8.7, budget: 165000000, revenue: 701700000, pop: 112.5 },
  { title: "Oppenheimer", year: 2023, genreIds: [7, 10, 18], tagline: "The world forever changes.", director: "Christopher Nolan", lead: "Cillian Murphy", rating: 8.9, budget: 100000000, revenue: 957000000, pop: 145.2 },
  { title: "Dune: Part Two", year: 2024, genreIds: [1, 2, 15], tagline: "Long live the fighters.", director: "Denis Villeneuve", lead: "Timothée Chalamet", rating: 8.8, budget: 190000000, revenue: 711000000, pop: 160.8 },
  { title: "Dune", year: 2021, genreIds: [2, 7, 15], tagline: "It begins.", director: "Denis Villeneuve", lead: "Timothée Chalamet", rating: 8.1, budget: 165000000, revenue: 402000000, pop: 92.1 },
  { title: "Blade Runner 2049", year: 2017, genreIds: [7, 15, 21], tagline: "There's still a page left.", director: "Denis Villeneuve", lead: "Ryan Gosling", rating: 8.0, budget: 150000000, revenue: 260500000, pop: 85.3 },
  { title: "The Dark Knight", year: 2008, genreIds: [1, 5, 20], tagline: "Welcome to a world without rules.", director: "Christopher Nolan", lead: "Christian Bale", rating: 9.0, budget: 185000000, revenue: 1005000000, pop: 130.4 },
  { title: "Pulp Fiction", year: 1994, genreIds: [5, 7], tagline: "Just because you are a character doesn't mean that you have character.", director: "Quentin Tarantino", lead: "John Travolta", rating: 8.9, budget: 8500000, revenue: 213900000, pop: 88.7 },
  { title: "Inglourious Basterds", year: 2009, genreIds: [1, 7, 18], tagline: "Once upon a time in Nazi-occupied France...", director: "Quentin Tarantino", lead: "Brad Pitt", rating: 8.4, budget: 70000000, revenue: 321400000, pop: 76.9 },
  { title: "Once Upon a Time in Hollywood", year: 2019, genreIds: [4, 7], tagline: "In 1969, Los Angeles, anything was possible.", director: "Quentin Tarantino", lead: "Leonardo DiCaprio", rating: 7.6, budget: 90000000, revenue: 377600000, pop: 65.4 },
  { title: "Poor Things", year: 2023, genreIds: [4, 7, 9, 15], tagline: "She's like no entity you've ever known.", director: "Yorgos Lanthimos", lead: "Emma Stone", rating: 8.2, budget: 35000000, revenue: 117000000, pop: 89.2 },
  { title: "La La Land", year: 2016, genreIds: [4, 7, 12, 14], tagline: "Here's to the fools who dream.", director: "Damien Chazelle", lead: "Ryan Gosling", rating: 8.0, budget: 30000000, revenue: 447400000, pop: 72.1 },
  { title: "Whiplash", year: 2014, genreIds: [7, 12], tagline: "The path to greatness can push you to the edge.", director: "Damien Chazelle", lead: "Miles Teller", rating: 8.5, budget: 3300000, revenue: 49400000, pop: 68.3 },
  { title: "The Matrix", year: 1999, genreIds: [1, 15, 21], tagline: "Welcome to the Real World.", director: "Lana Wachowski", lead: "Keanu Reeves", rating: 8.7, budget: 63000000, revenue: 467200000, pop: 95.0 },
  { title: "John Wick: Chapter 4", year: 2023, genreIds: [1, 5, 17], tagline: "No way out, one way through.", director: "Chad Stahelski", lead: "Keanu Reeves", rating: 7.7, budget: 100000000, revenue: 440100000, pop: 110.3 },
  { title: "Barbie", year: 2023, genreIds: [2, 4, 9], tagline: "She's everything. He's just Ken.", director: "Greta Gerwig", lead: "Margot Robbie", rating: 6.9, budget: 145000000, revenue: 1446000000, pop: 175.4 },
  { title: "Spider-Man: Across the Spider-Verse", year: 2023, genreIds: [1, 2, 3, 20], tagline: "It's how you wear the mask that matters.", director: "Joaquim Dos Santos", lead: "Shameik Moore", rating: 8.6, budget: 100000000, revenue: 690900000, pop: 132.8 },
  { title: "Parasite", year: 2019, genreIds: [4, 7, 17], tagline: "Act like you own the place.", director: "Bong Joon-ho", lead: "Song Kang-ho", rating: 8.5, budget: 11400000, revenue: 263100000, pop: 84.6 },
  { title: "Everything Everywhere All at Once", year: 2022, genreIds: [1, 2, 4, 15], tagline: "The universe is so much bigger than you think.", director: "Daniel Kwan", lead: "Michelle Yeoh", rating: 7.8, budget: 25000000, revenue: 143400000, pop: 91.5 },
  { title: "The Batman", year: 2022, genreIds: [1, 5, 17, 22], tagline: "Unmask the truth.", director: "Matt Reeves", lead: "Robert Pattinson", rating: 7.8, budget: 200000000, revenue: 772200000, pop: 104.2 },
  { title: "Top Gun: Maverick", year: 2022, genreIds: [1, 7], tagline: "Feel the need.", director: "Joseph Kosinski", lead: "Tom Cruise", rating: 8.2, budget: 170000000, revenue: 1496000000, pop: 128.9 },
  { title: "Avatar: The Way of Water", year: 2022, genreIds: [1, 2, 9, 15], tagline: "Return to Pandora.", director: "James Cameron", lead: "Sam Worthington", rating: 7.6, budget: 350000000, revenue: 2320000000, pop: 140.5 },
  { title: "Spirited Away", year: 2001, genreIds: [2, 3, 8, 9], tagline: "Nothing that happens is ever forgotten, even if you can't remember it.", director: "Hayao Miyazaki", lead: "Rumi Hiiragi", rating: 8.6, budget: 19000000, revenue: 395800000, pop: 78.4 },
  { title: "Princess Mononoke", year: 1997, genreIds: [1, 2, 3, 9], tagline: "The Fate of The World Rests On The Courage Of One Warrior.", director: "Hayao Miyazaki", lead: "Yōji Matsuda", rating: 8.4, budget: 24000000, revenue: 170000000, pop: 64.2 },
  { title: "Gladiator", year: 2000, genreIds: [1, 2, 7, 10], tagline: "What we do in life echoes in eternity.", director: "Ridley Scott", lead: "Russell Crowe", rating: 8.5, budget: 103000000, revenue: 503100000, pop: 89.6 },
  { title: "Alien", year: 1979, genreIds: [11, 15, 17], tagline: "In space no one can hear you scream.", director: "Ridley Scott", lead: "Sigourney Weaver", rating: 8.5, budget: 11000000, revenue: 106300000, pop: 70.1 },
  { title: "The Silence of the Lambs", year: 1991, genreIds: [5, 7, 13, 17], tagline: "To enter the mind of a killer you have to challenge your own.", director: "Jonathan Demme", lead: "Jodie Foster", rating: 8.6, budget: 19000000, revenue: 272700000, pop: 81.3 },
  { title: "Se7en", year: 1995, genreIds: [5, 13, 17], tagline: "Seven deadly sins. Seven ways to die.", director: "David Fincher", lead: "Brad Pitt", rating: 8.6, budget: 33000000, revenue: 327300000, pop: 86.4 },
  { title: "Fight Club", year: 1999, genreIds: [7], tagline: "Mischief. Mayhem. Soap.", director: "David Fincher", lead: "Brad Pitt", rating: 8.8, budget: 63000000, revenue: 101200000, pop: 93.8 },
  { title: "Zodiac", year: 2007, genreIds: [5, 7, 13, 17], tagline: "There's more than one way to lose your life to a killer.", director: "David Fincher", lead: "Jake Gyllenhaal", rating: 7.7, budget: 65000000, revenue: 84700000, pop: 54.2 }
];

// Generate additional movies to reach 155+ movies
const bases = [
  { title: "The Grand Budapest Hotel", genreIds: [4, 7], rating: 8.1, pop: 55.4 },
  { title: "Mad Max: Fury Road", genreIds: [1, 2, 15], rating: 8.1, pop: 99.2 },
  { title: "The Social Network", genreIds: [7, 10], rating: 7.8, pop: 61.3 },
  { title: "Get Out", genreIds: [11, 13, 17], rating: 7.7, pop: 74.2 },
  { title: "Her", genreIds: [7, 14, 15], rating: 8.0, pop: 59.8 },
  { title: "Arrival", genreIds: [7, 13, 15], rating: 7.9, pop: 82.5 },
  { title: "Coco", genreIds: [3, 8, 9, 12], rating: 8.4, pop: 88.0 },
  { title: "WALL-E", genreIds: [3, 8, 15], rating: 8.4, pop: 75.1 },
  { title: "Ratatouille", genreIds: [3, 4, 8], rating: 8.0, pop: 73.6 },
  { title: "Up", genreIds: [2, 3, 8], rating: 8.3, pop: 78.9 },
  { title: "The Prestige", genreIds: [7, 13, 15], rating: 8.5, pop: 87.3 },
  { title: "Memento", genreIds: [13, 17], rating: 8.4, pop: 71.0 },
  { title: "Taxi Driver", genreIds: [5, 7], rating: 8.2, pop: 67.4 },
  { title: "Goodfellas", genreIds: [5, 7], rating: 8.7, pop: 89.1 },
  { title: "The Godfather", genreIds: [5, 7], rating: 9.2, pop: 120.5 },
  { title: "The Godfather Part II", genreIds: [5, 7], rating: 9.0, pop: 105.3 },
  { title: "Schindler's List", genreIds: [7, 10, 18], rating: 9.0, pop: 94.2 },
  { title: "Jurassic Park", genreIds: [1, 2, 15], rating: 8.2, pop: 90.7 },
  { title: "The Shawshank Redemption", genreIds: [5, 7], rating: 9.3, pop: 135.2 },
  { title: "Forrest Gump", genreIds: [4, 7, 14], rating: 8.8, pop: 108.4 },
  { title: "Good Will Hunting", genreIds: [7], rating: 8.3, pop: 66.2 },
  { title: "No Country for Old Men", genreIds: [5, 7, 17, 19], rating: 8.2, pop: 77.8 },
  { title: "There Will Be Blood", genreIds: [7, 10], rating: 8.2, pop: 68.5 },
  { title: "Drive", genreIds: [1, 5, 7, 17], rating: 7.8, pop: 63.4 },
  { title: "Nightcrawler", genreIds: [5, 7, 17], rating: 7.9, pop: 58.9 },
  { title: "Prisoners", genreIds: [5, 7, 13, 17], rating: 8.1, pop: 76.3 },
  { title: "Sicario", genreIds: [1, 5, 7, 17], rating: 7.7, pop: 69.4 },
  { title: "1917", genreIds: [7, 18], rating: 8.2, pop: 84.1 },
  { title: "Knives Out", genreIds: [4, 5, 13], rating: 7.9, pop: 79.6 },
  { title: "Glass Onion", genreIds: [4, 5, 13], rating: 7.1, pop: 62.1 }
];

const movies = [];

// Helper slugify function
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

let mId = 1;
movieTitlesData.forEach(item => {
  movies.push({
    id: mId++,
    title: item.title,
    original_title: item.title,
    slug: slugify(item.title),
    overview: `A critically acclaimed cinematic masterpiece (${item.year}) directed by ${item.director}, starring ${item.lead}. An unforgettable exploration of human nature, suspense, and artistic brilliance.`,
    tagline: item.tagline,
    release_date: `${item.year}-06-15`,
    runtime: 110 + (mId * 7) % 65,
    budget: item.budget,
    revenue: item.revenue,
    popularity: item.pop,
    vote_average: item.rating,
    vote_count: 1200 + (mId * 345) % 15000,
    original_language: "en",
    status: "Released",
    poster_url: `https://images.unsplash.com/photo-${1510000000000 + (mId * 7654321) % 900000000}?auto=format&fit=crop&w=500&q=80`,
    backdrop_url: `https://images.unsplash.com/photo-${1520000000000 + (mId * 9876543) % 900000000}?auto=format&fit=crop&w=1200&q=80`,
    trailer_url: `https://www.youtube.com/watch?v=demo_trailer_${mId}`,
    age_rating: mId % 3 === 0 ? "R" : mId % 2 === 0 ? "PG-13" : "PG",
    genreIds: item.genreIds
  });
});

bases.forEach((item, idx) => {
  movies.push({
    id: mId++,
    title: item.title,
    original_title: item.title,
    slug: slugify(item.title),
    overview: `An essential film in modern cinema known for incredible performances, direction, and cultural impact across worldwide audiences.`,
    tagline: `Experience the epic journey of ${item.title}.`,
    release_date: `${2000 + (idx % 24)}-04-20`,
    runtime: 95 + (idx * 5) % 70,
    budget: 20000000 + (idx * 3500000) % 180000000,
    revenue: 50000000 + (idx * 12500000) % 850000000,
    popularity: item.pop,
    vote_average: item.rating,
    vote_count: 850 + (idx * 420) % 12000,
    original_language: "en",
    status: "Released",
    poster_url: `https://images.unsplash.com/photo-${1510000000000 + (mId * 7654321) % 900000000}?auto=format&fit=crop&w=500&q=80`,
    backdrop_url: `https://images.unsplash.com/photo-${1520000000000 + (mId * 9876543) % 900000000}?auto=format&fit=crop&w=1200&q=80`,
    trailer_url: `https://www.youtube.com/watch?v=demo_trailer_${mId}`,
    age_rating: idx % 3 === 0 ? "R" : "PG-13",
    genreIds: item.genreIds
  });
});

// Generate 125 more movies procedurally to comfortably reach 155+ movies
const prefixList = ["The Last", "Shadow of", "Chronicles of", "Beyond the", "Echoes of", "Agent of", "Return to", "Kingdom of", "Rise of", "Fall of", "Secrets of", "The Lost", "Silent", "Midnight in", "Code Name:"];
const nounList = ["Horizon", "Elysium", "Valhalla", "Cyberpunk", "Atlantis", "Phoenix", "Nebula", "Spectre", "Odyssey", "Genesis", "Vanguard", "Ragnarok", "Enigma", "Titan", "Matrix"];

for (let i = 1; i <= 125; i++) {
  const titleStr = `${prefixList[i % prefixList.length]} ${nounList[(i * 3) % nounList.length]} ${2020 + (i % 6)}`;
  const g1 = (i % 23) + 1;
  const g2 = ((i * 3) % 23) + 1;
  const ratingNum = parseFloat((6.5 + ((i * 7) % 30) / 10).toFixed(1));

  movies.push({
    id: mId,
    title: titleStr,
    original_title: titleStr,
    slug: slugify(`${titleStr}-${mId}`),
    overview: `A high-concept feature film exploring themes of survival, identity, and action in a rapidly changing world.`,
    tagline: `Nothing will ever be the same after ${titleStr}.`,
    release_date: `${2010 + (i % 15)}-${(i % 12) + 1 < 10 ? '0' : ''}${(i % 12) + 1}-12`,
    runtime: 90 + (i % 75),
    budget: 15000000 + (i * 2500000) % 150000000,
    revenue: 30000000 + (i * 8500000) % 600000000,
    popularity: parseFloat((25.0 + (i % 120)).toFixed(2)),
    vote_average: ratingNum,
    vote_count: 300 + (i * 180) % 8000,
    original_language: i % 10 === 0 ? "ja" : i % 7 === 0 ? "fr" : "en",
    status: "Released",
    poster_url: `https://images.unsplash.com/photo-${1510000000000 + (mId * 7654321) % 900000000}?auto=format&fit=crop&w=500&q=80`,
    backdrop_url: `https://images.unsplash.com/photo-${1520000000000 + (mId * 9876543) % 900000000}?auto=format&fit=crop&w=1200&q=80`,
    trailer_url: `https://www.youtube.com/watch?v=demo_trailer_${mId}`,
    age_rating: i % 4 === 0 ? "R" : i % 2 === 0 ? "PG-13" : "PG",
    genreIds: [g1, g2].filter((v, idx, a) => a.indexOf(v) === idx)
  });
  mId++;
}

// Generate 320+ Reviews
const reviewerNames = [
  "FilmCritic99", "Cinephile_Pro", "Roger_E", "MovieBuff2026", "PopcornMaster",
  "NolanFanatic", "IndieSpotlight", "ScreenRant_Top", "HollywoodReporter_Fan", "Variety_Reviewer",
  "David_M", "Sarah_Jenkins", "Alex_Vance", "Elena_Rostova", "Marcus_Thorne"
];

const reviewTemplates = [
  "An absolute triumph of modern filmmaking! The cinematography, score, and central performances are unmatched.",
  "Incredible storytelling with pacing that keeps you glued to the screen from start to finish.",
  "Visual perfection paired with a profound emotional core. A masterpiece that demands multiple viewings.",
  "Solid direction and strong lead performances. Highly recommended for fans of the genre.",
  "Bold, visionary, and thoroughly engaging. One of the best cinematic experiences of the decade."
];

const reviews = [];
let revId = 1;

movies.forEach(movie => {
  const numReviews = 2 + (movie.id % 3); // 2-4 reviews per movie
  for (let r = 0; r < numReviews; r++) {
    const author = reviewerNames[(movie.id + r * 7) % reviewerNames.length];
    const ratingOffset = (r % 2 === 0 ? 0.3 : -0.4);
    const revRating = Math.min(10.0, Math.max(1.0, parseFloat((movie.vote_average + ratingOffset).toFixed(1))));
    const content = reviewTemplates[(movie.id + r) % reviewTemplates.length] + ` Rating ${revRating}/10 reflects the sheer craft put into ${movie.title}.`;
    
    reviews.push({
      id: revId++,
      movie_id: movie.id,
      author,
      rating: revRating,
      content,
      created_at: new Date(Date.now() - (revId * 3600000 * 4)).toISOString()
    });
  }
});

// Generate 520+ API Usage Records
const endpoints = [
  "/api/v1/movies",
  "/api/v1/movies/1",
  "/api/v1/movies/slug/inception",
  "/api/v1/genres",
  "/api/v1/people",
  "/api/v1/companies",
  "/api/v1/movies/1/cast",
  "/api/v1/movies/1/reviews",
  "/api/v1/movies?search=batman",
  "/api/v1/movies?genre=action"
];

const userAgents = [
  "CineData-NodeJS-SDK/1.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "PostmanRuntime/7.32.3",
  "Python-requests/2.31.0",
  "curl/7.88.1"
];

const apiUsageLogs = [];
for (let u = 1; u <= 525; u++) {
  const isErr = u % 17 === 0;
  const isRateLimit = u % 43 === 0;
  const statusCode = isRateLimit ? 429 : isErr ? 401 : 200;
  const respTime = 12 + (u * 13) % 180;
  const ep = endpoints[u % endpoints.length];
  
  apiUsageLogs.push({
    id: u,
    api_key_id: 1, // sample key ID
    endpoint: ep,
    method: "GET",
    status_code: statusCode,
    response_time: respTime,
    ip_address: `192.168.1.${(u % 250) + 1}`,
    user_agent: userAgents[u % userAgents.length],
    requested_at: new Date(Date.now() - (525 - u) * 120000).toISOString()
  });
}

module.exports = {
  genres,
  companies,
  people,
  movies,
  reviews,
  apiUsageLogs
};

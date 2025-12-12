export type FetchedPokemon = {
  id: number;
  name: string;
  image: string | null;
  types: string[];
};

// to get pokemon
export async function getRandomPokemon(): Promise<FetchedPokemon> {
  const randomId = Math.floor(Math.random() * 898) + 1;
  return await fetchPokemonById(randomId);
}

// reference pokemon from the table
export async function fetchPokemonById(id: number): Promise<FetchedPokemon> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

  if (!response.ok) {
    throw new Error(`PokéAPI error: ${response.status}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    image: data.sprites.other["official-artwork"].front_default,
    types: data.types.map((t: any) => t.type.name),
  };
}

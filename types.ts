export interface Product {
  id: number;
  name: string;
  category: string;
  tags: string[];
  price: number;
  image: string;
}

export type AppView = 'home' | 'recommender' | 'converter';

export interface ScoredProduct extends Product {
  score: number;
}

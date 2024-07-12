export type ConnGameData = {
  status: "Ok";
  id: number;
  print_date: string;
  editor: string;
  categories: ConnGameCat[];
};

export type ConnGameCat = {
  title: string;
  cards: ConnGameCard[];
};

export type ConnGameCard = {
  content: string;
  position: number;
};

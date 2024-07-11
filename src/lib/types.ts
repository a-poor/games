export type ConnectionsResponse = {
  status: "Ok";
  id: number;
  print_date: string;
  editor: string;
  categories: ConnectionsCategory[];
};

export type ConnectionsCategory = {
  title: string;
  cards: ConnectionsCard[];
};

export type ConnectionsCard = {
  content: string;
  position: number;
};

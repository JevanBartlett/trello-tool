// Trello API type definitions
// These interfaces mirror the shape of data returned by Trello's REST API

export interface TrelloBoard {
  id: string;
  name: string;
  // Add more fields as we discover what we need
}

export interface TrelloList {
  id: string;
  name: string;
  idBoard: string;
  // Add more fields as we discover what we need
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
  due: string | null;
  labels: TrelloLabel[];
  // Add more fields as we discover what we need
}

export interface TrelloLabel {
  id: string;
  name: string;
  color: string;
}

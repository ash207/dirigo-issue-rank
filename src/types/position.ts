
export interface Position {
  id: string;
  title: string;
  content: string;
  issue_id: string;
  author_id: string;
  votes: number;
  created_at: string;
  issues?: {
    title: string;
  };
}

export type PostSection = {
  heading: string;
  body: string;
};

export type Post = {
  id: string;
  title: string;
  updatedAt: string; // ISO string
  lead: string;
  sections: PostSection[];
};

export type PostSummary = Omit<Post, "sections"> & {
  sectionHeadings: string[];
  searchIndex: string;
};

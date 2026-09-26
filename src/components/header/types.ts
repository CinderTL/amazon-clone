export type HeaderCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  }[];
};

export type HeaderUser = {
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  authProvider: string;
  isSeller: boolean;
};

export type HeaderNotification = {
  id: string;
  title: string;
  body: string;
  href: string;
  active: boolean;
};

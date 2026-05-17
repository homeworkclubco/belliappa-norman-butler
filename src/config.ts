export type Site = {
  website: string;
  author: string;
  seo: {
    title: string;
    description: string;
    image: string;
  };
};

export const SITE: Site = {
  website: "https://bnb.viewing.studio",
  author: "Belliappa Norman-Butler",
  seo: {
    title:
      "Belliappa Norman-Butler is a hybrid art advisory practice based in London with an exemplary global portfolio of collection building in post-war and contemporary art, with a hand in some of the world’s most compelling collections.",
    description: "",
    image: "/meta-share.png",
  },
};

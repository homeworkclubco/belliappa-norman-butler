export type Site = {
  website: string;
  author: string;
  seo: {
    title: string;
    description: string;
    image: string;
  };
  jsonld: {
    organization: {
      name: string;
      url: string;
      logo: string;
      sameAs: string[];
    };
    localBusiness: {
      name: string;
      address: {
        streetAddress: string;
        addressLocality: string;
        postalCode: string;
        addressCountry: string;
      };
      telephone: string;
    };
  };
};

export const SITE: Site = {
  website: "https://bnb.art",
  author: "Belliappa Norman-Butler",
  seo: {
    title: "Belliappa Norman-Butler is a hybrid art advisory practice based in London with an exemplary global portfolio of collection building in post-war and contemporary art, with a hand in some of the world’s most compelling collections.",
    description: "",
    image: "https://example.com/og-image.png", // TODO: replace with actual default OG image
  },
  jsonld: {
    organization: {
      name: "Belliappa Norman-Butler",
      url: "https://bnb.art",
      logo: "https://bnb.art/logo.png", // TODO: replace with actual logo URL
      sameAs: [
        // TODO: add social profile URLs
      ],
    },
    localBusiness: {
      name: "Belliappa Norman-Butler",
      address: {
        streetAddress: "", // TODO: street address
        addressLocality: "London", // TODO: city
        postalCode: "",      // TODO: postcode
        addressCountry: "GB",
      },
      telephone: "", // TODO: phone number
    },
  },
};

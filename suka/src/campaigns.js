import R from "ramda";

const getPublishedCampaigns = (content) =>
  R.filter((j) => j.isPublished, R.values(content.campaigns || {}));

const getCampaignPages = (content) => {
  return R.map(
    (c) => ({
      path: `/campaigns/${c.slug}`,
      template: "src/templates/Campaign",
      getData: () => c,
    }),
    getPublishedCampaigns(content)
  );
};

export { getPublishedCampaigns, getCampaignPages };
import R from "ramda";

const getSitePages = (content) => {
  const sitePagesObj = R.mapObjIndexed(
    (val, key, obj) => ({
      path: `/${val.slug}`,
      template: "src/templates/Page",
      getData: () => val,
    }),
    content.pages
  );

  return R.values(sitePagesObj);
};

export { getSitePages };

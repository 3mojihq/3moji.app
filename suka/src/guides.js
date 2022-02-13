import * as R from "ramda";

const getPublishedGuides = (content) =>
  R.filter((j) => j.isPublished, R.values(content.guides));

const getGuidePages = (content) => {
  const guidePagesObj = R.mapObjIndexed(
    (val, key, obj) => ({
      path: `/guides/${val.slug}`,
      template: "src/templates/Guide",
      getData: () => val,
    }),
    getPublishedGuides(content)
  );

  return R.values(guidePagesObj);
};

const generateGuideIndex = (guidePages, guideChapterPages, guideSlug) => {
  const guide = R.find(R.propEq("path", `/guides/${guideSlug}`))(guidePages);
  const chapters = R.filter(
    (cp) => cp.getData().guideSlug === guideSlug,
    guideChapterPages
  );

  const chaptersWithData = R.map(
    (c) => ({
      ...R.dissoc("getData", c),
      data: R.dissoc("contents", c.getData()),
    }),
    chapters
  );

  const sortedChapters = R.sortBy(
    R.path(["data", "chapterNumber"]),
    chaptersWithData
  );

  return {
    guide: {
      ...R.dissoc("getData", guide),
      data: R.dissoc("contents", guide.getData()),
    },
    chapters: sortedChapters,
  };
};

const generateGuideIndices = (guidePages, guideChapterPages) => {
  return R.reduce(
    (acc, g) => {
      const guideSlug = g.getData().slug;
      return {
        ...acc,
        [guideSlug]: generateGuideIndex(
          guidePages,
          guideChapterPages,
          guideSlug
        ),
      };
    },
    {},
    guidePages
  );
};

const injectGuideIndex = (page, index) => {
  return {
    ...page,
    getData: () => ({ ...page.getData(), index }),
  };
};

const getGuideChapterPages = (content) => {
  const guideChapterPagesObj = R.mapObjIndexed(
    (val, key, obj) => ({
      path: `/guides/${val.guideSlug}/${val.slug}`,
      template: "src/templates/guide/Chapter",
      getData: () => val,
    }),
    content.guidechapters // why no camelcasing? because jdown doesn't read camel casing on mac
  );

  return R.values(guideChapterPagesObj);
};

const getGuideAndChapterPagesWithIndex = (content) => {
  const guidePagesWithoutIndex = getGuidePages(content);
  const guideChapterPagesWithoutIndex = getGuideChapterPages(content);
  const guideIndices = generateGuideIndices(
    guidePagesWithoutIndex,
    guideChapterPagesWithoutIndex
  );
  const guidePages = R.map(
    (g) => injectGuideIndex(g, guideIndices[g.getData().slug]),
    guidePagesWithoutIndex
  );
  const guideChapterPages = R.map(
    (gc) => injectGuideIndex(gc, guideIndices[gc.getData().guideSlug]),
    guideChapterPagesWithoutIndex
  );

  return { guidePages, guideChapterPages };
};

export {
  getPublishedGuides,
  getGuideChapterPages,
  getGuidePages,
  generateGuideIndex,
  generateGuideIndices,
  injectGuideIndex,
  getGuideAndChapterPagesWithIndex,
};

import path from "path";
import { rebuildRoutes } from "react-static/node";
import chokidar from "chokidar";
import { paramCase } from "change-case";
import R from "ramda";

import * as io from "./suka/src/io";
import * as guides from "./suka/src/guides";
import * as pages from "./suka/src/pages";
import * as people from "./suka/src/people";
import * as jobs from "./suka/src/jobs";
import * as campaigns from "./suka/src/campaigns";

const contentDir = "./content";

// chokidari keval dev mode main
if (process.env.REACT_STATIC_ENV === "development") {
  chokidar.watch(contentDir).on("all", () => {
    try {
      rebuildRoutes();
    } catch (e) {
      // it's okay
    }
  });
}

/********
 * Posts
 ********/

// need weak inequality check so objects with no `publishedOn` key return false
const isPublished = (post) => post.publishedOn != null;

const postsToPostPages = (posts) => {
  return R.map(
    (post) => ({
      path: `/blog/${post.slug}`,
      template: "src/templates/blog/Post",
      data: post,
    }),
    posts
  );
};

const relatedSlugs = (post) => R.pathOr([], ["data", "relatedSlugs"], post);

/**
   - for a given list of posts and a specific post,
   - find all posts related to this specific post,
   - by reading the `relatedSlugs` on the post
*/
const relatedPosts = (posts, post) => {
  const postRelatedSlugs = relatedSlugs(post);
  return R.filter((p) => R.contains(p.data.slug, postRelatedSlugs), posts);
};

const injectRelatedPosts = (posts) => (post) =>
  R.assocPath(["data", "relatedPosts"], relatedPosts(posts, post), post);

const rawDataToGetData = (post) => {
  // this has to be a constant to prevent it from being passed as a value
  // which causes a problem when data is stripped
  const postDataCopy = R.clone(post.data);
  return R.assoc("getData", () => postDataCopy, post);
};

const stripPostContents = (post) => R.dissocPath(["data", "contents"], post);

const stripRelatedPostsContent = (post) =>
  R.assocPath(
    ["data", "relatedPosts"],
    R.map(stripPostContents, post.data.relatedPosts),
    post
  );

const stripRelatedPosts = (post) =>
  R.dissocPath(["data", "relatedPosts"], post);

const injectAuthor = (authors) => (post) => {
  const author = R.find(R.propEq("slug", post.data.author))(R.values(authors));
  const authorWithoutContents = R.dissoc("contents", author);
  return R.assocPath(["data", "author"], authorWithoutContents, post);
};

const injectRelatedPostAuthors = (authors) => (post) => {
  const relatedPosts = R.pathOr([], ["data", "relatedPosts"], post);
  const withAuthors = R.map(injectAuthor(authors), relatedPosts);
  return R.assocPath(["data", "relatedPosts"], withAuthors, post);
};

/**
   - take an initial value of postPages and
   - transform it to the required form
 */
const transformPostPages = (postPages, authors) => (post) => {
  // R.compose works right to left, i.e.
  // the last fn will be applied first, followed by second last until first
  const transform = R.compose(
    rawDataToGetData,
    stripRelatedPostsContent,
    injectRelatedPostAuthors(authors),
    injectRelatedPosts(postPages),
    injectAuthor(authors)
  );

  return transform(post);
};

const sortByPublishDateDesc = (postPages) => {
  const dateDiff = (a, b) => {
    return (
      new Date(b.data.publishedOn).getTime() -
      new Date(a.data.publishedOn).getTime()
    );
  };

  return R.sort(dateDiff, postPages);
};

const byPublishYear = R.groupBy((postPage) =>
  new Date(postPage.data.publishedOn).getFullYear()
);

const topTags = (postPages, n) => {
  const tags = R.compose(
    R.countBy(R.identity),
    R.flatten
  )(R.map(({ data }) => data.tags, postPages));

  const tagsList = R.zip(R.keys(tags), R.values(tags));
  const sortedTagList = R.sortBy(R.prop(1))(tagsList);
  const topNTags = R.takeLast(n)(sortedTagList);
  return R.map(R.prop(0), topNTags);
};

export default {
  // siteRoot: "https://krimlabs.com",
  plugins: [
    "react-static-plugin-react-router",
    // "react-static-plugin-sitemap"
  ],
  getRoutes: async () => {
    const content = await io.getContent(contentDir);

    // posts
    /* const publishedPosts = R.filter(isPublished, R.values(content.posts));
     * const rawPostPages = postsToPostPages(publishedPosts);
     * const txfmFn = transformPostPages(rawPostPages, content.authors);
     * const postPages = R.map(txfmFn, rawPostPages);
     * const sortedPostPages = sortByPublishDateDesc(postPages);

     * const allPosts = R.map(
     *   R.compose(stripPostContents, stripRelatedPosts),
     *   sortedPostPages
     * );

     * const allPostsByYear = byPublishYear(allPosts);

     * const recentPosts = R.take(8, allPosts); */

    //
    const { guidePages, guideChapterPages } =
      guides.getGuideAndChapterPagesWithIndex(content);

    const sitePages = pages.getSitePages(content);

    const peoplePages = people.getPeoplePages(content);

    const jobPages = jobs.getJobPages(content);

    const campaignPages = campaigns.getCampaignPages(content);

    return [
      {
        path: "/",
        template: "src/templates/Landing.js",
        getData: () => ({ recentPosts: [], tags: [] }),
      },
      /* {
       *   path: "/blog",
       *   template: "src/templates/Blog",
       *   getData: () => ({
       *     allPostsByYear,
       *     allPosts,
       *     tags: topTags(allPosts, 10),
       *   }),
       * }, */
      /* {
       *   path: "/careers",
       *   template: "src/templates/Careers",
       *   getData: () => ({ jobs: jobsWithoutContents(content) }),
       * },
       */
      /*
       ...postPages,
      */
      ...campaignPages,
      ...jobPages,
      ...peoplePages,
      ...sitePages,
      ...guidePages,
      ...guideChapterPages,
    ];
  },
};

export {
  contentDir,
  isPublished,
  relatedSlugs,
  relatedPosts,
  injectRelatedPosts,
  postsToPostPages,
  stripRelatedPostsContent,
  stripPostContents,
  rawDataToGetData,
  injectRelatedPostAuthors,
  injectAuthor,
};

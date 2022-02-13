import * as R from "ramda";

const getPeoplePages = (content) => {
  return R.map(
    (a) => ({
      path: `/people/${a.slug}`,
      template: "src/templates/Person",
      getData: () => a,
    }),
    R.values(content.people)
  );
};

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

export { getPeoplePages, injectAuthor, injectRelatedPostAuthors };

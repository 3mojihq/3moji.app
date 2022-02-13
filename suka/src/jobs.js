import R from "ramda";
import marked from "marked";

const stripJobContents = (job) =>
  R.omit(["requirements", "responsibilities", "intro"], job);

const getPublishedJobs = (content) =>
  R.filter((j) => j.isPublished, R.values(content.jobs || {}));

const jobsWithoutContents = (content) =>
  R.map((j) => stripJobContents(j), getPublishedJobs(content));

/* Takes an object and a list of keys containing markdown.
 * Returns a new maps where values of the keys is converted from Markdown to Html.
 */
const convertMdKeysToHtml = (obj, keysToConvert) => {
  return R.mapObjIndexed((value, key) => {
    return R.contains(key, keysToConvert) ? marked.parse(value) : value;
  }, obj);
};

const getJobPages = (content) => {
  return R.map(
    (j) => ({
      path: `/jobs/${j.slug}`,
      template: "src/templates/Job",
      getData: () =>
        convertMdKeysToHtml(j, ["requirements", "responsibilities", "intro"]),
    }),
    getPublishedJobs(content)
  );
};

export { getJobPages };

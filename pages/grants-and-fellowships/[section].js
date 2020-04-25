import capitalize from 'lodash/capitalize';

import Layout from 'layouts/page';
import GrantsAndFellowships from 'layouts/grants-and-fellowships';

import routes from 'app/routes';

export const getStaticPaths = async () => {
  const paths = routes[
    '/grants-and-fellowships/[section]'
  ].allowedParams.section.map((key) => ({
    params: { section: key },
  }));

  return { paths, fallback: false };
};

export const getStaticProps = async ({ params }) => ({
  props: {
    title: `${capitalize(params?.section)} | Grants & Fellowships`
  }
});

const GrantsAndFellowshipsPage = (props) => (
  <Layout {...props}>
    <GrantsAndFellowships />
  </Layout>
);

export default GrantsAndFellowshipsPage;

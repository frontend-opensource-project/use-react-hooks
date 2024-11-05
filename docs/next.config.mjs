import nextra from 'nextra';

const withNextra = nextra('nextra-theme-docs', './theme.config.js');

const isProd = process.env.NODE_ENV === 'production';

export default withNextra({
  output: 'export',
  basePath: isProd ? '/use-react-hooks' : '',
  assetPrefix: isProd ? '/use-react-hooks/' : '',
  images: {
    unoptimized: true,
  },
});

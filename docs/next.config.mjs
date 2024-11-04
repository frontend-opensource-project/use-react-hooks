import nextra from 'nextra';

const withNextra = nextra('nextra-theme-docs', './theme.config.js');

export default withNextra({
  output: 'export',
  images: {
    unoptimized: true,
  },
});

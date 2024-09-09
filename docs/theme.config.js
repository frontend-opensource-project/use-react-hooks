export default {
  logo: <h3>useReactHooks</h3>,
  project: {
    link: 'https://github.com/frontend-opensource-project/use-react-hooks',
  },
  docsRepositoryBase:
    'https://github.com/frontend-opensource-project/use-react-hooks/docs',
  // SEO OPTION
  useNextSeoProps() {
    return {
      titleTemplate: '%s | URH',
    };
  },
  // COLOR
  primaryHue: { dark: 200, light: 200 },
  primarySaturation: { dark: 80, light: 80 },
  // SIDEBAR
  sidebar: {
    titleComponent({ title }) {
      console.log(title);
      if (title === '소개') {
        return <>💡 {title}</>;
      }
      if (title === '설치하기') {
        return <>🚩 {title}</>;
      }
      return <>{title}</>;
    },
  },
};

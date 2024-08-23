import useDeviceDetect from './hooks/useDeviceDetect';

function App() {
  const { isMobile, isTablet, isDesktop, os, browser } = useDeviceDetect();
  console.log(isMobile, isTablet, isDesktop, os, browser);
  return (
    <div>
      <h1>USE-REACT-HOOKS</h1>
    </div>
  );
}

export default App;

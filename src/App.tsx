import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import useIntersectionObserver from './hooks/useIntersectionObserver';

function App() {
  const [count, setCount] = useState(0);

  const { intersectionRef } = useIntersectionObserver({
    onChange: (isInView) => {
      if (isInView) {
        console.log('visible');
      } else {
        console.log('x');
      }
    },
    onEnter() {
      console.log('onEnter');
    },
    onLeave() {
      console.log('onLeave');
    },
  });
  // console.log(isView, '밖');
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div style={{ height: '540px' }} />
      <div ref={intersectionRef}>sdlfj</div>
      <div style={{ height: '800px' }} />
    </>
  );
}

export default App;

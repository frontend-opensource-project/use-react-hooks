import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import useIntersectionObserver from './hooks/useIntersectionObserver';

function App() {
  const [count, setCount] = useState(0);
  const { setRef, entry } = useIntersectionObserver({
    // root: document.getElementById('root'),
    // rootMargin: '20px',
    // threshold: [0.25, 0.5, 0.75],
  });
  // console.log(entry);

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
      <div className="card" style={{ height: '1000px' }}>
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
      <div ref={setRef} style={{ height: '300px', border: '1px solid black' }}>
        <h1
          style={entry?.isIntersecting ? { backgroundColor: 'lightblue' } : {}}>
          Intersection State
        </h1>
        <div>isIntersecting: {entry?.isIntersecting.toString()}</div>
        <div>intersectionRatio: {entry?.intersectionRatio}</div>
        <div style={{ height: '1000px' }}></div>
      </div>
    </>
  );
}

export default App;

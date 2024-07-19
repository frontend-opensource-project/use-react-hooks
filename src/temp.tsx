import useMousePos from './hooks/useMousePos';

const App = () => {
  const {
    viewX,
    viewY,
    pageX,
    pageY,
    screenX,
    screenY,
    elementX,
    elementY,
    targetRef,
  } = useMousePos();

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd' }}>
      <div style={{ height: '500px' }}></div>
      <h3>Mouse Position</h3>
      <div>
        <strong>Client Coordinates (viewX, viewY):</strong>
        <p>X: {viewX !== null ? `${viewX}px` : 'N/A'}</p>
        <p>Y: {viewY !== null ? `${viewY}px` : 'N/A'}</p>
      </div>
      <div>
        <strong>Page Coordinates (pageX, pageY):</strong>
        <p>X: {pageX !== null ? `${pageX}px` : 'N/A'}</p>
        <p>Y: {pageY !== null ? `${pageY}px` : 'N/A'}</p>
      </div>
      <div>
        <strong>Screen Coordinates (screenX, screenY):</strong>
        <p>X: {screenX !== null ? `${screenX}px` : 'N/A'}</p>
        <p>Y: {screenY !== null ? `${screenY}px` : 'N/A'}</p>
      </div>
      <div>
        <strong>Element Coordinates (elementX, elementY):</strong>
        <p>X: {elementX !== null ? `${elementX}px` : 'N/A'}</p>
        <p>Y: {elementY !== null ? `${elementY}px` : 'N/A'}</p>
      </div>
      <div
        ref={targetRef}
        style={{
          marginTop: '20px',
          padding: '10px',
          border: '1px solid #000',
          backgroundColor: '#f9f9f9',
        }}>
        <strong>
          Move your mouse around the screen to see the coordinates relative to
          this box.
        </strong>
      </div>
    </div>
  );
};

export default App;

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import useHover from './useHover';

const TestComponent = () => {
  const { isHovered, callbackRef } = useHover<HTMLDivElement>();

  return (
    <div data-testid="test-component" ref={callbackRef}>
      {`${isHovered}`}
    </div>
  );
};

describe('useHover', () => {
  let testComponent: HTMLElement;

  beforeEach(() => {
    render(<TestComponent />);
    testComponent = screen.getByTestId('test-component');
  });

  test('hovered의 초깃값은 false이다.', () => {
    expect(testComponent).toHaveTextContent('false');
  });

  test('ref 컴포넌트에 mouseenter 시 hovered의 값은 true이다.', () => {
    fireEvent.mouseEnter(testComponent);
    expect(testComponent).toHaveTextContent('true');
  });

  test('ref 컴포넌트에 mouseenter 후 mouseleave 시 hovered의 값은 false이다.', () => {
    fireEvent.mouseEnter(testComponent);
    expect(testComponent).toHaveTextContent('true');
    fireEvent.mouseLeave(testComponent);
    expect(testComponent).toHaveTextContent('false');
  });
});

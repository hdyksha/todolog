import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { axe } from '../../tests/axe-helper';
import Button from './Button';

describe('Button コンポーネントのアクセシビリティ', () => {
  it('通常状態でアクセシビリティ違反がないこと', async () => {
    const { container } = render(<Button>クリック</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('無効状態でもアクセシビリティ違反がないこと', async () => {
    const { container } = render(<Button disabled>クリック</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ローディング状態でもアクセシビリティ違反がないこと', async () => {
    const { container } = render(<Button isLoading>クリック</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('アイコン付きでもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Button icon={<span aria-hidden="true">★</span>}>クリック</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

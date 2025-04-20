import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { axe } from '../../tests/axe-helper';
import Select from './Select';

describe('Select コンポーネントのアクセシビリティ', () => {
  const mockOptions = [
    { value: 'option1', label: 'オプション1' },
    { value: 'option2', label: 'オプション2' },
    { value: 'option3', label: 'オプション3' },
  ];

  const mockOnChange = vi.fn();

  it('基本的な選択肢でアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Select
        name="test-select"
        label="テスト選択"
        value="option1"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('必須フィールドでもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Select
        name="test-select"
        label="テスト選択"
        value="option1"
        options={mockOptions}
        onChange={mockOnChange}
        required
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('エラー状態でもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Select
        name="test-select"
        label="テスト選択"
        value=""
        options={mockOptions}
        onChange={mockOnChange}
        error="選択は必須です"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('プレースホルダー付きでもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Select
        name="test-select"
        label="テスト選択"
        value=""
        options={mockOptions}
        onChange={mockOnChange}
        placeholder="選択してください"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('複数選択でもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Select
        name="test-select"
        label="テスト選択"
        value={['option1', 'option2']}
        options={mockOptions}
        onChange={mockOnChange}
        multiple
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

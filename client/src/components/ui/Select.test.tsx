import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import Select, { SelectOption } from './Select';

describe('Select コンポーネント', () => {
  const options: SelectOption[] = [
    { value: 'option1', label: 'オプション1' },
    { value: 'option2', label: 'オプション2' },
    { value: 'option3', label: 'オプション3' },
  ];
  
  const mockOnChange = vi.fn();
  
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('基本的なレンダリングが正しく行われる', () => {
    render(
      <Select
        name="test-select"
        value="option1"
        options={options}
        onChange={mockOnChange}
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveValue('option1');
    
    // すべてのオプションが表示されていることを確認
    options.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('ラベルが正しく表示される', () => {
    const label = 'テストラベル';
    render(
      <Select
        name="test-select"
        value="option1"
        options={options}
        onChange={mockOnChange}
        label={label}
      />
    );
    
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('必須マークが表示される', () => {
    render(
      <Select
        name="test-select"
        value="option1"
        options={options}
        onChange={mockOnChange}
        label="テストラベル"
        required
      />
    );
    
    const labelElement = screen.getByText('テストラベル');
    expect(labelElement.parentElement).toContainHTML('<span class="required-mark">*</span>');
  });

  it('エラーメッセージが表示される', () => {
    const errorMessage = 'エラーが発生しました';
    render(
      <Select
        name="test-select"
        value="option1"
        options={options}
        onChange={mockOnChange}
        error={errorMessage}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('無効状態が正しく適用される', () => {
    render(
      <Select
        name="test-select"
        value="option1"
        options={options}
        onChange={mockOnChange}
        disabled
      />
    );
    
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('プレースホルダーが表示される', () => {
    const placeholder = '選択してください';
    render(
      <Select
        name="test-select"
        value=""
        options={options}
        onChange={mockOnChange}
        placeholder={placeholder}
      />
    );
    
    expect(screen.getByText(placeholder)).toBeInTheDocument();
  });

  it('オプション選択時に onChange が呼ばれる', () => {
    render(
      <Select
        name="test-select"
        value="option1"
        options={options}
        onChange={mockOnChange}
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'option2' } });
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    // イベントオブジェクトの検証は複雑なので、呼び出し回数のみ確認
  });

  it('複数選択モードが正しく適用される', () => {
    render(
      <Select
        name="test-select"
        value={['option1']}
        options={options}
        onChange={mockOnChange}
        multiple
      />
    );
    
    const selectElement = screen.getByRole('listbox');
    expect(selectElement).toHaveAttribute('multiple');
  });

  it('カスタムクラス名が適用される', () => {
    const customClass = 'custom-select';
    render(
      <Select
        name="test-select"
        value="option1"
        options={options}
        onChange={mockOnChange}
        className={customClass}
      />
    );
    
    const containerElement = screen.getByRole('combobox').parentElement;
    expect(containerElement).toHaveClass(customClass);
  });
});

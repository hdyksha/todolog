import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { axe } from '../../tests/axe-helper';
import Input from './Input';

describe('Input コンポーネントのアクセシビリティ', () => {
  it('ラベル付きでアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Input 
        label="ユーザー名" 
        name="username" 
        placeholder="ユーザー名を入力" 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('必須フィールドでもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Input 
        label="メールアドレス" 
        name="email" 
        type="email" 
        required 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('エラー状態でもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Input 
        label="パスワード" 
        name="password" 
        type="password" 
        error="パスワードは8文字以上必要です" 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ヘルパーテキスト付きでもアクセシビリティ違反がないこと', async () => {
    const { container } = render(
      <Input 
        label="パスワード" 
        name="password" 
        type="password" 
        helperText="8文字以上の英数字を含むパスワードを設定してください" 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

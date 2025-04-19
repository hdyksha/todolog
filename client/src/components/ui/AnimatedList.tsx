import React, { ReactNode } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './AnimatedList.css';

interface AnimatedListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  className?: string;
  transitionName?: string;
  timeout?: number;
}

/**
 * アニメーション付きのリストコンポーネント
 * アイテムの追加・削除時にアニメーションを表示する
 */
function AnimatedList<T>({
  items,
  keyExtractor,
  renderItem,
  className = '',
  transitionName = 'task-item',
  timeout = 300,
}: AnimatedListProps<T>) {
  return (
    <ul className={`animated-list ${className}`}>
      <TransitionGroup component={null}>
        {items.map((item) => (
          <CSSTransition
            key={keyExtractor(item)}
            timeout={timeout}
            classNames={transitionName}
          >
            <li className="animated-list__item">
              {renderItem(item)}
            </li>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </ul>
  );
}

export default AnimatedList;

import React from 'react';
import styles from '@/styles/components/CodeInputBox.module.scss';

export interface CodeInputBoxProps {
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
}

export default function CodeInputBox({
  onDoubleClick,
  disabled,
}: CodeInputBoxProps) {
  const [code, setCode] = React.useState('');

  return (
    <div className={styles.codeInputBox} onDoubleClick={onDoubleClick}>
      <input
        // placeholder="输入文件码或双击..."
        className={styles.codeInputElement}
        maxLength={12}
        value={code}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key == 'Enter') {
            window.location.href = '/file/' + code;
          }
        }}
        onChange={(e) => {
          // First delete original '-'
          const tempCode = e.target.value.replace(/-/g, '');
          // Split tempCode by 4 digit from the right
          const length = tempCode.length;
          const groupAmount =
            length % 4 === 0 ? length / 4 : Math.floor(length / 4) + 1;
          if (groupAmount == 1) {
            setCode(tempCode);
            return;
          }
          const result: string[] = [];
          for (let i = 0; i < groupAmount; i++) {
            const start = i == groupAmount - 1 ? 0 : length - (i + 1) * 4;
            const end = length - i * 4;
            const group = tempCode.substring(start, end);
            result.push(group);
          }
          setCode(result.reverse().join('-'));
        }}
      ></input>
    </div>
  );
}

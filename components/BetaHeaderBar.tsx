import React from 'react';
import styles from '../styles/components/HeaderBar.module.scss';

export default function BetaHeaderBar() {
  return (
    <div className={styles.betaHeaderBar}>
      <span className={styles.headerText}>
        <b>注意: </b>本站目前处于测试阶段。
      </span>
    </div>
  );
}

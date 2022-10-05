import React from 'react';
import styles from '../styles/components/HeaderBar.module.scss';

export interface CloudHeaderBarProp {
  homepage?: boolean;
}

export default function CloudCommonHeader({ homepage }: CloudHeaderBarProp) {
  return (
    <div className={styles.cloudHeaderBar}>
      <span className={styles.headerText}>A zeithrold.cloud project</span>
      {homepage ? null : (
        <a href="https://zeithrold.cloud" className={styles.headerLink}>
          Home
        </a>
      )}
    </div>
  );
}

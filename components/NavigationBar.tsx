import Link from 'next/link';
import React from 'react';
import styles from '@/styles/components/NavigationBar.module.scss';

export interface NavigationBarProps {
  username?: string;
}

export default function NavigationBar({ username }: NavigationBarProps) {
  const loginUrl =
    '/api/v1/auth/login?redirect_uri=' +
    encodeURIComponent(process.env.ZEITHROLD_ENDPOINT!);
  return (
    <div className={styles.navigationBar}>
      <div className={styles.navigationTitle}>
        <Link href="/">文件中转站</Link>
      </div>
      <div className={styles.navigationAccountText}>
        {username ? (
          <Link href="/my">
            <span>
              你好，<b>{username}</b>
            </span>
          </Link>
        ) : (
          <a href={loginUrl}>
            <b>登录</b>
          </a>
        )}
      </div>
    </div>
  );
}

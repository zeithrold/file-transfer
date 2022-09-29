import React from 'react'
import styles from '../styles/components/HeaderBar.module.scss'

export default function BetaHeaderBar() {
  return (
    <div className={styles.betaHeaderBar}>
      <span className={styles.headerText}><b>WARNING: </b>This site is currently in beta.</span>
    </div>
  )
}

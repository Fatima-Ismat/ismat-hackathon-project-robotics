import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

export default function ProgressIndicator(): React.JSX.Element {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const calculateScrollPercentage = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      const scrollableHeight = documentHeight - windowHeight;
      const percentage = scrollableHeight > 0
        ? (scrollTop / scrollableHeight) * 100
        : 0;

      setScrollPercentage(Math.min(percentage, 100));
    };

    calculateScrollPercentage();
    window.addEventListener('scroll', calculateScrollPercentage);
    window.addEventListener('resize', calculateScrollPercentage);

    return () => {
      window.removeEventListener('scroll', calculateScrollPercentage);
      window.removeEventListener('resize', calculateScrollPercentage);
    };
  }, []);

  return (
    <div className={styles.progressContainer}>
      <div
        className={styles.progressBar}
        style={{ width: `${scrollPercentage}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollPercentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

import clsx from 'clsx';
import {
  BRAND_NAME,
  UPSTREAM_NAME,
  UPSTREAM_REPOSITORY,
  sourceCodeUrl,
} from '@gitroom/helpers/utils/brand';

// AGPL-3.0 section 13: offer every user the Corresponding Source of the exact
// running version. The link resolves to the deployed commit (see brand.ts).
export const SourceCodeNotice = ({ className }: { className?: string }) => {
  return (
    <p className={clsx('text-[12px] leading-[1.6] text-textItemBlur', className)}>
      {BRAND_NAME} is based on{' '}
      <a
        href={UPSTREAM_REPOSITORY}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-[var(--new-accent-text)]"
      >
        {UPSTREAM_NAME}
      </a>{' '}
      and licensed under the{' '}
      <a
        href="https://www.gnu.org/licenses/agpl-3.0.html"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-[var(--new-accent-text)]"
      >
        GNU AGPL-3.0
      </a>
      .{' '}
      <a
        href={sourceCodeUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="font-[600] text-[var(--new-accent-text)] underline underline-offset-2"
      >
        Source code
      </a>
    </p>
  );
};

import * as React from 'react';

interface IDownloadButtonProps {
  label: string;
  blob: Blob;
  filename: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const DownloadButton = React.forwardRef<HTMLAnchorElement, IDownloadButtonProps>(({ label, blob, filename, children, style = null }: IDownloadButtonProps, ref) => {
  // const $a = useRef<HTMLAnchorElement>(null);
  return (
    <a className='btn btn-secondary text-nowrap' style={style} ref={ref} download={filename} href={window.URL.createObjectURL(blob)}>
      {children ?? label}
    </a>
  );
});

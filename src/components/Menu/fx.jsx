/**
 * @summary the right style according to scroll move
 * @param {boolean} isUp if the scroll went up
 */
const _getScrollClass = (isUp) => {
  if (isUp) {
    return `sidebar sidebar-desktop sidebar-up`;
  }
  if (document.getElementById('dapp')) {
    const viewport = document.getElementById('dapp');
    const st = viewport.scrollTop;
    if (st > 0) {
      return `sidebar sidebar-desktop sidebar-down`;
    }
  }
  return `sidebar sidebar-desktop`;
};

export const getScrollClass = _getScrollClass;

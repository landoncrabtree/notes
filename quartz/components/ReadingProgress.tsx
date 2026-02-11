import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ReadingProgress: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return <div class={`reading-progress-container ${displayClass ?? ""}`}>
    <div id="reading-progress-bar" />
  </div>
}

ReadingProgress.css = `
.reading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 99998;
  background: transparent;
}

#reading-progress-bar {
  height: 100%;
  width: 0%;
  background: var(--secondary);
  transition: width 80ms linear;
}
`

ReadingProgress.afterDOMLoaded = `
const bar = document.getElementById("reading-progress-bar");
if (bar) {
  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight > 0) {
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      bar.style.width = progress + "%";
    }
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();
}
`

export default (() => ReadingProgress) satisfies QuartzComponentConstructor

import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Landon Crabtree",
    pageTitleSuffix: " | Landon Crabtree",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "umami",
      host: "https://cloud.umami.is",
      websiteId: "6210b34a-ab86-4492-8319-20ceb2a1190f"
    },
    locale: "en-US",
    baseUrl: "notes.landon.pw",
    ignorePatterns: ["**/private", "**/templates", "**/.obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        title: "JetBrains Mono",
        header: "JetBrains Mono",
        body: "Space Grotesk",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#eef0f2",
          lightgray: "#d8dce2",
          gray: "#8892a2",
          darkgray: "#3d4551",
          dark: "#1a1e26",
          secondary: "#008a24",
          tertiary: "#007a6e",
          highlight: "rgba(0, 138, 36, 0.08)",
          textHighlight: "rgba(0, 122, 110, 0.12)",
        },
        darkMode: {
          light: "#0b0e14",
          lightgray: "#131820",
          gray: "#3b4558",
          darkgray: "#8a95a8",
          dark: "#c5ced9",
          secondary: "#00e539",
          tertiary: "#00ffcc",
          highlight: "rgba(0, 229, 57, 0.07)",
          textHighlight: "rgba(0, 255, 204, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "vitesse-light",
          dark: "vitesse-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config

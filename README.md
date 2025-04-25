# The unregulated link in a toxic supply chain

This repository contains the source code for the scroll-linked animation in Grist's piece, ["The unregulated link in a toxic supply chain"](https://grist.org/health/ethylene-oxide-el-paso-texas-unregulated-toxic-warehouse/), reported by [Naveena Sadasivam](https://grist.org/author/naveena-sadasivam/) and [Lylla Younes](https://grist.org/author/lylla-younes/). Video production for this animation was handled by Jesse Nichols, while [Parker Ziegler](https://parkie-doo.sh/) handled the TypeScript implementation to bring it to the web.

## Repository Structure

The primary code for the animation lives in the `packages/interactive` directory. We use [Vite](https://vite.dev/) as our build tool, [pnpm](https://pnpm.io/) as our package manager, [TypeScript](https://www.typescriptlang.org/) as our scripting language, and [Tailwind](https://tailwindcss.com/) for styling.

The `packages/scripts` directory contains scripts for deploying static assets and build outputs to Grist's private S3 bucket. Ideally, you shouldn't need to touch any of this!

### Getting Started

To get the application running locally, first ensure you have the following installed:

- Node.js >= 18
  - Ideally, you should install Node's LTS (long-term stable release). At the time of writing, this is v22.13.1.
- pnpm

Then, from the repository root, run the following:

```sh
pnpm install
cd packages/interactive
pnpm dev
```

This will start a local development server at http://localhost:5173/. All changes you make to local files should be reflected immediately thanks to Vite's [hot module replacement](https://vite.dev/guide/features.html#hot-module-replacement).

## Styling

This project uses Tailwind for styling, a utility-first CSS framework. If you're uncomfortable with Tailwind, you can still write plain CSS in `packages/interactive/src/index.css` as needed. At Grist, we disable Tailwind's [preflight](https://tailwindcss.com/docs/preflight) to avoid conflicting with the global CSS on grist.org.

### Grist-Specific Styling

At Grist, we have a few quirks in our global site CSS that we have to work around for bespoke interactives.

1. **Achieving full bleed.** Typically, you can achieve a full bleed effect with something like the following ([taken from Andy Bell at Piccalilli](https://piccalil.li/blog/creating-a-full-bleed-css-utility/)):

```css
.full-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}
```

We have some additional hurdles our end that makes this slightly more annoying, so you may not need all the CSS we have! Editing the `#scrolly-content` selector in `packages/interactive/src/index.css` would be the right place to start.

2. **The Grist appeal bar.** We have a sticky positioned appeal bar that we account for when making full screen content. The `.top-with-appeal-bar` and `.h-screen-with-appeal-bar` classes show this off. Again, you may not need this (or may need to adjust it) if your site is different!

## Building the Project

To build the project for production, run the following from `packages/interactive`:

```sh
pnpm build
```

This will build the application into a single JavaScript file and a single CSS file, written to the `packages/interactive/dist` directory.

## Deployment

At Grist, we deploy the static build outputs to our private S3 bucket and serve them over Digital Ocean's CDN. Then, in WordPress, we create a custom HTML block containing both the HTML of the interactive (located in `packages/interactive/index.html`) and the following HTML to inject the relevant `script` tag and create a `link` tag appended to the `document` `head`.

```html
<script
  type="module"
  crossorigin=""
  src="https://grist.nyc3.cdn.digitaloceanspaces.com/eto-pt3/dist/assets/<file-name>.js"
></script>
<script>
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.crossOrigin = "";
  link.href =
    "https://grist.nyc3.cdn.digitaloceanspaces.com/eto-pt3/dist/assets/<file-name>.css";

  document.head.appendChild(link);
</script>
```

In an ideal world, we'd be able to just place `script` and `link` tags directly into the `document` `head`. While this is not possible in our setup today, I hope it is for you! If hosting the interactive on your site, you'll need to roll your own solution for storing and accessing build outputs.

## Static Assets

This interactive involves animating an image sequence to give the illusion of scrubbing through a video on scroll. As such, we need an image server! Again, we (ab)use Grist's S3 bucket and the Digital Ocean CDN for this purpose.

To run this interactive on your own site, you'll need to host the images on your own server or object storage. The raw PNG and WebP assets are available in `packages/interactive/public`, with separate assets for mobile, tablet, and desktop. Finally, you'll need to update the `base` value in `packages/interactive/vite.config.js` to point to your image server.

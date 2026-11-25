# Website
The source code for our website, [hhsevgp.org](https://hhsevgp.org/).

### Building Tailwind CSS
This site is built using [Tailwind CSS](https://tailwindcss.com/). If you would like to modify it, follow the instructions on [their page](https://tailwindcss.com/docs/installation/tailwind-cli) to install the CLI. Then run the following to automatically update `style.css`:

```
tailwindcss -i input.css -o style.css --watch
```

### html Page Paths
Links between pages use clean URLs (ie. GitHub Pages automatically serves `contact.html` when someone visits `/contact`), so the links will not work if you simply open index.html in a browser.

To preview the site locally, use a server that supports clean URLs, for example:

```
npx serve .
```

# Style guides

The agents write to whichever style guide is active. Each guide is a folder in this directory.

```
style-guides/
  default/                  Plain-language guide that ships with the app
    style-guide.md
    content-type-rules.md
  custom/                   Your own guides (ignored by git, never published)
    my-company/
      style-guide.md
      content-type-rules.md   (optional)
```

## Add your own guide

1. Create a folder: `style-guides/custom/my-company/`.
2. Add a `style-guide.md` file. Start it with a `# Heading` that names the guide.
3. Optionally add a `content-type-rules.md` file for rules that depend on the asset type.
4. Start the app, open **Settings**, and choose your guide under **Style guide**.

Guides in `custom/` stay on your machine. They are listed in `.gitignore`, so they can't be committed by accident. If you want to share a guide, move its folder up to `style-guides/` and commit it.

## Tips for writing a guide the model follows

- Write rules as short, testable statements ("Use sentence-style capitalization for headings").
- Show a right and a wrong example for any rule that is easy to misread.
- Put the rules that matter most near the top. Very long guides are trimmed to fit the context window.
- Keep format-specific rules in `content-type-rules.md` so the base guide stays short.

## Size limit

The active guide is added to every prompt. The app includes up to 40,000 characters of it and tells you in the console when it trims.

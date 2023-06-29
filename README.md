![Logo Image](https://github.com/AidanWelch/ProgressiveImmersion/blob/main/src/images/logo-96.png?raw=true)
# ProgressiveImmersion
A browser extension that progressively immerses you in a language.

## Features:

- Fully Open-Source
- Automatic translation for any language supported by Google Translate
- Add words manually as you learn them to practice
- Customize how frequently you're introduced to new words
- Blacklist or whitelist websites

## Coming soon:

- Export and import dictionaries
- Import custom wordpacks for a more guided learning experience
- Have multiple active target languages at a time

# Download

## [Firefox](https://addons.mozilla.org/en-US/firefox/addon/progressive-immersion/)

## [Chrome](https://chrome.google.com/webstore/detail/progressive-immersion/glhikloekamfeiakikebcndppkgldloj)

## Build

Just two commands!

For Firefox:
```
npm install -D
npm run build-v2
```

For Chromium:
```
npm install -D
npm run build-v3
```

And a development server can be run with just three!

```
npm install -D
npm run serve-pack-v[2 or 3]
```

and then in a seperate shell

```
npm run serve-ext-v[2 or 3]
```

And for reviewers:

```
OS: Windows 11 22H2
Node: v18.3.0
npm: 8.11.0
```

## Will not fix issues:
* Languages that do not seperate words with whitespace cannot work as origin/source languages.  To fix this would require knowledge of each language that I do not have.  You can fix it yourself, or if you don't have the technical ability but do have the knowledge of one such language you can contact me at the email on my Github profile.
